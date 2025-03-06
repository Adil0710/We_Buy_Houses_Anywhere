import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.HUD_API_TOKEN;
    if (!token) {
      throw new Error("HUD API token is missing");
    }

    const response = await fetch(
      "https://www.huduser.gov/hudapi/public/fmr/listStates",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch states: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch states", details: error.message },
      { status: 500 }
    );
  }
}