"use client";

import { useFurnishedFinderStore } from "@/store/furnished-finder";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  MapPin,
  Star,
  Info,
  Users,
  Bed,
  Bath,
  Home,
  Square,
} from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

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

export function FurnishedFinderListings() {
  const { listings, loadingg, error } = useFurnishedFinderStore();
  const [isClient, setIsClient] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  console.log(listings)

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        setCustomIcon(
          new L.Icon({
            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            shadowSize: [41, 41],
          })
        );
      });
    }
  }, []);

  if (loadingg) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
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
      <div className="p-4 mb-6 border border-destructive rounded-md bg-destructive/10 text-destructive">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No listings found</h3>
        <p className="text-muted-foreground">
          Try searching for a different location
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden">
          <Tabs defaultValue="details">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {listing.locationAndType[0]?.location}
                  </CardDescription>
                  <CardTitle className="text-lg">{listing.name}</CardTitle>
                </div>
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="map">Map</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <TabsContent value="details">
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-[300px] flex-shrink-0">
                    <AspectRatio ratio={4 / 3} className="bg-muted rounded-md overflow-hidden">
                      <Image
                        src={listing.images[0]}
                        alt={listing.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    </AspectRatio>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {listing.locationAndType[0]?.type}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        {listing.propertySpecs.find((spec) => "Sq. Ft." in spec)?.["Sq. Ft."]} sq ft
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {listing.propertySpecs.find((spec) => "Bedroom" in spec)?.["Bedroom"]} bed
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {listing.propertySpecs.find((spec) => "Bathroom" in spec)?.["Bathroom"]} bath
                      </Badge>
                    </div>

                    <p className="text-sm line-clamp-3 mb-3">{listing.description}</p>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Host: {listing.aboutTheLandlord[0]?.name}
                        </span>
                      </div>
                      {listing.aboutTheLandlord[0]?.isEmailVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="text-lg font-bold">
                      {listing.paymentDetails[0]?.price}
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="photos">
              <CardContent>
                <ScrollArea className="h-[300px] rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    {listing.images.map((image, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden">
                        <AspectRatio ratio={4 / 3}>
                          <Image
                            src={image}
                            alt={`${listing.name} - Photo ${index + 1}`}
                            fill
                            className="object-cover"
                            priority
                          />
                        </AspectRatio>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </TabsContent>

            <TabsContent value="map">
              <CardContent className="h-[300px] relative">
                {isClient && customIcon && listing.coordinates ? (
                  <MapContainer
                    center={[listing.coordinates.latitude, listing.coordinates.longitude]}
                    zoom={13}
                    className="h-full w-full rounded-md"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[listing.coordinates.latitude, listing.coordinates.longitude]}
                      icon={customIcon}
                    >
                      <Popup>
                        <strong>{listing.name}</strong>
                        <p>{listing.locationAndType[0]?.location}</p>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Location not available</p>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <CardFooter className="flex justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-1" />
                <span>Last updated: {listing.lastUpdated}</span>
              </div>
              <Button asChild>
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Furnished Finder
                </a>
              </Button>
            </CardFooter>
          </Tabs>
        </Card>
      ))}
    </div>
  );
}