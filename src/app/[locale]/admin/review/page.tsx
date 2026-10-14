import { notFound } from "next/navigation";
import { COMMUNITY_ENABLED } from "@/content/features";
import type { Metadata } from "next";
import { ReviewPanel } from "@/features/community";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  if (!COMMUNITY_ENABLED) notFound();
  return <ReviewPanel />;
}
