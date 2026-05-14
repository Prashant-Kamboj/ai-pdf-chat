import { pinecone, pineconeIndex } from "@/app/lib/pinecone-client";

export const DELETE = async (request: Request) => {
  try {
    const { namespace } = await request.json();
    console.log("received request to delete namespace:", { namespace });

    const fileNamespace = pineconeIndex.namespace(namespace);
    await fileNamespace.deleteAll();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Failed to delete namespace" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};
