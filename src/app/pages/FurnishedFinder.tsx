import { FurnishedFinderListings } from "@/components/furnished-finder-listings";
import { FurnishedFinderSearch } from "@/components/furnished-finder-search";
import { TabsContent } from "@/components/ui/tabs";

export default function FurnishedFinderPage() {
  return (
    <TabsContent value="furnishedfinder">
      <div className="max-w-3xl mx-auto mb-8">
        <FurnishedFinderSearch />
        <div className="mt-8">
          <FurnishedFinderListings />
        </div>
      </div>
    </TabsContent>
  );
}
