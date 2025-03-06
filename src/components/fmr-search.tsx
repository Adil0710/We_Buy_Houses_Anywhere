"use client";

import { useEffect, useState } from "react";
import { useFMRStore } from "@/store/fmr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Landmark } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

const YEARS = ["2024", "2025"];

export function FMRSearch() {
  const { states, counties, loading, fetchStates, fetchCounties, fetchFMRData } = useFMRStore();
  const [selectedState, setSelectedState] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [stateOpen, setStateOpen] = useState(false);
  const [countyOpen, setCountyOpen] = useState(false);

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  // Fetch counties when state changes
  useEffect(() => {
    if (selectedState) {
      fetchCounties(selectedState);
      setSelectedCounty("");
    }
  }, [selectedState, fetchCounties]);

  const handleSearch = () => {
    if (selectedState && selectedCounty && selectedYear) {
      const state = states.find(s => s.state_code === selectedState)?.state_name;
      if (state) {
        fetchFMRData(selectedYear, state, selectedCounty);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Landmark className="h-6 w-6" />
          Search Fair Market Rent Data
        </CardTitle>
        <CardDescription>
          Select a state, county, and year to view FMR data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover open={stateOpen} onOpenChange={setStateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={stateOpen}
                className="justify-between"
                disabled={loading}
              >
                {selectedState
                  ? states.find((state) => state.state_code === selectedState)?.state_name
                  : loading 
                    ? "Loading states..."
                    : "Select state..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search state..." className="h-9" />
                <CommandEmpty>No state found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {states.map((state) => (
                    <CommandItem
                      key={state.state_code}
                      value={state.state_name}
                      onSelect={() => {
                        setSelectedState(state.state_code);
                        setStateOpen(false);
                      }}
                    >
                      {state.state_name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedState === state.state_code
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={countyOpen} onOpenChange={setCountyOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countyOpen}
                className="justify-between"
                disabled={!selectedState || loading || counties.length === 0}
              >
                {selectedCounty
                  ? counties.find((county) => county.county_name === selectedCounty)?.county_name
                  : loading 
                    ? "Loading counties..."
                    : "Select county..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search county..." className="h-9" />
                <CommandEmpty>No county found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {counties.map((county) => (
                    <CommandItem
                      key={county.fips_code}
                      value={county.county_name}
                      onSelect={() => {
                        setSelectedCounty(county.county_name);
                        setCountyOpen(false);
                      }}
                    >
                      {county.county_name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCounty === county.county_name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleSearch}
            disabled={!selectedState || !selectedCounty || !selectedYear || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}