import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Proposals API - Get pending proposals
 *
 * GET /api/proposals?status=pending
 * Returns AI-generated trade proposals awaiting approval
 *
 * NOTE: This endpoint proxies to the backend API.
 * Frontend should call backend directly in production.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  const { status } = req.query;

  try {
    const backendUrl = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:8002";
    const apiToken = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN;

    const queryParam = status ? `?status=${status}` : "";
    const response = await fetch(`${backendUrl}/proposals${queryParam}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { "Authorization": `Bearer ${apiToken}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          success: false,
          error: "Proposals endpoint not found",
          note: "Backend endpoint may not be implemented yet"
        });
      }
      
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return res.status(response.status).json({ success: false, ...errorData });
    }

    const data = await response.json();
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error("Proposals fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch proposals",
      detail: String(error),
      note: "Check that backend API is running and accessible"
    });
  }
}
