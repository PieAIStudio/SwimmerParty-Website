import { permanentRedirect } from "next/navigation";

// The asset library now lives on the actor page; old links land on its library section.
export default async function AssetsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const next = slug === "he-jie" ? "tang-yunqiu" : slug === "dai-er" ? "misha-luo" : slug;
  permanentRedirect(`/${locale}/actors/${next}#assets`);
}
