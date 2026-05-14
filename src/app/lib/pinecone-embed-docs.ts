import { getChunkedPDFText } from "@/app/lib/pdf-loader";
import { embedAndStoreInPinecone } from "@/app/lib/vector-store";
import { pinecone as pineconeClient } from "@/app/lib/pinecone-client";

export const embedPDFToPinecone = async (
  pdfPath: string,
  namespace: string
) => {
  try {
    const chunks = await getChunkedPDFText({ pdfPath });

    return await embedAndStoreInPinecone(pineconeClient, chunks, namespace);
  } catch (error: any) {
    throw new Error("Failed to embed PDF to Pinecone");
  }
};
