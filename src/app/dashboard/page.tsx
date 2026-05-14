"use client";
import { useState } from "react";
import FilesPage from "../files/page";
import { SideNav } from "@/components/Sidenav/Sidenav";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("files");

  return (
    <div className="flex h-screen w-full bg-background">
      <SideNav setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className="flex-1 overflow-auto">
        {activeTab === "files" && <FilesPage setActiveTab={setActiveTab} />}
      </main>
    </div>
  );
}
