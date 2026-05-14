"use client";

import { FileSearch, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <FileSearch className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          This page does not exist.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
