import { runAgentWithInput } from "@/app/lib/agent";

export async function POST(request: Request) {
  const body = await request.json();
  const { query, namespace } = body;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const response = await runAgentWithInput(query, namespace);

        for await (const chunk of response) {
          const messages = chunk.messages;
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const content = lastMessage.content;
            const type = lastMessage.type;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content, type })}\n\n`)
              );
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message })}\n\n`
          )
        );
      } finally {
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
