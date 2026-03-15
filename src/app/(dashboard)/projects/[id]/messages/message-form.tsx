"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MessageForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      setContent("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a message..."
        rows={2}
        className="min-w-0 flex-1"
      />
      <Button type="submit" disabled={loading || !content.trim()}>
        Send
      </Button>
    </form>
  );
}
