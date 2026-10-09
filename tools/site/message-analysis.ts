import ts from "typescript";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative } from "node:path";

type MessageIssue = { file: string; line: number; message: string };
export type MessageAnalysis = {
  used: Set<string>;
  unused: string[];
  issues: MessageIssue[];
  dynamicEvidence: { file: string; line: number; reference: string; keys: string[] }[];
};
type Vocabulary = { series: { id: string; perLook: boolean; slots: { key: string }[] }[] };
const excluded =
  /(?:\.test\.|\.spec\.|\.d\.ts$|(?:^|\/)__fixtures__\/|(?:^|\/)fixtures\/|\.generated\.)/;
function isRuntimeSource(file: string): boolean {
  const normalized = file.replaceAll("\\", "/");
  return (
    normalized.startsWith("src/") &&
    /\.tsx?$/.test(normalized) &&
    !excluded.test(normalized) &&
    ![
      "src/i18n/messages.source.ts",
      "src/i18n/message-contracts.ts",
      "src/i18n/catalog.ts",
    ].includes(normalized)
  );
}
export function runtimeSources(root = process.cwd()): Record<string, string> {
  return Object.fromEntries(
    readdirSync(resolve(root, "src"), { recursive: true })
      .map((file) => `src/${file}`)
      .filter(isRuntimeSource)
      .map((file) => [file, readFileSync(resolve(root, file), "utf8")]),
  );
}
function unwrap(node: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  )
    node = node.expression;
  return node;
}
function literals(type: ts.Type): string[] | undefined {
  if (type.isUnion()) {
    const parts = type.types.map(literals);
    return parts.every((part) => part !== undefined) ? (parts.flat() as string[]) : undefined;
  }
  if (type.isStringLiteral() || type.isNumberLiteral()) return [String(type.value)];
  return undefined;
}
/** Resolve finite expressions, never trust an `as MessageKey` cast as a consumer. */
function finite(node: ts.Expression, checker: ts.TypeChecker): string[] | undefined {
  node = unwrap(node);
  if (ts.isStringLiteralLike(node)) return [node.text];
  if (ts.isConditionalExpression(node)) {
    const yes = finite(node.whenTrue, checker),
      no = finite(node.whenFalse, checker);
    return yes && no ? [...yes, ...no] : undefined;
  }
  if (ts.isTemplateExpression(node)) {
    let values = [node.head.text];
    for (const span of node.templateSpans) {
      const part = finite(span.expression, checker);
      if (!part) return undefined;
      values = values.flatMap((prefix) => part.map((value) => prefix + value + span.literal.text));
    }
    return values;
  }
  if (ts.isIdentifier(node)) {
    const declaration = declarationOf(node, checker);
    if (
      declaration &&
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      (declaration.type || unwrap(declaration.initializer) !== declaration.initializer)
    )
      return finite(declaration.initializer, checker);
  }
  return literals(checker.getTypeAtLocation(node));
}
function declarationOf(node: ts.Expression, checker: ts.TypeChecker) {
  let symbol = checker.getSymbolAtLocation(node);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return symbol?.valueDeclaration;
}
/**
 * The existing slotLabelKey API understates its return type (slot keys only).
 * Expand ONLY calls to that exact runtime function, from the actual vocabulary,
 * and require its three return templates to retain the reviewed spelling.
 * No catalog prefix is allowed wholesale; new catalog keys stay unused.
 */
