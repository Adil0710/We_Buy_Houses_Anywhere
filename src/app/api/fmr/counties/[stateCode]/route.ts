import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { stateCode: string } }
) {
  try {
    const token = process.env.HUD_API_TOKEN;
    if (!token) {
      throw new Error("HUD API token is missing");
    }

    const response = await fetch(
      `https://www.huduser.gov/hudapi/public/fmr/listCounties/${params.stateCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch counties: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch counties", details: error.message },
      { status: 500 }
    );
  }
}