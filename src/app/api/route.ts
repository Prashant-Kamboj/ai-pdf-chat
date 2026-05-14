import { ChatOpenAI } from "@langchain/openai";
import { createRetrieveTool } from "../lib/llm";

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  streaming: true,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { query, namespace } = body;

  const retrieveTool = createRetrieveTool(namespace);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const modelWithTools = model.bindTools([retrieveTool]);

        const result = await modelWithTools.stream([
          [
            "system",
            "You are a helpful assistant that can answer questions about uploaded PDFs. Use the retrieve tool to get relevant information from the documents.",
          ],
          ["human", query],
        ]);

        let fullResponse = "";

        for await (const chunk of result) {
          const content = chunk.content;
          if (content) {
            fullResponse += content;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
            );
          }
        }

        if (
          fullResponse.includes("retrieve") ||
          fullResponse.includes("tool_calls")
        ) {
          const toolCallMatch = fullResponse.match(
            /tool_calls.*?name.*?retrieve.*?arguments.*?\{.*?"query".*?"(.*?)"/,
          );
          if (toolCallMatch) {
            const retrievedQuery = toolCallMatch[1];
            const docs = await retrieveTool.invoke({
              query: retrievedQuery,
            });
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  content: "\n\n[Retrieved documents: " + docs + "]",
                })}\n\n`,
              ),
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
