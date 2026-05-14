"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl?: string;
}

export function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      {/* PDF Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="p-2 rounded-md hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </button>
          <span className="text-sm text-zinc-400 min-w-[80px] text-center">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() =>
              setPageNumber((page) => Math.min(numPages, page + 1))
            }
            disabled={pageNumber >= numPages}
            className="p-2 rounded-md hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-zinc-400" />
          </button>
          <span className="text-sm text-zinc-400 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
            className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-zinc-900">
        {!Boolean(pdfUrl) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Document
            file={Boolean(pdfUrl) ? pdfUrl : undefined}
            onLoadSuccess={onDocumentLoadSuccess}
            className="shadow-xl"
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="text-zinc-500">Loading PDF...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full">
                <div className="text-zinc-500">
                  Failed to load PDF. Please select a file.
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="border border-zinc-800 bg-white"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
      </div>
    </div>
  );
}
