import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import * as z from "zod";
import { pinecone as pineconeClient } from "./pinecone-client";
import { getVectorStore } from "./vector-store";

const retrieveSchema = z.object({
  query: z.string(),
});

export const retrieveFunction = async ({
  query,
  namespace,
}: {
  query: string;
  namespace: string;
}) => {
  console.log("Retrieving documents for query:", query);
  const vectorStore = await getVectorStore(pineconeClient, namespace);
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
};

export const createRetrieveTool = (
  namespace: string
): DynamicStructuredTool => {
  return new DynamicStructuredTool({
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: retrieveSchema,
    responseFormat: "content_and_artifact",
    func: async (input: { query: string }) => {
      return retrieveFunction({ ...input, namespace });
    },
  });
};
