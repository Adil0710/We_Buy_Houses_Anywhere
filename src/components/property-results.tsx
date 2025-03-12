"use client";

import {
  Building,
  MapPin,
  Bath,
  Bed,
  Home,
  Info,
  DollarSign,
  Calendar,
  Ruler,
} from "lucide-react";
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
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LayersControl } from "react-leaflet";

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

interface PropertyResultsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any[];
  loading: boolean;
  error: string | null;
}

export default function PropertyResults({
  properties,
  loading,
  error,
}: PropertyResultsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };
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

  // Ensure that coordinates exist before rendering
  const hasCoordinates = properties.every(
    (property) =>
      property.coordinates?.latitude && property.coordinates?.longitude
  );

  if (!isClient) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto grid gap-6">
        {[1, 2].map((i) => (
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

  if (properties.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No properties found</h3>
        <p className="text-muted-foreground mb-6">
          Enter a Realtor.com property URL to view detailed information
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid gap-6">
        {properties.map((property, index) => (
          <Card key={index} className="overflow-hidden">
            <Tabs defaultValue="details">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.address?.street}, {property.address?.locality},{" "}
                      {property.address?.region} {property.address?.postalCode}
                    </CardDescription>
                    <CardTitle className="text-lg">
                      {property.beds} Bed, {property.baths} Bath{" "}
                      {property.sub_type || property.type}
                    </CardTitle>
                  </div>
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
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
                          {property.photos && property.photos.length > 0 ? (
                            <Image
                              src={property.photos[0].href}
                              alt={property.address?.street || "Property image"}
                              fill
                              className="object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Building className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </AspectRatio>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Home className="h-3 w-3" />{" "}
                          {property.sub_type || property.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Bed className="h-3 w-3" /> {property.beds} beds
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Bath className="h-3 w-3" /> {property.baths} baths
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Ruler className="h-3 w-3" /> {property.sqft} sqft
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" /> Built{" "}
                          {property.year_built}
                        </Badge>
                      </div>

                      <p className="text-sm line-clamp-4 mb-3">
                        {property.text}
                      </p>

                      <div className="text-lg font-bold flex items-center">
                        <DollarSign className="h-5 w-5" />
                        {formatPrice(property.listPrice)}
                        {property.lastSoldPrice && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            Last sold: {formatPrice(property.lastSoldPrice)} (
                            {new Date(property.soldOn).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="photos">
                <CardContent>
                  <ScrollArea className="h-[400px] rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      {property.photos &&
                        property.photos.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (photo: any, photoIndex: number) => (
                            <div
                              key={photoIndex}
                              className="relative rounded-md overflow-hidden"
                            >
                              <AspectRatio ratio={4 / 3}>
                                <div className="relative w-full h-full">
                                  <Image
                                    src={photo.href}
                                    alt={
                                      photo.title ||
                                      `Property image ${photoIndex + 1}`
                                    }
                                    fill
                                    className="object-cover"
                                    priority
                                  />
                                  {photo.tags && photo.tags.length > 0 && (
                                    <div className="absolute bottom-2 left-2">
                                      <Badge variant="secondary">
                                        {photo.tags[0].label}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </AspectRatio>
                            </div>
                          )
                        )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </TabsContent>

              <TabsContent value="history">
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Property History</h3>
                    {property.history && property.history.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Date
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Event
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Price
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Source
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {property.history.map(
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (event: any, eventIndex: number) => (
                                <tr
                                  key={eventIndex}
                                  className={
                                    eventIndex % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/30"
                                  }
                                >
                                  <td className="px-4 py-2 text-sm">
                                    {new Date(event.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {event.event_name}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {event.price
                                      ? formatPrice(event.price)
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {event.source_name || "-"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No history available for this property
                      </p>
                    )}

                    {property.nearbySchools &&
                      property.nearbySchools.schools && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">
                            Nearby Schools
                          </h3>
                          <div className="space-y-2">
                            {property.nearbySchools.schools.map(
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (school: any, schoolIndex: number) => (
                                <div
                                  key={schoolIndex}
                                  className="border rounded-md p-3"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-medium">
                                        {school.name}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {school.education_levels?.join(", ")} •{" "}
                                        {school.funding_type} •
                                        {school.distance_in_miles} miles away
                                      </p>
                                    </div>
                                    {school.rating && (
                                      <Badge
                                        variant={
                                          school.rating >= 4
                                            ? "default"
                                            : "outline"
                                        }
                                      >
                                        Rating: {school.rating}/10
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="map">
                <CardContent className="h-[300px] relative z-0">
                  {hasCoordinates && isClient && customIcon ? (
                    <MapContainer
                      center={[
                        property.coordinates.latitude,
                        property.coordinates.longitude,
                      ]}
                      zoom={zoom}
                      className="h-full w-full rounded-md"
                    >
                      <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="OpenStreetMap">
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite">
                          <TileLayer
                            attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                          />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Terrain">
                          <TileLayer
                            attribution='&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>'
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                          />
                        </LayersControl.BaseLayer>
                      </LayersControl>
                      <Marker
                        position={[
                          property.coordinates.latitude,
                          property.coordinates.longitude,
                        ]}
                        icon={customIcon}
                      >
                        <Popup>
                          <strong>{property.title}</strong>
                          <p>{property.locationSubtitle}</p>
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
                  <span>Property ID: {property.id}</span>
                </div>
                <Button asChild>
                  <a
                    href={property.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Realtor.com
                  </a>
                </Button>
              </CardFooter>
            </Tabs>
          </Card>
        ))}
      </div>
    </div>
  );
}
