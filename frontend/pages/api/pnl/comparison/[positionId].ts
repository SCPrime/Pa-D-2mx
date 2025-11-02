import type { NextApiRequest, NextApiResponse } from "next";

/**
 * P&L Comparison Endpoint
 *
 * GET /api/pnl/comparison/[positionId]
 *
 * Returns full P&L comparison with theoretical vs actual metrics,
 * execution quality score, and historical data
 *
 * NOTE: This endpoint proxies to the backend API.
 * Frontend should call backend directly in production.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { positionId } = req.query;

  if (!positionId || typeof positionId !== "string") {
    return res.status(400).json({ error: "Missing or invalid positionId" });
  }

  try {
    const backendUrl = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:8002";
    const apiToken = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN;

    const response = await fetch(`${backendUrl}/pnl/comparison/${positionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { "Authorization": `Bearer ${apiToken}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          error: "Position comparison not found",
          note: "Backend endpoint may not be implemented yet"
        });
      }
      
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("P&L comparison fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch P&L comparison",
      detail: String(error),
      note: "Check that backend API is running and accessible"
    });
  }
}
