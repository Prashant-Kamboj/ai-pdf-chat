import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || "",
});

export const pineconeIndex = pinecone.index(
  process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME || "",
  process.env.NEXT_PUBLIC_PINECONE_INDEX_HOST || ""
);
