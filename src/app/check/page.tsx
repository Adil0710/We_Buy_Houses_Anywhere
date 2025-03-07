'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: string;
  distance: number;
  url: string;
  // Add other fields as needed
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  const searchListings = async (searchLocation: string) => {
    setListings([]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings?location=${encodeURIComponent(searchLocation)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              setError(data.error);
              break;
            }
            
            if (data.done) {
              setLoading(false);
              break;
            }

            setListings(prev => [...prev, data].sort((a, b) => a.distance - b.distance));
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Property Listings</h1>
        
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location..."
            className="flex-1 px-4 py-2 rounded-lg border border-input"
          />
          <button
            onClick={() => searchListings(location)}
            disabled={loading || !location}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <span>Loading listings...</span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <div key={listing.id} className="p-4 rounded-lg border bg-card">
              <h2 className="text-lg font-semibold mb-2">{listing.title}</h2>
              <p className="text-muted-foreground mb-2">{listing.price}</p>
              <p className="text-sm text-muted-foreground">
                {listing.distance.toFixed(2)} km away
              </p>
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                View listing
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}