import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import path from "path";

export const getChunkedPDFText = async () => {
  try {
    const pdfPath = path.join(process.cwd(), "public", "Answer-17.pdf");
    const loader = new PDFLoader(pdfPath);
    const text = await loader.load();

    /*---- Text chunks using langchain ---- */

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.splitDocuments(text);
    console.log(chunks, "chunks");
    return chunks;
  } catch (error: any) {
    console.error("Failed to read PDF", error);
    throw new Error("Failed to read PDF");
  }
};
