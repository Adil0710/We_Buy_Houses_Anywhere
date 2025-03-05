import { ApifyClient } from "apify-client";
import { NextResponse } from "next/server";

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location } = body;

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    // Construct the dynamic start URL based on user input
    const formattedLocation = location.replace(/\s+/g, "/"); // Replace spaces with slashes
    const startUrl = `https://www.furnishedfinder.com/housing/${formattedLocation}`;

    // Set up actor input
    const input = {
      startUrls: [startUrl],
      searchCoordinates: [],
      searchArea: "0.25",
      maxItems: 20,
      extendOutputFunction: "(object) => { return object }",
      customMapFunction: "(object) => { return object }",
      proxy: { useApifyProxy: true },
    };

    // Start Apify Actor
    const run = await client.actor("EL1zje7r1fdkIPc20").call(input);

    if (!run || !run.defaultDatasetId) {
      throw new Error("Failed to start Apify Actor");
    }

    // Fetch dataset results
    const results = await client.dataset(run.defaultDatasetId).listItems();

    if (!results.items || results.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data found for the given location." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: results.items });
  } catch (error) {
    console.error("Scraping Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch furnishedfinder property details" },
      { status: 500 }
    );
  }
}
