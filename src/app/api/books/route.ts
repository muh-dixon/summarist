import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const search = request.nextUrl.searchParams.get("search");

  const endpoint = search
    ? `${API_BASE_URL}/getBooksByAuthorOrTitle?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/getBooks?status=${encodeURIComponent(status ?? "")}`;

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 60 },
    });

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
      { error: "Unable to reach the books service." },
      { status: 502 }
    );
  }
}
