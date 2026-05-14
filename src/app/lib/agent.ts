import { ChatOpenAI } from "@langchain/openai";
import { createAgent, SystemMessage } from "langchain";
import { createRetrieveTool } from "./llm";

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  streaming: true,
});

const systemPrompt = new SystemMessage(
  "You have access to a tool that retrieves context from a document. " +
    "Use this tool to answer user queries.",
);

export const runAgentWithInput = async (input: string, namespace: string) => {
  const tools = [createRetrieveTool(namespace)];

  const agent = createAgent({
    model,
    tools,
    systemPrompt,
  });

  const agentInput = { messages: [{ role: "user", content: input }] };

  const stream = await agent.stream(agentInput, {
    streamMode: "values",
  });

  return stream;
};
