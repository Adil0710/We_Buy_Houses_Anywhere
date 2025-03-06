// app/api/scrape-furnishedfinder/route.ts
import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

// Initialize Apify client with environment variable
const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export async function POST(request: Request) {
  try {
    // Get input parameters from request body
    const { city, state, budget, moveInDate } = await request.json();

    // Validate required parameters
    if (!city || !state) {
      return NextResponse.json(
        { error: "City and State are required fields" },
        { status: 400 }
      );
    }

    // Construct dynamic URL based on user input
    let url = `https://www.furnishedfinder.com/housing/${city}/${state}`;

    if (budget) {
      url += `/Budget${budget}`;
    }
    if (moveInDate) {
      url += `/MoveIndate${moveInDate}`;
    }
    url += "/Avail"; // Append default availability parameter

    console.log(url);
    const startUrls = [url];
    console.log(startUrls);

    // Prepare Actor input with default values
    const input = {
      startUrls,
      searchCoordinates: [],
      searchArea: "0.25",
      maxItems: 20,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
      extendOutputFunction: (_$: unknown) => ({}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customMapFunction: (object: any) => ({ ...object }),
      proxy: {
        useApifyProxy: true,
      },
    };

    // Run the Apify actor
    const run = await client.actor("EL1zje7r1fdkIPc20").call(input);

    // Get results from dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return NextResponse.json({ data: items }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape data", details: error.message },
      { status: 500 }
    );
  }
}
