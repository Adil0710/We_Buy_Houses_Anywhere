"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Home as HomeNew,
  Loader2,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useListingStore } from "@/store/listings";
import ListingResults from "@/components/listing-results";
import PropertyResults from "@/components/property-results";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IoHomeOutline } from "react-icons/io5";
import { FaAirbnb } from "react-icons/fa6";
import { TbHomeDollar } from "react-icons/tb";
import { ModeToggle } from "@/components/dark-light-toggle";
import { FMRSearch } from "@/components/fmr-search";
import { FMRDataTable } from "@/components/fmr-data-table";

export default function Home() {
  const { toast } = useToast();
  const {
    location,
    setLocation,

    loading,
    error,
    searchListings,
    pagination,
    setItemsPerPage,
    allListings,
  } = useListingStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchType, setSearchType] = useState<"airbnb" | "property">("airbnb");
  const [propertyUrl, setPropertyUrl] = useState("");
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<any[]>([]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (propertyError) {
      toast({
        title: "Property Search Error",
        description: propertyError,
        variant: "destructive",
      });
    }
  }, [propertyError, toast]);

  const handleAirbnbSearch = () => {
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to search for listings",
        variant: "destructive",
      });
      return;
    }

    searchListings();

    if (allListings.length > 0) {
      toast({
        title: "Listings found",
        description: `Found ${allListings.length} listings near ${location}`,
      });
    }
  };

  const handlePropertySearch = async () => {
    if (!propertyUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a Realtor.com property URL",
        variant: "destructive",
      });
      return;
    }

    if (!propertyUrl.includes("realtor.com")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Realtor.com property URL",
        variant: "destructive",
      });
      return;
    }

    setPropertyLoading(true);
    setPropertyError(null);

    try {
      const { getPropertyDetails } = await import("@/lib/api");
      const result = await getPropertyDetails([propertyUrl]);
      setPropertyData(result.properties || []);

      if (result.properties && result.properties.length > 0) {
        toast({
          title: "Property found",
          description: "Successfully retrieved property details",
        });
      } else {
        setPropertyError("No property details found");
      }
    } catch (error) {
      setPropertyError(
        error instanceof Error
          ? error.message
          : "Failed to fetch property details"
      );
    } finally {
      setPropertyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HomeNew className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">We Buy Houses Anywhere</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <Tabs
          defaultValue="airbnb"
          onValueChange={(value) =>
            setSearchType(value as "airbnb" | "property")
          }
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="airbnb">
              <FaAirbnb className=" mr-2" />
              Airbnb Listings
            </TabsTrigger>
            <TabsTrigger value="property">
              <IoHomeOutline className=" mr-2" />
              Property Details
            </TabsTrigger>
            <TabsTrigger value="fmr">
              <TbHomeDollar className=" mr-2" />
              HUD FMR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="airbnb">
            <div className="max-w-3xl mx-auto mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Find nearby Airbnb listings
              </h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Enter a location (e.g., London, New York)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleAirbnbSearch()}
                  />
                </div>
                <Button onClick={handleAirbnbSearch} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {allListings.length > 0 && (
              <div className="max-w-3xl mx-auto mb-6 flex justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Items per page:
                  </span>
                  <Select
                    value={pagination.itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(parseInt(value))}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <ListingResults />
          </TabsContent>

          <TabsContent value="property">
            <div className="max-w-3xl mx-auto mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Search for property details
              </h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Enter a Realtor.com property URL"
                    value={propertyUrl}
                    onChange={(e) => setPropertyUrl(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handlePropertySearch()
                    }
                  />
                </div>
                <Button
                  onClick={handlePropertySearch}
                  disabled={propertyLoading}
                >
                  {propertyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Example:
                https://www.realtor.com/realestateandhomes-detail/2282-E-Desert-Inn-Rd_Las-Vegas_NV_89169_M11585-75304
              </p>
            </div>

            <PropertyResults
              properties={propertyData}
              loading={propertyLoading}
              error={propertyError}
            />
          </TabsContent>

          <TabsContent value="fmr">
            <div className="max-w-3xl mx-auto mb-8">
              <FMRSearch />
              <div className="mt-8">
                <FMRDataTable />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
