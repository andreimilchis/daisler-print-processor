"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/lib/editor-context";
import SettingsPanel from "@/components/editor/SettingsPanel";
import ImageCanvas from "@/components/editor/ImageCanvas";

export default function EditorPage() {
  const { fileData } = useEditor();
  const router = useRouter();

  useEffect(() => {
    if (!fileData) router.replace("/");
  }, [fileData, router]);

  if (!fileData) return null;

  return (
    <div className="flex-1 flex overflow-hidden">
      <SettingsPanel />
      <ImageCanvas />
    </div>
  );
}
