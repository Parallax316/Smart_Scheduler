export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    // Replace with your actual backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"

    const params = new URLSearchParams()
    if (start) params.append("start", start)
    if (end) params.append("end", end)

    const response = await fetch(`${backendUrl}/availability?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Backend request failed")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Availability API error:", error)
    return Response.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}
