"use client";

import dynamic from "next/dynamic";
import { Mannequin } from "@/components/Mannequin";

const Stage = dynamic(() => import("./Stage"), {
  ssr: false,
  loading: () => (
    <Mannequin className="absolute inset-x-0 bottom-[4%] mx-auto h-[90%] w-full opacity-[0.12]" />
  ),
});

export function StageMount({ assemble = false }: { assemble?: boolean }) {
  return <Stage assemble={assemble} />;
}
