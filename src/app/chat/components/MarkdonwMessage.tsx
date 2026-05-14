"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-zinc-400" />
      )}
    </button>
  );
};

export const MarkdownMessage = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
        ),
        code: ({ inline, className, children, ...props }: any) => {
          return inline ? (
            <code
              className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          ) : (
            <code className={`${className} text-sm leading-relaxed`} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => {
          const codeEl = children as { props?: { children?: string } };
          const codeText = codeEl?.props?.children ?? "";
          return (
            <div className="relative group my-4">
              <CopyButton text={codeText} />
              <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 pr-10 overflow-x-auto text-sm leading-relaxed">
                {children}
              </pre>
            </div>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-4 space-y-1">{children}</ul>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-4 mb-3 space-y-1">
            {children}
          </ol>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-3 mt-6 text-zinc-100">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mb-2 mt-5 text-zinc-100">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-2 mt-4 text-zinc-100">
            {children}
          </h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-zinc-700 pl-4 my-3 text-zinc-400 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-zinc-800 my-4" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-lg border border-zinc-800">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-zinc-800 px-4 py-2.5 bg-zinc-900 font-semibold text-left text-zinc-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-zinc-800 px-4 py-2.5 text-zinc-300">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
