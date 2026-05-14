import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const getChunkedPDFText = async ({ pdfPath }: { pdfPath: string }) => {
  try {
    const response = await fetch(pdfPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const loader = new WebPDFLoader(
      new Blob([arrayBuffer], { type: "application/pdf" })
    );
    const text = await loader.load();
    /*---- Text chunks using langchain ---- */

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.splitDocuments(text);

    return chunks;
  } catch (error: any) {
    throw new Error("Failed to read PDF");
  }
};
