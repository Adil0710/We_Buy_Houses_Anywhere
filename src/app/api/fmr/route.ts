import { NextRequest, NextResponse } from "next/server";

// 🔥 Example: County to GEOID mapping
const COUNTY_GEOID_MAP: Record<string, string> = {
  "Socorro County, New Mexico": "35053", // 🔥 FIPS Code for Socorro County, NM
};

const HUD_API_URL = "https://www.huduser.gov/hudapi/public/usps";
const HUD_API_TOKEN = process.env.HUD_API_TOKEN; // Ensure it's in .env.local

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

  const countyKey = `${county}, ${state}`;
  const geoid = COUNTY_GEOID_MAP[countyKey];

  if (!geoid) {
    return NextResponse.json(
      { error: "Invalid County or GEOID not found" },
      { status: 400 }
    );
  }

  try {
    const url = `${HUD_API_URL}?type=7&query=${geoid}`;
    console.log("HUD API Request URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${HUD_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data || !data.data?.results) {
      throw new Error("Invalid response from HUD API");
    }

    // 🔥 Extract useful info only
    const formattedResults = data.data.results.map((item: any) => ({
      city: item.city,
      state: item.state,
      zipGEOID: item.geoid,
      residentialRatio: item.res_ratio,
      businessRatio: item.bus_ratio,
      totalRatio: item.tot_ratio,
    }));

    return NextResponse.json({ results: formattedResults });
  } catch (error: any) {
    console.error("HUD API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
