"use client";
import dynamic from "next/dynamic";
import { ChatWindow } from "./components/ChatWindow";

const PDFViewer = dynamic(
  () => import("./components/PDFViewer").then((m) => m.PDFViewer),
  { ssr: false }
);
import { SideNav } from "@/components/Sidenav/Sidenav";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { userAuth } from "../auth/context/AuthContext";

function ChatPageContent() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("chat");
  const [pdfFileUrl, setPdfFileUrl] = useState("");

  const { session } = userAuth();

  const fileParam = searchParams.get("file");
  const pdfFileName = `${fileParam?.split(".pdf")[0]}.pdf`;

  console.log(fileParam?.split(".pdf"), "File param from URL");

  const fetchpdfFile = async () => {
    console.log("Fetching PDF file with name:", pdfFileName);
    const filePublicUrl = supabase.storage
      .from("pdf")
      .getPublicUrl(`${session.user.id}/${pdfFileName}`).data.publicUrl;

    console.log("Fetched PDF file URL:", filePublicUrl);

    setPdfFileUrl(filePublicUrl);
  };

  useEffect(() => {
    if (session?.user?.id && pdfFileName) {
      fetchpdfFile();
    }
  }, [session?.user?.id, pdfFileName]);

  return (
    <div className="flex h-screen w-full bg-background">
      <SideNav setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className="flex-1 overflow-auto">
        <div className="size-full flex">
          <div className="w-1/2 h-full">
            <PDFViewer pdfUrl={pdfFileUrl} />
          </div>
          <div className="w-1/2 h-full">
            <ChatWindow key={pdfFileUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageContent />
    </Suspense>
  );
}
