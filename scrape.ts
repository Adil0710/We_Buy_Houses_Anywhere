// import { ApifyClient } from "apify-client";
// import { NextResponse } from "next/server";

// const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const location = url.searchParams.get("location");

//     if (!location) {
//       return NextResponse.json(
//         { error: "Location is required" },
//         { status: 400 }
//       );
//     }

//     const input = {
//       locationQueries: [location],
//       startUrls: [],
//       locale: "en-US",
//       currency: "USD",
//     };

//     // Run the Apify Actor
//     const run = await client.actor("GsNzxEKzE2vQ5d9HN").call(input);

//     // Fetch results
//     const { items } = await client.dataset(run.defaultDatasetId).listItems();

//     if (!items.length) {
//       return NextResponse.json({ error: "No listings found" }, { status: 404 });
//     }

//     // Sort results by distance (ascending) and get top 50
//     const sortedListings = (items as { distance: number }[])
//       .sort((a, b) => a.distance - b.distance)
//       .slice(0, 50);
        
//     return NextResponse.json(
//       { success: true, listings: sortedListings },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Scraping Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch listings" },
//       { status: 500 }
//     );
//   }
// }
