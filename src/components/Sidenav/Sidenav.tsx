"use client";
import { userAuth } from "@/app/auth/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { FileText, LogOut, MessageSquare, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Document } from "@/app/files/page";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/files", label: "Files", icon: FileText },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

function SideNavContent({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (val: string) => void;
}) {
  const router = useRouter();

  const { session } = userAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file");

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

  useEffect(() => {
    if (session?.user?.id && activeTab === "chat") {
      fetchDocuments();
    }
  }, [session?.user?.id, activeTab]);

  useEffect(() => {
    if (documents.length > 0 && !fileParam && pathname === "/chat") {
      router.push("/chat?file=" + (documents[0]?.namespace || ""));
    }
  }, [documents, pathname]);

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">PDFChat</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/files"
              ? activeTab === "files"
              : activeTab === item.href.replace("/", "");
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => {
                setActiveTab(item.href.replace("/", ""));
                router.push(item.href);
              }}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
        {activeTab === "chat" && (
          <div>
            {documents.length > 0 ? (
              <div className="mt-2 space-y-2 ms-4">
                {documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/chat?file=${doc.namespace}`}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
                      fileParam === doc.namespace &&
                        "bg-accent text-foreground font-bold"
                    )}
                  >
                    {doc.name}
                  </Link>
                ))}
              </div>
            ) : loading ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Loading files...
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No files uploaded
              </p>
            )}
          </div>
        )}
      </nav>

      <div className="border-t p-4">
        <p className="mb-2 text-xs text-muted-foreground">
          Logged in as {session?.user?.email}
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export const SideNav = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (val: string) => void;
}) => (
  <Suspense>
    <SideNavContent activeTab={activeTab} setActiveTab={setActiveTab} />
  </Suspense>
);
