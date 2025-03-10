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
    const formattedLocation = location.replace(/, /g, "_").replace(/ /g, "-");

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

export async function getFurnishedFinderDetails(city: string, state: string) {
  try {
    // Format city for API (e.g., "Las Vegas County" -> "Las-Vegas")
    const formattedCity = city.replace(/ /g, "-");

    const response = await fetch("/api/property-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: formattedCity, state }),
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
