// This file handles API calls to your Next.js backend

export async function getListings(location: string) {
  try {
    // Call the actual Next.js API endpoint
    const response = await fetch(
      `/api/scrape?location=${encodeURIComponent(location)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch listings");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
}

export async function getPropertyDetails(location: string, mode: string) {
  try {
    // Format location for API (e.g., "Las Vegas, NV" -> "Las-Vegas_NV")
    const formattedLocation = location
      .replace(/, /g, '_')
      .replace(/ /g, '-');

    const response = await fetch("/api/property-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: formattedLocation, mode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch property details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching property details:", error);
    throw error;
  }
} 

export const usCities = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "San Francisco, CA",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
  "El Paso, TX",
  "Detroit, MI",
  "Nashville, TN",
  "Portland, OR",
  "Memphis, TN",
  "Oklahoma City, OK",
  "Las Vegas, NV",
  "Louisville, KY",
  "Baltimore, MD",
  "Milwaukee, WI",
  "Albuquerque, NM",
  "Tucson, AZ",
  "Fresno, CA",
  "Sacramento, CA",
  "Atlanta, GA",
  "Kansas City, MO",
  "Miami, FL",
  "Raleigh, NC",
  "Omaha, NE",
  "Minneapolis, MN",
  "Cleveland, OH",
  "Tulsa, OK",
  "Oakland, CA",
  "Tampa, FL",
  "Arlington, TX",
  "New Orleans, LA",
  "Wichita, KS",
  "Bakersfield, CA",
  "Aurora, CO",
  "Anaheim, CA",
  // Add hundreds more cities here...
];