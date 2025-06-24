export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Replace with your actual backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${backendUrl}/schedule_meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Backend request failed")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Schedule meeting API error:", error)
    return Response.json({ error: "Failed to schedule meeting" }, { status: 500 })
  }
}
