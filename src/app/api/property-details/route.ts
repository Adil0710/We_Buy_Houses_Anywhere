import { ApifyClient } from "apify-client";
import { NextResponse } from "next/server";


const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function POST(req: Request) {
  try {
    const { location, mode } = await req.json();

    if (!location || !["BUY", "RENT"].includes(mode)) {
      return NextResponse.json(
        { error: "Valid location and mode (BUY or RENT) are required" },
        { status: 400 }
      );
    }

    // Construct URLs dynamically
    const baseUrl =
      mode === "BUY"
        ? `https://www.realtor.com/realestateandhomes-search/${location}`
        : `https://www.realtor.com/apartments/${location}`;

    const urls = [baseUrl]; // Keeping URLs as an array


    const input = {
      startUrls: urls,
      includeFloorplans: false,
      maxItems: 5,
      endPage: 1,
      mode,
      extendOutputFunction: () => ({}),
      proxy: { useApifyProxy: true },
    };

    try {
      console.log("Fetching data from Apify...");
      const run = await client.actor("GctCXDim0MXeLZegY").call(input);

      // Fetching dataset results
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: "No property details found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ properties: items }, { status: 200 });
    } catch (error) {
      console.error("Apify Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch property details" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Scraping Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property details" },
      { status: 500 }
    );
  }
}
