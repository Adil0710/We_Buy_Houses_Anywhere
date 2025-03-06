"use client";

import { Home, MapPin, Star, Info, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useListingStore } from "@/store/listings";
import Image from "next/image";
import { Listing } from "@/store/listings";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function ListingResults() {
  const {
    listings,
    loading,
    error,
    location,
    pagination,
    setPage,
    allListings,
  } = useListingStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [zoom, setZoom] = useState(13); // Default zoom level
  const [isClient, setIsClient] = useState(false);

  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);

  useEffect(() => {
    setIsClient(true); // Ensures this runs only on the client

    // Initialize Leaflet icon on client side
    if (typeof window !== "undefined") {
      // Import Leaflet dynamically inside useEffect
      import("leaflet").then((L) => {
        // Set up default icon manually
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        // Create custom icon
        setCustomIcon(
          new L.Icon({
            iconUrl:
              "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            shadowSize: [41, 41],
          })
        );
      });
    }
  }, []);

  if (!isClient) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  const formatDistance = (distance?: number) => {
    if (distance === undefined) return "Unknown distance";
    if (distance < 1) return `${Math.round(distance * 1000)} m away`;
    return `${distance.toFixed(1)} km away`;
  };

  const renderPaginationItems = () => {
    const { currentPage, totalPages } = pagination;
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => setPage(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and neighbors
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => setPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Ensure that coordinates exist before rendering
  const hasCoordinates = listings.every(
    (listing) => listing.coordinates?.latitude && listing.coordinates?.longitude
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Skeleton className="h-[200px] w-[300px] rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 mb-6 border border-destructive rounded-md bg-destructive/10 text-destructive">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (allListings.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No listings found</h3>
        <p className="text-muted-foreground mb-6">
          Search for a location to find nearby Airbnb listings
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-muted-foreground mb-4">
        Showing {listings.length} of {allListings.length} listings near{" "}
        {location}, sorted by distance
      </p>
      <div className="grid gap-6">
        {listings.map((listing: Listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <Tabs defaultValue="details">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.locationSubtitle} •{" "}
                      {formatDistance(listing.distance)}
                    </CardDescription>
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                  </div>
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                    <TabsTrigger value="map">View on Map</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>

              <TabsContent value="details">
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-[300px] flex-shrink-0">
                      <AspectRatio
                        ratio={4 / 3}
                        className="bg-muted rounded-md overflow-hidden"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={listing.thumbnail}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            priority
                          />
                        </div>
                      </AspectRatio>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Home className="h-3 w-3" /> {listing.propertyType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" /> {listing.personCapacity}{" "}
                          guests
                        </Badge>
                        {listing.rating &&
                          listing.rating.guestSatisfaction &&
                          listing.rating.guestSatisfaction > 0 && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Star className="h-3 w-3 fill-current" />
                              {listing.rating.guestSatisfaction.toFixed(1)}
                              {listing.rating.reviewsCount &&
                                listing.rating.reviewsCount > 0 &&
                                ` (${listing.rating.reviewsCount})`}
                            </Badge>
                          )}
                      </div>

                      <p className="text-sm line-clamp-3 mb-3">
                        {listing.description}
                      </p>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={listing.host.profileImage}
                              alt={listing.host.name}
                              fill
                              className="object-cover"
                              priority
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {listing.host.name}
                          </span>
                        </div>
                        {listing.host.isSuperHost && (
                          <Badge variant="secondary" className="text-xs">
                            Superhost
                          </Badge>
                        )}
                      </div>

                      <div className="text-lg font-bold">
                        {listing.price.price}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          per night
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="photos">
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      {listing.images &&
                        listing.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative rounded-md overflow-hidden"
                          >
                            <AspectRatio ratio={4 / 3}>
                              <div className="relative w-full h-full">
                                <Image
                                  src={image.imageUrl}
                                  alt={image.caption}
                                  fill
                                  className="object-cover"
                                  priority
                                />
                              </div>
                            </AspectRatio>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </TabsContent>

              <TabsContent value="map">
                <CardContent className="h-[300px] relative">
                  {hasCoordinates && isClient && customIcon ? (
                    <MapContainer
                      center={[
                        listing.coordinates.latitude,
                        listing.coordinates.longitude,
                      ]}
                      zoom={zoom}
                      className="h-full w-full rounded-md"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          listing.coordinates.latitude,
                          listing.coordinates.longitude,
                        ]}
                        icon={customIcon}
                      >
                        <Popup>
                          <strong>{listing.title}</strong>
                          <p>{listing.locationSubtitle}</p>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>Location not available</p>
                    </div>
                  )}

                  {/* Zoom Controls */}
                </CardContent>
              </TabsContent>

              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  <span>Listing ID: {listing.id.substring(0, 8)}...</span>
                </div>
                <Button asChild>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Airbnb
                  </a>
                </Button>
              </CardFooter>
            </Tabs>
          </Card>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination className="my-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(pagination.currentPage - 1)}
                className={
                  pagination.currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(pagination.currentPage + 1)}
                className={
                  pagination.currentPage === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
