import { NextRequest, NextResponse } from "next/server";

const HUD_CROSSWALK_URL = "https://www.huduser.gov/hudapi/public/usps";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || "";
  const county = searchParams.get("county") || "";

  if (!state || !county) {
    return NextResponse.json(
      { error: "State and County are required" },
      { status: 400 }
    );
  }

  try {
    const query = `${county}, ${state}`;
    const url = `${HUD_CROSSWALK_URL}?type=7&query=${encodeURIComponent(
      query
    )}`;

    console.log("Fetching GEOID from:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUD_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data?.data?.results || data.data.results.length === 0) {
      throw new Error("GEOID not found for the provided county and state.");
    }

    // Extract the first valid GEOID
    const geoid = data.data.results[0].county;

    return NextResponse.json({ county, state, geoid });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("GEOID Mapping Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
