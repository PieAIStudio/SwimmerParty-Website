import { permanentRedirect } from "next/navigation";
export default async function KitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/actors`);
}
