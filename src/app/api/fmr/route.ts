import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const stateName = searchParams.get("state");
  const countyName = searchParams.get("county");

  if (!year || !stateName || !countyName) {
    return NextResponse.json(
      { error: "Year, state, and county are required" },
      { status: 400 }
    );
  }

  try {
    const token = process.env.HUD_API_TOKEN;
    if (!token) {
      throw new Error("HUD API token is missing");
    }

    // Step 1: Get state_code from state name
    const statesResponse = await fetch(
      "https://www.huduser.gov/hudapi/public/fmr/listStates",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!statesResponse.ok) {
      throw new Error(`Failed to fetch states: ${statesResponse.statusText}`);
    }
    const statesData = await statesResponse.json();

    // Find the state by name
    const state = statesData.find(
      (s: any) => s.state_name.toLowerCase() === stateName.toLowerCase()
    );
    if (!state) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    // Step 2: Get entityid (FIPS code) from county name
    const countiesResponse = await fetch(
      `https://www.huduser.gov/hudapi/public/fmr/listCounties/${state.state_code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!countiesResponse.ok) {
      throw new Error(
        `Failed to fetch counties: ${countiesResponse.statusText}`
      );
    }
    const countiesData = await countiesResponse.json();

    // Find the county by name
    const county = countiesData.find(
      (c: any) => c.county_name.toLowerCase() === countyName.toLowerCase()
    );
    if (!county) {
      return NextResponse.json({ error: "County not found" }, { status: 404 });
    }

    // Step 3: Fetch FMR data
    const fmrResponse = await fetch(
      `https://www.huduser.gov/hudapi/public/fmr/data/${county.fips_code}?year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!fmrResponse.ok) {
      throw new Error(`Failed to fetch FMR data: ${fmrResponse.statusText}`);
    }
    const fmrData = await fmrResponse.json();

    return NextResponse.json(fmrData);
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
