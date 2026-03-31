import type { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

export const embedAndStoreInPinecone = async (
  client: Pinecone,
  // @ts-ignore docs type error
  chunks: Document<Record<string, any>>[]
) => {
  // 1. Create vector embeddings from chunks
  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
      model: "text-embedding-3-small",
    });
    const index = client.index(
      process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME || "",
      process.env.NEXT_PUBLIC_PINECONE_INDEX_HOST || ""
    );

    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex: index,
      namespace: "pdf-chunks",
      textKey: "text",
    });
  } catch (error) {
    console.error("Failed to create vector embeddings", error);
    throw new Error("Failed to create vector embeddings");
  }
};

export const getVectorStore = async (client: Pinecone) => {
  try {
    const embedding = new OpenAIEmbeddings({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
      model: "text-embedding-3-small",
    });
    const vectorStore = await PineconeStore.fromExistingIndex(embedding, {
      pineconeIndex: client.index(
        process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME || "",
        process.env.NEXT_PUBLIC_PINECONE_INDEX_HOST || ""
      ),
      textKey: "text",
      namespace: "pdf-chunks",
    });
    return vectorStore;
  } catch (error) {
    console.error("Failed to get vector store", error);
    throw new Error("Failed to get vector store");
  }
};
