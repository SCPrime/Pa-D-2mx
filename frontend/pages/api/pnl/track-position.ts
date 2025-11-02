import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Track Position P&L Endpoint
 *
 * POST /api/pnl/track-position
 *
 * Returns real-time P&L updates with variance from theoretical baseline
 * for an active position
 *
 * NOTE: This endpoint proxies to the backend API.
 * Frontend should call backend directly in production.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { positionId } = req.body;

  if (!positionId) {
    return res.status(400).json({ error: "Missing required parameter: positionId" });
  }

  try {
    const backendUrl = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:8002";
    const apiToken = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN;

    const response = await fetch(`${backendUrl}/pnl/track-position/${positionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { "Authorization": `Bearer ${apiToken}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          error: "Position not found",
          note: "Backend endpoint may not be implemented yet"
        });
      }
      
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Position tracking error:", error);
    res.status(500).json({
      error: "Failed to track position",
      detail: String(error),
      note: "Check that backend API is running and accessible"
    });
  }
}
