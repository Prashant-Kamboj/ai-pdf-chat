"use client";

import { FileText, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SideNav } from "@/components/Sidenav/Sidenav";
import { supabase } from "@/lib/supabase";
import { userAuth } from "../auth/context/AuthContext";
import { redirect, usePathname } from "next/navigation";

export interface Document {
  id: string;
  name: string;
  filepath: string;
  namespace: string;
  processed: boolean;
  created_at: string;
}

export default function FilesPage({
  setActiveTab: externalSetActiveTab,
}: {
  setActiveTab?: (val: string) => void;
} = {}) {
  const isStandalone = !externalSetActiveTab;
  const [activeTab, setActiveTab] = useState("files");
  const resolvedSetActiveTab = externalSetActiveTab || setActiveTab;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const pathname = usePathname();

  const { session } = userAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchDocuments();
    }
  }, [session?.user?.id]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("Document")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      console.log(data, "Fetched documents");

      if (error) {
        console.error("Error fetching documents:", error);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (doc: Document) => {
    setDeleting(doc.id);
    try {
      const { error: storageError } = await supabase.storage
        .from("pdf")
        .remove([`${session.user.id}/${doc.name}`]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
      }

      const { error: dbError } = await supabase
        .from("Document")
        .delete()
        .eq("id", doc.id);

      if (dbError) {
        console.error("Error deleting document:", dbError);
      } else {
        setDocuments(documents.filter((d) => d.id !== doc.id));

        const response = await fetch("/api/file", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ namespace: doc.namespace }),
        });

        console.log("Delete namespace response:", response);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background">
        {isStandalone && (
          <SideNav setActiveTab={resolvedSetActiveTab} activeTab={activeTab} />
        )}
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  console.log(pathname, "Current pathname");

  return (
    <div className="flex h-screen w-full bg-background">
      {isStandalone && (
        <SideNav setActiveTab={resolvedSetActiveTab} activeTab={activeTab} />
      )}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Files</h1>
              <p className="mt-2 text-muted-foreground">
                Manage your uploaded PDF documents
              </p>
            </div>
            <Button
              className="cursor-pointer"
              onClick={() =>
                isStandalone
                  ? redirect("/upload")
                  : externalSetActiveTab?.("upload")
              }
            >
              Upload New File
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No files uploaded yet
              </p>
              <Button
                variant="outline"
                className="cursor-pointer mt-4"
                onClick={() =>
                  isStandalone
                    ? redirect("/upload")
                    : externalSetActiveTab?.("upload")
                }
              >
                Upload a PDF
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="line-clamp-1 text-lg font-medium">
                        {doc.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2 text-xs">
                      {doc.filepath}
                    </CardDescription>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Uploaded {formatDate(doc.created_at)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      {doc.processed ? (
                        <Link href={`/chat?file=${doc.namespace}`}>
                          <Button size="sm" className="cursor-pointer">
                            Chat
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Processing...
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                      onClick={() => handleDelete(doc)}
                      disabled={deleting === doc.id}
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
