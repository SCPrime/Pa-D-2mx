import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Strategy Versions Endpoint
 *
 * GET /api/strategies/[strategyId]/versions
 *
 * Returns all versions of a strategy for version management
 *
 * NOTE: This endpoint proxies to the backend API.
 * Frontend should call backend directly in production.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { strategyId } = req.query;

  if (!strategyId || typeof strategyId !== "string") {
    return res.status(400).json({ error: "Missing or invalid strategyId" });
  }

  try {
    const backendUrl = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:8002";
    const apiToken = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN;

    const response = await fetch(`${backendUrl}/strategies/${strategyId}/versions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { "Authorization": `Bearer ${apiToken}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          error: "Strategy not found",
          note: "Backend endpoint may not be implemented yet"
        });
      }
      
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Strategy versions fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch strategy versions",
      detail: String(error),
      note: "Check that backend API is running and accessible"
    });
  }
}
