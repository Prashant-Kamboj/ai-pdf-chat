"use client";
import {
  Brain,
  FileText,
  Globe,
  MessageSquare,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Upload,
    title: "Upload PDFs",
    description:
      "Drag and drop any PDF document. We support files of all sizes with fast processing.",
  },
  {
    icon: Brain,
    title: "AI-Powered Understanding",
    description:
      "Our AI reads and understands your entire document, capturing context and nuance.",
  },
  {
    icon: MessageSquare,
    title: "Natural Conversation",
    description:
      "Ask questions in plain English. Get accurate answers with relevant citations from your document.",
  },
  {
    icon: Sparkles,
    title: "Smart Insights",
    description:
      "Extract summaries, key points, and actionable insights automatically.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Upload documents in any language and ask questions in your preferred language.",
  },
  {
    icon: FileText,
    title: "Document Management",
    description:
      "Organize, search, and manage all your documents in one place.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your PDF",
    description: "Drag and drop or browse to upload any PDF document.",
  },
  {
    number: "02",
    title: "AI processes it",
    description:
      "Our engine indexes and understands every page of your document.",
  },
  {
    number: "03",
    title: "Start chatting",
    description:
      "Ask questions and get instant AI-powered answers with citations.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PDFChat</span>
          </div>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              asChild
              className="cursor-pointer"
            >
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="lg" asChild className="cursor-pointer">
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-32 pb-20 sm:pb-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.08),transparent)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                AI-powered PDF chat
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Chat with your{" "}
                <span className="text-primary">PDF documents</span> using AI
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Upload any PDF and start asking questions. Get instant, accurate
                answers with citations from your document.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button size="lg" asChild className="cursor-pointer">
                  <Link href="/auth/signup">Get started free</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="cursor-pointer"
                >
                  <Link href="#features">Learn more</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need to work with PDFs
              </h2>
              <p className="mt-4 text-muted-foreground">
                Powerful features to help you extract knowledge from your
                documents faster.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-muted-foreground">
                Three simple steps to start chatting with your PDFs.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {step.number}
                  </div>
                  <h3 className="mt-6 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-center sm:p-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to transform how you read PDFs?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of users who already use PDFChat to extract
                knowledge from their documents.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button size="lg" asChild className="cursor-pointer">
                  <Link href="/auth/signup">Get started free</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="cursor-pointer"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            PDFChat
          </div>
          <p className="text-sm text-muted-foreground">Made with ❤️ in India</p>
        </div>
      </footer>
    </div>
  );
}
