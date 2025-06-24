export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("🌐 === API ROUTE ===")
    console.log("📨 Received from frontend:", JSON.stringify(body, null, 2))

    // Replace with your actual backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const fullUrl = `${backendUrl}/zeta/chat`

    console.log("🎯 Target URL:", fullUrl)

    // Transform the request to match ZetaCore API format
    const zetaCoreRequest: { prompt: string; session_id?: string } = {
      prompt: body.message,
    }

    // Only include session_id if it exists
    if (body.session_id) {
      zetaCoreRequest.session_id = body.session_id
    }

    console.log("📤 Sending to backend:", JSON.stringify(zetaCoreRequest, null, 2))

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(zetaCoreRequest),
    })

    console.log("📊 Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Backend error:", errorText)
      throw new Error(`Backend request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("📦 Backend response:", JSON.stringify(data, null, 2))

    // Transform the response to match frontend expectations
    const frontendResponse = {
      session_id: data.session_id,
      response: data.neura_z_response,
    }

    console.log("📤 Sending to frontend:", JSON.stringify(frontendResponse, null, 2))

    return Response.json(frontendResponse)
  } catch (error) {
    console.error("❌ API Route error:", error)

    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
