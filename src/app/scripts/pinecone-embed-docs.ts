import { getChunkedPDFText } from "@/app/lib/pdf-loader";
import { embedAndStoreInPinecone } from "@/app/lib/vector-store";
import { pinecone as pineconeClient } from "@/app/lib/pinecone-client";

(async () => {
  try {
    const docs = await getChunkedPDFText();
    await embedAndStoreInPinecone(pineconeClient, docs);
    console.log("PDF text embedded and stored in Pinecone successfully");
  } catch (error) {
    console.error("storing in pinecone db failed", error);
  }
})();
