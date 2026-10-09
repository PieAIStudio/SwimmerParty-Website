import { permanentRedirect } from "next/navigation";
export default async function KitActorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const next = slug === "he-jie" ? "tang-yunqiu" : slug === "dai-er" ? "misha-luo" : slug;
  permanentRedirect(`/${locale}/actors/${next}#assets`);
}
