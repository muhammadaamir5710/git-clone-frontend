import { NextResponse } from "next/server";
import api from "@/lib/api";

export async function GET() {
  try {
    const res = await api.get("/auth/me");
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({ error: "Not authenticated 123" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  const { action, ...data } = await req.json();

  try {
    let res;
    if (action === "login") {
      res = await api.post("/auth/login", data);
    } else if (action === "register") {
      res = await api.post("/auth/register", data);
    } else if (action === "logout") {
      res = await api.post("/auth/logout");
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || "Server error" },
      { status: error.response?.status || 500 }
    );
  }
}