function slotKeys(node: ts.Expression, checker: ts.TypeChecker, vocabulary?: Vocabulary) {
  if (!ts.isCallExpression(node) || !vocabulary) return undefined;
  const declaration = declarationOf(node.expression, checker);
  if (
    !declaration ||
    !ts.isFunctionDeclaration(declaration) ||
    declaration.name?.text !== "slotLabelKey" ||
    !declaration
      .getSourceFile()
      .fileName.replaceAll("\\", "/")
      .endsWith("/src/features/assets/asset-series.ts")
  )
    return undefined;
  const templates: string[] = [];
  function visit(n: ts.Node) {
    if (ts.isReturnStatement(n) && n.expression)
      templates.push(unwrap(n.expression).getText().replace(/\s+/g, ""));
    ts.forEachChild(n, visit);
  }
  visit(declaration);
  const expected = [
    "`assets.${seriesId}.${camel}`",
    "`assets.series.${seriesId}`",
    "`assets.slot.${seriesId}.${key.replace(/-([a-z])/g,(_,letter:string)=>letter.toUpperCase())}`",
  ];
  if (templates.length !== expected.length || templates.some((value, i) => value !== expected[i]))
    return undefined;
  const seriesIds = node.arguments[0] ? finite(node.arguments[0], checker) : undefined;
  const slotIds = node.arguments[1] ? finite(node.arguments[1], checker) : undefined;
  const camel = (value: string) =>
    value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return vocabulary.series
    .filter((series) => !seriesIds || seriesIds.includes(series.id))
    .flatMap((series) => [
      ...series.slots
        .filter((slot) => !slotIds || slotIds.includes(slot.key))
        .map((slot) =>
          series.id === "voice" || series.id === "video"
            ? `assets.${series.id}.${camel(slot.key)}`
            : `assets.slot.${series.id}.${camel(slot.key)}`,
        ),
      ...(series.perLook ? [`assets.series.${series.id}`] : []),
    ]);
}
function localeCondition(node: ts.Expression): boolean {
  node = unwrap(node);
  if (ts.isIdentifier(node)) return ["isZh", "isChinese"].includes(node.text);
  return (
    ts.isBinaryExpression(node) &&
    [
      ts.SyntaxKind.EqualsEqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.SyntaxKind.EqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsToken,
    ].includes(node.operatorToken.kind) &&
    [node.left, node.right].some(
      (part) => ts.isStringLiteralLike(part) && ["zh", "en"].includes(part.text),
    )
  );
}
function authoredBranch(node: ts.Expression): boolean {
  node = unwrap(node);
  return (
    ts.isStringLiteralLike(node) ||
    ts.isTemplateExpression(node) ||
    ts.isJsxFragment(node) ||
    ts.isJsxElement(node) ||
    ts.isArrayLiteralExpression(node) ||
    ts.isObjectLiteralExpression(node)
  );
}

