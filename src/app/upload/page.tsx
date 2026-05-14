"use client";

import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { SideNav } from "@/components/Sidenav/Sidenav";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { userAuth } from "../auth/context/AuthContext";
import { embedPDFToPinecone } from "../lib/pinecone-embed-docs";

interface FileWithPreview extends File {
  preview?: string;
}

export default function UploadPage({}: {} = {}) {
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const router = useRouter();

  const [processingDoc, setProcessingDoc] = useState(false);

  const { session } = userAuth();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files).filter(
          (file) => file.type === "application/pdf"
        );
        setFiles((prev) => [...prev, ...selectedFiles]);
      }
    },
    []
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    try {
      setIsUploading(true);
      const { data, error: uploadPdfError } = await supabase.storage
        .from("pdf")
        .upload(`${session.user.id}/${files[0].name}`, files[0], {
          contentType: "application/pdf",
          upsert: false,
        });

      console.log("Upload response:", data, uploadPdfError);
      if (uploadPdfError) {
        console.error("Error uploading file:", uploadPdfError);
        setIsUploading(false);
        return;
      }
      if (!uploadPdfError) {
        const filePublicUrl = supabase.storage
          .from("pdf")
          .getPublicUrl(`${session.user.id}/${files[0].name}`).data.publicUrl;

        const { data, error: insertDocumentError } = await supabase
          .from("Document")
          .insert({
            name: files[0].name,
            filepath: filePublicUrl,
            namespace: `${files[0].name}-${session.user.id}`,
            processed: false,
            user_id: session.user.id,
          });

        if (insertDocumentError) {
          console.error("Error uploading file:", insertDocumentError);
          setIsUploading(false);
          return;
        }

        if (!insertDocumentError) {
          setProcessingDoc(true);
          const response = await fetch("/api/uploadEmbedding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pdfPath: filePublicUrl,
              namespace: `${files[0].name}-${session.user.id}`,
            }),
          });

          const { success, error } = await response.json();

          if (success) {
            const { data, error: updateDocumentError } = await supabase
              .from("Document")
              .update({ processed: true })
              .eq("filepath", filePublicUrl);

            if (!updateDocumentError) {
              setProcessingDoc(false);
              setUploadComplete(true);
            }

            if (updateDocumentError) {
              console.error(
                "Error updating document status:",
                updateDocumentError
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
    // setIsUploading(true);
    // // Simulate upload
    // console.log(files, "Uploading files...");
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // setIsUploading(false);
    // setUploadComplete(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (uploadComplete) {
    return (
      <div className="flex h-screen w-full bg-background">
        <SideNav setActiveTab={setActiveTab} activeTab={activeTab} />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                File uploaded successfully!
              </h2>
              <p className="mt-2 text-muted-foreground">
                {files.length} {files.length === 1 ? "file" : "files"} processed
                and ready to chat with.
              </p>
            </div>
            <Button
              onClick={() => {
                router.push(`/chat?file=${files[0].name}-${session.user.id}`);
              }}
              variant="outline"
            >
              Chat with Uploaded File
            </Button>
            <Button
              onClick={() => {
                setFiles([]);
                setUploadComplete(false);
              }}
              variant="outline"
            >
              Upload More Files
            </Button>
            <Button
              onClick={() => {
                router.push(`/files`);
              }}
              variant="outline"
            >
              Manage files
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <SideNav setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className="flex-1 overflow-auto flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Upload PDFs</h1>
            <p className="mt-2 text-muted-foreground">
              Drag and drop your PDF files or click to browse
            </p>
          </div>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-75 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
            )}
          >
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="rounded-full bg-gray-100 p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragging
                    ? "Drop your files here"
                    : "Drag & Drop PDF files"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse from your device
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            // clear all button for added files
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {files.length} {files.length === 1 ? "file" : "files"}{" "}
                  selected
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setFiles([])}
                >
                  Clear all
                </Button>
              </div>

              {/* shows added files */}
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border bg-card p-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 cursor-pointer"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {/* upload button for added files */}
              {processingDoc && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" />
                  Processing document...
                </div>
              )}
              {!processingDoc && (
                <Button
                  className={cn(
                    "w-full",
                    isUploading ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                  size="lg"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload />
                      Upload {files.length}{" "}
                      {files.length === 1 ? "file" : "files"}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
