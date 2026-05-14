import { embedPDFToPinecone } from "@/app/lib/pinecone-embed-docs";

export async function POST(request: Request) {
  const body = await request.json();
  const { pdfPath, namespace } = body;

  try {
    const response = await embedPDFToPinecone(pdfPath, namespace);
    if (response.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ success: false, error: response.error }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}
