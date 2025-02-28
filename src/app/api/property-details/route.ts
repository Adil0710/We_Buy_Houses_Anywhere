import { ApifyClient } from "apify-client";
import { NextResponse } from "next/server";
import { isValidUrl } from "@/lib/validURL";
const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function POST(req: Request) {
  try {
    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0 || !urls.every(isValidUrl)) {
      return NextResponse.json(
        { error: "Valid URLs are required" },
        { status: 400 }
      );
    }

    const input = {
      startUrls: urls,
      includeFloorplans: false,
      maxItems: 5,
      endPage: 1,
      mode: "BUY",
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
