// import { Home, MapPin, Star, Info, Users, Bed, Bath } from 'lucide-react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Skeleton } from '@/components/ui/skeleton';
// import { AspectRatio } from '@/components/ui/aspect-ratio';
// import { Button } from '@/components/ui/button';
// import { useListingStore } from '@/store/listings';
// import { Listing } from '@/store/listings';

// export default function ListingResults() {
//   const { listings, loading, error, location } = useListingStore();

//   const formatDistance = (distance?: number) => {
//     if (distance === undefined) return 'Unknown distance';
//     if (distance < 1) return `${Math.round(distance * 1000)} m away`;
//     return `${distance.toFixed(1)} km away`;
//   };

//   if (loading) {
//     return (
//       <div className="max-w-3xl mx-auto grid gap-6">
//         {[1, 2, 3].map((i) => (
//           <Card key={i}>
//             <CardHeader className="pb-2">
//               <Skeleton className="h-4 w-1/3" />
//               <Skeleton className="h-6 w-2/3" />
//             </CardHeader>
//             <CardContent>
//               <div className="flex gap-4">
//                 <Skeleton className="h-[200px] w-[300px] rounded-md" />
//                 <div className="flex-1 space-y-2">
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-full" />
//                   <Skeleton className="h-4 w-2/3" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-3xl mx-auto p-4 mb-6 border border-destructive rounded-md bg-destructive/10 text-destructive">
//         <p className="font-medium">{error}</p>
//       </div>
//     );
//   }

//   if (listings.length === 0) {
//     return (
//       <div className="max-w-3xl mx-auto text-center py-12">
//         <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
//         <h3 className="text-xl font-medium mb-2">No listings found</h3>
//         <p className="text-muted-foreground mb-6">
//           Search for a location to find nearby Airbnb listings
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-3xl mx-auto">
//       <p className="text-muted-foreground mb-4">Showing {listings.length} listings near {location}, sorted by distance</p>
//       <div className="grid gap-6">
//         {listings.map((listing: Listing) => (
//           <Card key={listing.id} className="overflow-hidden">
//             <Tabs defaultValue="details">
//               <CardHeader className="pb-2">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <CardDescription className="flex items-center gap-1">
//                       <MapPin className="h-3 w-3" /> 
//                       {listing.locationSubtitle} • {formatDistance(listing.distance)}
//                     </CardDescription>
//                     <CardTitle className="text-lg">{listing.title}</CardTitle>
//                   </div>
//                   <TabsList>
//                     <TabsTrigger value="details">Details</TabsTrigger>
//                     <TabsTrigger value="photos">Photos</TabsTrigger>
//                   </TabsList>
//                 </div>
//               </CardHeader>
              
//               <TabsContent value="details">
//                 <CardContent>
//                   <div className="flex flex-col md:flex-row gap-4">
//                     <div className="md:w-[300px] flex-shrink-0">
//                       <AspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden">
//                         <img 
//                           src={listing.thumbnail} 
//                           alt={listing.title}
//                           className="object-cover w-full h-full"
//                         />
//                       </AspectRatio>
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         <Badge variant="outline" className="flex items-center gap-1">
//                           <Home className="h-3 w-3" /> {listing.propertyType}
//                         </Badge>
//                         <Badge variant="outline" className="flex items-center gap-1">
//                           <Users className="h-3 w-3" /> {listing.personCapacity} guests
//                         </Badge>
//                         {listing.rating && listing.rating.guestSatisfaction && listing.rating.guestSatisfaction > 0 && (
//                           <Badge variant="outline" className="flex items-center gap-1">
//                             <Star className="h-3 w-3 fill-current" /> 
//                             {listing.rating.guestSatisfaction.toFixed(1)} 
//                             {listing.rating.reviewsCount && listing.rating.reviewsCount > 0 && ` (${listing.rating.reviewsCount})`}
//                           </Badge>
//                         )}
//                       </div>
                      
//                       <p className="text-sm line-clamp-3 mb-3">{listing.description}</p>
                      
//                       <div className="flex items-center gap-3 mb-3">
//                         <div className="flex items-center gap-2">
//                           <img 
//                             src={listing.host.profileImage} 
//                             alt={listing.host.name}
//                             className="w-6 h-6 rounded-full"
//                           />
//                           <span className="text-sm font-medium">{listing.host.name}</span>
//                         </div>
//                         {listing.host.isSuperHost && (
//                           <Badge variant="secondary" className="text-xs">Superhost</Badge>
//                         )}
//                       </div>
                      
//                       <div className="text-lg font-bold">{listing.price.price} <span className="text-sm font-normal text-muted-foreground">per night</span></div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </TabsContent>
              
//               <TabsContent value="photos">
//                 <CardContent>
//                   <ScrollArea className="h-[300px] rounded-md">
//                     <div className="grid grid-cols-2 gap-2">
//                       {listing.images.map((image, index) => (
//                         <div key={index} className="relative rounded-md overflow-hidden">
//                           <AspectRatio ratio={4/3}>
//                             <img 
//                               src={image.imageUrl} 
//                               alt={image.caption}
//                               className="object-cover w-full h-full"
//                             />
//                           </AspectRatio>
//                         </div>
//                       ))}
//                     </div>
//                   </ScrollArea>
//                 </CardContent>
//               </TabsContent>
              
//               <CardFooter className="flex justify-between">
//                 <div className="flex items-center text-sm text-muted-foreground">
//                   <Info className="h-4 w-4 mr-1" />
//                   <span>Listing ID: {listing.id.substring(0, 8)}...</span>
//                 </div>
//                 <Button asChild>
//                   <a href={listing.url} target="_blank" rel="noopener noreferrer">
//                     View on Airbnb
//                   </a>
//                 </Button>
//               </CardFooter>
//             </Tabs>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }