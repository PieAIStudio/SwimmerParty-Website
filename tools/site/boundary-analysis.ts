import path from "node:path";
import { builtinModules } from "node:module";
import ts from "typescript";

export type BoundarySources = ReadonlyMap<string, string>;
export type BoundaryIssue = { file: string; message: string };
const builtins = new Set(builtinModules.map((name) => name.replace(/^node:/, "")));
const serverImports = new Set(["server-only", "next/headers", "next/server", "next/cache"]);
const featureOf = (file: string) => file.match(/^src\/features\/([^/]+)\//)?.[1];
const isFeatureEntry = (file: string) =>
  /^src\/features\/[^/]+\/(?:index|client|queries|contracts|server(?:\/index)?)\.tsx?$/.test(file);
const isServerFile = (file: string) => /(?:^|\/)server(?:\/|\.tsx?$)/.test(file);

/** Value-import topology, including dynamic imports and transitive browser boundaries. */
export function analyzeBoundaries(sources: BoundarySources): BoundaryIssue[] {
  const issues: BoundaryIssue[] = [];
  const graph = new Map<string, string[]>();
  const clientRoots = new Set<string>();
  const serverFiles = new Set<string>();
  const issue = (file: string, message: string) => issues.push({ file, message });
  function targetOf(from: string, spec: string): string | null {
    const base = spec.startsWith("@/")
      ? `src/${spec.slice(2)}`
      : spec.startsWith(".")
        ? path.posix.normalize(path.posix.join(path.posix.dirname(from), spec))
        : null;
    if (!base) return null;
    const stem = base.replace(/\.[cm]?js$/, "");
    for (const candidate of [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}/index.ts`,
      `${base}/index.tsx`,
      `${stem}.ts`,
      `${stem}.tsx`,
    ])
      if (sources.has(candidate)) return candidate;
    if (!/\.(json|css|svg|png|woff2?)$/.test(base))
      issue(from, `Unresolved internal import: ${spec}`);
    return null;
  }
  for (const [file, source] of sources) {
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const edges: string[] = [];
    graph.set(file, edges);
    if (
      tree.statements.some(
        (node) =>
          ts.isExpressionStatement(node) &&
          ts.isStringLiteral(node.expression) &&
          node.expression.text === "use client",
      )
    )
      clientRoots.add(file);
    if (isServerFile(file)) serverFiles.add(file);
    function addImport(spec: string) {
      if (spec.startsWith("node:") || builtins.has(spec) || serverImports.has(spec))
        serverFiles.add(file);
      const target = targetOf(file, spec);
      if (!target) return;
      edges.push(target);
      if (file.startsWith("src/content/") && /^src\/(features|app|site|lib|config)\//.test(target))
        issue(file, `Content is data; it cannot depend on ${target}`);
      if (file.startsWith("src/lib/") && /^src\/(features|app|site|content|config)\//.test(target))
        issue(file, `Generic utilities cannot depend on ${target}`);
      if (file.startsWith("src/contracts/") && !target.startsWith("src/contracts/"))
        issue(file, `Contracts cannot depend on ${target}`);
      if (file.startsWith("src/site/") && target.startsWith("src/features/"))
        issue(file, `Visual primitives take composition as props, not a feature import: ${target}`);
      const feature = featureOf(file),
        other = featureOf(target);
      if (other && feature !== other && !isFeatureEntry(target))
        issue(file, `Private feature import: ${target}`);
      if (target.startsWith("src/app/") && !file.startsWith("src/app/"))
        issue(file, `Route back-reference: ${target}`);
    }
    function visit(node: ts.Node) {
      if (
        file.startsWith("src/content/") &&
        (ts.isFunctionDeclaration(node) ||
          ts.isFunctionExpression(node) ||
          ts.isArrowFunction(node) ||
          ts.isMethodDeclaration(node))
      )
        issue(file, "Content contains behavior; move its query/formatting into the owning feature");
      if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const clause = node.importClause;
        const typeOnly =
          clause?.isTypeOnly ||
          (clause?.namedBindings &&
            ts.isNamedImports(clause.namedBindings) &&
            !clause.name &&
            clause.namedBindings.elements.every((item) => item.isTypeOnly));
        if (!typeOnly) addImport(node.moduleSpecifier.text);
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteralLike(node.moduleSpecifier)
      ) {
        const typeOnly =
          node.isTypeOnly ||
          (node.exportClause &&
            ts.isNamedExports(node.exportClause) &&
            node.exportClause.elements.every((item) => item.isTypeOnly));
        if (!typeOnly) addImport(node.moduleSpecifier.text);
      } else if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require"))
      ) {
        const argument = node.arguments[0];
        if (argument && ts.isStringLiteralLike(argument)) addImport(argument.text);
        else issue(file, "Non-literal module loading cannot be checked");
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
    if (file.startsWith("src/pages/api/"))
      for (const node of tree.statements) {
        const config =
          ts.isVariableStatement(node) &&
          node.declarationList.declarations.every((item) => item.name.getText(tree) === "config");
        if (
          !(
            ts.isImportDeclaration(node) ||
            ts.isExportDeclaration(node) ||
            config ||
            (ts.isExportAssignment(node) && ts.isIdentifier(node.expression))
          )
        )
          issue(file, "API routes must only re-export a handler and declare route configuration");
      }
  }
  const state = new Map<string, number>();
  function visitCycle(file: string, stack: string[]) {
    if (state.get(file) === 1) {
      issue(file, `Import cycle: ${[...stack.slice(stack.indexOf(file)), file].join(" -> ")}`);
      return;
    }
    if (state.get(file) === 2) return;
    state.set(file, 1);
    for (const target of graph.get(file) ?? []) visitCycle(target, [...stack, file]);
    state.set(file, 2);
  }
  for (const file of graph.keys()) visitCycle(file, []);
  for (const root of clientRoots) {
    const seen = new Set<string>();
    function walk(file: string, chain: string[]) {
      if (seen.has(file)) return;
      seen.add(file);
      if (serverFiles.has(file)) {
        issue(root, `Browser imports server capability: ${[...chain, file].join(" -> ")}`);
        return;
      }
      for (const target of graph.get(file) ?? []) walk(target, [...chain, file]);
    }
    walk(root, []);
  }
  return [...new Map(issues.map((item) => [`${item.file}:${item.message}`, item])).values()];
}
