export async function GET() {
  try {
    // Replace with your actual backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const fullUrl = `${backendUrl}/zeta/health`

    console.log("Health check to:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error response:", errorText)
      throw new Error(`Backend request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("Health response:", data)

    return Response.json(data)
  } catch (error) {
    console.error("Health API error:", error)
    return Response.json(
      {
        error: "Failed to check health",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
