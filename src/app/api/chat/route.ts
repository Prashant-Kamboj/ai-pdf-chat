import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, SystemMessage } from "langchain";
import { createUIMessageStreamResponse } from "ai";
import { createRetrieveTool } from "@/app/lib/llm";

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  streaming: true,
});

const systemPrompt = new SystemMessage(
  "You have access to a tool that retrieves context from a document. " +
    "Use this tool to answer user queries."
);

export async function POST(request: Request) {
  const { messages, namespace } = await request.json();

  console.log(messages, "Received messages in API route", namespace);

  const tools = [createRetrieveTool(namespace)];

  const agent = createAgent({
    model,
    tools,
    systemPrompt,
  });

  const langchainMessages = await toBaseMessages(messages);

  const stream = await agent.stream(
    { messages: langchainMessages },
    {
      streamMode: ["values", "messages"],
    }
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