/** AST consumers + finite TypeScript unions. Catalogs, types, tests and docs are not roots. */
export function analyzeMessages({
  sources,
  keys,
  root = process.cwd(),
  vocabulary,
}: {
  sources: Record<string, string>;
  keys: readonly string[];
  root?: string;
  vocabulary?: Vocabulary;
}): MessageAnalysis {
  const runtime = Object.entries(sources).filter(([file]) => isRuntimeSource(file));
  const virtual = new Map(runtime.map(([file, source]) => [resolve(root, file), source]));
  const host = ts.createCompilerHost({});
  const originalRead = host.readFile.bind(host),
    originalExists = host.fileExists.bind(host);
  host.readFile = (file) =>
    virtual.get(resolve(file)) ?? sources[relative(root, file)] ?? originalRead(file);
  host.fileExists = (file) =>
    virtual.has(resolve(file)) || relative(root, file) in sources || originalExists(file);
  const program = ts.createProgram(
    [...virtual.keys()],
    {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      paths: { "@/*": [resolve(root, "src/*")] },
    },
    host,
  );
  const checker = program.getTypeChecker();
  const used = new Set<string>(),
    keySet = new Set(keys);
  const issues: MessageIssue[] = [],
    dynamicEvidence: MessageAnalysis["dynamicEvidence"] = [];
  for (const [file] of runtime) {
    const source = program.getSourceFile(resolve(root, file));
    if (!source) throw new Error(`Missing source: ${file}`);
    const translators = new Set<ts.Symbol>();
    const translatorObjects = new Set<ts.Symbol>();
    const boundTo = (expression: ts.Expression, symbols: Set<ts.Symbol>) =>
      symbols.has(checker.getSymbolAtLocation(expression)!);
    function hasFactory(node: ts.Node): boolean {
      if (ts.isCallExpression(node)) {
        let symbol = checker.getSymbolAtLocation(node.expression);
        if (symbol && symbol.flags & ts.SymbolFlags.Alias)
          symbol = checker.getAliasedSymbol(symbol);
        if (symbol && ["getSiteI18n", "useSiteI18n"].includes(symbol.name)) return true;
      }
      return ts.forEachChild(node, hasFactory) ?? false;
    }
    function hasTranslatorProperty(node: ts.Node): boolean {
      return (
        (ts.isPropertyAccessExpression(node) && node.name.text === "t") ||
        (ts.forEachChild(node, hasTranslatorProperty) ?? false)
      );
    }
    const line = (node: ts.Node) =>
      source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    const issue = (node: ts.Node, message: string) =>
      issues.push({ file, line: line(node), message });
    function bindings(node: ts.Node) {
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        (hasFactory(node.initializer) ||
          boundTo(unwrap(node.initializer), translatorObjects) ||
          (ts.isPropertyAccessExpression(node.initializer) &&
            boundTo(node.initializer.expression, translatorObjects)))
      ) {
        if (ts.isObjectBindingPattern(node.name)) {
          for (const element of node.name.elements) {
            if ((element.propertyName ?? element.name).getText(source) === "t") {
              const symbol = checker.getSymbolAtLocation(element.name);
              if (symbol) translators.add(symbol);
            }
          }
        } else if (ts.isIdentifier(node.name)) {
          const symbol = checker.getSymbolAtLocation(node.name);
          if (symbol)
            (hasTranslatorProperty(node.initializer) ? translators : translatorObjects).add(symbol);
        }
      }
      ts.forEachChild(node, bindings);
    }
    bindings(source);
    const ui = /^src\/(?:app|site|features)\/.*\.tsx$/.test(file);
    function visit(node: ts.Node) {
      if (
        ts.isCallExpression(node) &&
        ((ts.isIdentifier(node.expression) && boundTo(node.expression, translators)) ||
          (ts.isPropertyAccessExpression(node.expression) &&
            node.expression.name.text === "t" &&
            boundTo(node.expression.expression, translatorObjects)))
      ) {
        const argument = node.arguments[0];
        if (!argument) issue(node, "Translation call has no key");
        else {
          const slots = slotKeys(unwrap(argument), checker, vocabulary);
          const helper = ts.isCallExpression(unwrap(argument))
            ? declarationOf((unwrap(argument) as ts.CallExpression).expression, checker)
            : undefined;
          const isSlotHelper =
            helper &&
            ts.isFunctionDeclaration(helper) &&
            helper.name?.text === "slotLabelKey" &&
            helper
              .getSourceFile()
              .fileName.replaceAll("\\", "/")
              .endsWith("/src/features/assets/asset-series.ts");
          const consumed = isSlotHelper ? slots : finite(argument, checker);
          if (
            !consumed ||
            consumed.length === 0 ||
            (keys.length > 1 &&
              keys.every((key) => consumed.includes(key)) &&
              consumed.every((key) => keySet.has(key)) &&
              !ts.isStringLiteralLike(unwrap(argument)))
          ) {
            issue(
              node,
              "Unresolved or catalog-wide dynamic message key; use a finite runtime list",
            );
          } else {
            for (const key of consumed) {
              if (keySet.has(key)) used.add(key);
              else issue(argument, `Unknown message key: ${key}`);
            }
            if (!ts.isStringLiteralLike(unwrap(argument)))
              dynamicEvidence.push({
                file,
                line: line(node),
                reference: slots
                  ? "src/features/assets/asset-series.ts#slotLabelKey + src/content/asset-series.json"
                  : argument.getText(source),
                keys: [...new Set(consumed)].sort(),
              });
          }
        }
      }
      if (ui) {
        if (
          ts.isConditionalExpression(node) &&
          localeCondition(node.condition) &&
          (authoredBranch(node.whenTrue) || authoredBranch(node.whenFalse)) &&
          !finite(node, checker)?.every(
            (value) => keySet.has(value) || ["zh", "en", "zh-CN"].includes(value),
          )
        )
          issue(node, "Inline locale-dependent UI copy; move authored text to messages.source.ts");
        if (
          (ts.isStringLiteralLike(node) ||
            ts.isJsxText(node) ||
            ts.isTemplateHead(node) ||
            ts.isTemplateMiddle(node) ||
            ts.isTemplateTail(node)) &&
          (/\p{Script=Han}/u.test(node.text) || node.text === "English")
        )
          issue(node, "Inline authored UI text/language label; move it to messages.source.ts");
        if (ts.isObjectLiteralExpression(node)) {
          const pairs = node.properties
            .filter(ts.isPropertyAssignment)
            .filter((p) => ["en", "zh"].includes(p.name.getText(source).replace(/["']/g, "")));
          if (pairs.length === 2 && pairs.every((p) => authoredBranch(p.initializer)))
            issue(node, "Inline authored bilingual UI pair; keep content field selectors as data");
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return { used, unused: keys.filter((key) => !used.has(key)).sort(), issues, dynamicEvidence };
}
