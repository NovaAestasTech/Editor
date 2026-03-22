"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard() {
  const router = useRouter();

  return (
    <Button variant="ghost" size="icon" onClick={() => router.back()}>
      <ArrowLeft size={16} />
    </Button>
  );
}
