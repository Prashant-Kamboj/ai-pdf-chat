"use client";

import { ChevronLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-muted/50 to-muted p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Forgot password?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent
              ? "Check your email for a reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="space-y-5">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Please check your inbox and follow the instructions.
            </div>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => setSent(false)}
            >
              Send again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "px-3 py-4 text-sm",
                  error &&
                    "border-destructive focus:ring-destructive rounded-lg"
                )}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
