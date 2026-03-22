import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing required id parameter." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getBook?id=${encodeURIComponent(id)}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the book service." },
      { status: 502 }
    );
  }
}
