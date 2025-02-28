import { ApifyClient } from "apify-client";
import { NextResponse } from "next/server";

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const location = url.searchParams.get("location");

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const input = {
      locationQueries: [location],
      startUrls: [],
      locale: "en-US",
      currency: "USD",
    };

    // Run the Apify Actor
    const run = await client.actor("GsNzxEKzE2vQ5d9HN").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const typedItems: { coordinates: { latitude: number; longitude: number } }[] = items as { coordinates: { latitude: number; longitude: number } }[];

    if (!items.length) {
      return NextResponse.json({ error: "No listings found" }, { status: 404 });
    }

    // Fetch coordinates of the requested location (from OpenCage API)
    const geoRes = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${process.env.OPENCAGE_API_KEY}`
    );
    const geoData = await geoRes.json();
    const userLat = geoData.results[0]?.geometry?.lat;
    const userLon = geoData.results[0]?.geometry?.lng;

    if (!userLat || !userLon) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }

    // Add calculated distance to each listing
    const listingsWithDistance = typedItems.map((item) => ({
      ...item,
      distance: getDistance(
        userLat,
        userLon,
        item.coordinates.latitude,
        item.coordinates.longitude
      ),
    }));

    // Sort by distance and return top 50
    const sortedListings = listingsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50);

    return NextResponse.json(
      { success: true, listings: sortedListings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Scraping Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
