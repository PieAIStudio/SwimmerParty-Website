import { z } from "zod";
import type { GameAccountProduct } from "@pieai/swimmer-ui-kit/liquid-presence";
import { SITE } from "../../content/site.ts";

/** The product that renders this header; it is the current tab, never a link. */
export const CURRENT_PRODUCT_ID = "swimmerparty";
const CACHE_MS = 5 * 60_000;
const TIMEOUT_MS = 8_000;

const localized = (max: number) =>
  z.object({ zh: z.string().trim().min(1).max(max), en: z.string().trim().min(1).max(max) });

const productSchema = z.object({
  id: z.string().min(1).max(64),
  name: localized(80),
  description: localized(240),
  url: z.url().refine((value) => value.startsWith("https://"), "products must use https"),
  clientId: z.uuid().optional(),
});

/** Public catalog served by the account center; unknown keys are ignored. */
export const productCatalogSchema = z.object({
  version: z.literal(1),
  products: z.array(productSchema).max(50),
});

export type ProductCatalog = z.infer<typeof productCatalogSchema>;
export type ProductLocale = "zh" | "en";

/** Maps the catalog to UIKit products. A clientId means the product takes the SSO arrival marker. */
export function productsFor(catalog: ProductCatalog, locale: ProductLocale): GameAccountProduct[] {
  return catalog.products.map((product) => ({
    id: product.id,
    name: product.name[locale],
    description: product.description[locale],
    href: product.clientId ? `${product.url.replace(/\/+$/, "")}/?swimmer_sso=1` : product.url,
    current: product.id === CURRENT_PRODUCT_ID,
  }));
}

/** A catalog reader with a five-minute in-memory cache. Any failure yields [] and one warning. */
export function createProductSource(
  load: () => Promise<unknown>,
  options: { now?: () => number; warn?: (message: string) => void } = {},
) {
  const now = options.now ?? (() => Date.now());
  // One line when the account center is unreachable; the menu then simply has no product tab.
  // oxlint-disable-next-line no-console -- Single, intentional degradation notice.
  const warn = options.warn ?? ((message: string) => console.warn(message));
  let entry: { at: number; catalog: Promise<ProductCatalog | null> } | null = null;
  let warned = false;
  const failed = (reason: string) => {
    if (!warned) {
      warned = true;
      warn(`Account products unavailable: ${reason}`);
    }
    return null;
  };
  function catalog(): Promise<ProductCatalog | null> {
    if (entry && now() - entry.at < CACHE_MS) return entry.catalog;
    const pending = Promise.resolve()
      .then(load)
      .then(
        (raw) => {
          const parsed = productCatalogSchema.safeParse(raw);
          return parsed.success ? parsed.data : failed("invalid catalog");
        },
        () => failed("request failed"),
      );
    entry = { at: now(), catalog: pending };
    return pending;
  }
  return async function fetchProducts(locale: ProductLocale): Promise<GameAccountProduct[]> {
    const value = await catalog();
    return value ? productsFor(value, locale) : [];
  };
}

async function loadProductsJson(): Promise<unknown> {
  const response = await fetch(`${SITE.accountUrl}/products.json`, {
    // The center sends max-age=300; the default cache mode honours it, force-cache would not.
    cache: "default",
    credentials: "omit",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`products ${response.status}`);
  return response.json();
}

/** Used by the header only after a signed-in session has been idle for a moment. */
export const fetchProducts = createProductSource(loadProductsJson);
