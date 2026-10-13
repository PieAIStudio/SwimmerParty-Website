import type { Metadata } from "next";
import { ReviewPanel } from "@/features/community";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return <ReviewPanel />;
}
