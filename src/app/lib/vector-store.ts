import type { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

export const embedAndStoreInPinecone = async (
  client: Pinecone,
  // @ts-ignore docs type error
  chunks: Document<Record<string, any>>[],
  namespace: string
) => {
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
      namespace,
      textKey: "text",
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create vector embeddings" };
  }
};

export const getVectorStore = async (client: Pinecone, namespace: string) => {
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
      namespace,
    });
    return vectorStore;
  } catch (error) {
    throw new Error("Failed to get vector store");
  }
};
