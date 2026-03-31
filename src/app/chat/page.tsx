"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownMessage } from "./components/MarkdonwMessage";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<{ type: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content && parsed.type === "ai") {
                setResponse((prev) => [
                  ...prev,
                  { type: "ai", content: parsed.content },
                ]);
              }
              if (parsed.content && parsed.type === "human") {
                setResponse((prev) => [
                  ...prev,
                  { type: "human", content: parsed.content },
                ]);
              }
              if (parsed.error) {
                setResponse((prev) => [
                  ...prev,
                  { type: "Error", content: parsed.error },
                ]);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      setResponse((prev) => [
        ...prev,
        { type: "Error", content: error.message || "An error occurred" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4 items-center">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 border rounded px-3 py-2"
        />
        <Button
          type="submit"
          disabled={loading}
          className="text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask"}
        </Button>
      </form>

      {response.length > 0 && (
        <div className="border rounded p-4 whitespace-pre-wrap">
          {response.map((res, idx) => (
            <div className="mb-2 flex gap-1" key={idx}>
              <strong>
                {res.type === "ai"
                  ? "AI: "
                  : res.type === "human"
                  ? "You:"
                  : "Error:"}
              </strong>
              {res.type === "ai" ? (
                <div className="flex flex-col">
                  <MarkdownMessage content={res.content} />
                </div>
              ) : (
                res.content
              )}
            </div>
          ))}
          {loading && <span className="animate-pulse">▋</span>}
        </div>
      )}
    </div>
  );
}
