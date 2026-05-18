"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { Send, FileText } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSearchParams } from "next/navigation";
import { MarkdownMessage } from "./MarkdonwMessage";

function ChatWindowContent() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const filename = searchParams.get("file");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: (message: { text: string }) => {
        console.log(message, "Message being sent to API");
        return {
          namespace: filename,
        };
      },
    }),
  });

  useEffect(() => {
    if (messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <FileText className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Chat Using AI
            </h2>
            <p className="text-sm text-zinc-500">
              Ask questions about your document
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length > 0 && (
          <div className="border rounded p-4 whitespace-pre-wrap">
            {messages.map((res, idx) => (
              <div className="mb-2 flex gap-1" key={idx}>
                <strong>
                  {res.role === "assistant"
                    ? "AI: "
                    : res.role === "user"
                    ? "You:"
                    : "Error:"}
                </strong>
                {res.role === "assistant" ? (
                  <span className="">
                    <div className="flex flex-col">
                      {res.parts.map((part, i) =>
                        part.type === "text" ? (
                          <MarkdownMessage content={part.text} key={i} />
                        ) : null
                      )}
                    </div>
                    {status === "streaming" &&
                      idx === messages.length - 1 &&
                      res.role === "assistant" && (
                        <span className="animate-pulse">▋</span>
                      )}
                  </span>
                ) : (
                  res.parts.map((part, i) =>
                    part.type === "text" ? (
                      <span key={i}>{part.text}</span>
                    ) : null
                  )
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about the PDF..."
              rows={1}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 mbe-1.75 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatWindow() {
  return (
    <Suspense>
      <ChatWindowContent />
    </Suspense>
  );
}
