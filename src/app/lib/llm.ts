import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { pinecone as pineconeClient } from "./pinecone-client";
import { getVectorStore } from "./vector-store";

const retrieveSchema = z.object({
  query: z.string(),
});

export const retrieve = tool(
  async ({ query }: { query: string }) => {
    console.log("Retrieving documents for query:", query);
    const vectorStore = await getVectorStore(pineconeClient);
    const retrievedDocs = await vectorStore.similaritySearch(query, 2);
    const serialized = retrievedDocs
      .map(
        (doc) =>
          `Source: ${doc.metadata?.source || "unknown"}\nContent: ${
            doc.pageContent
          }`
      )
      .join("\n");
    return [serialized, retrievedDocs];
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: retrieveSchema,
    responseFormat: "content_and_artifact",
  }
);
