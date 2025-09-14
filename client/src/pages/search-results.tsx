import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import DealerCard from "@/components/dealer-card";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResult } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  const { data: results, isLoading, error } = useQuery<SearchResult[]>({
    queryKey: ['/api/search', Object.fromEntries(searchParams.entries())],
    queryFn: async () => {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(searchParams.entries())),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      return response.json();
    },
  });

  const handleContactDealer = (dealerId: string, type: "whatsapp" | "call") => {
    // Handle contact logic
    console.log(`Contact dealer ${dealerId} via ${type}`);
  };

  const handleViewProfile = (dealerId: string) => {
    // Navigate to dealer profile
    console.log(`View profile for dealer ${dealerId}`);
  };

  if (isLoading) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          <Header />
          
          <section className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-56" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <BottomNav />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          <Header />
          
          <section className="p-4">
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load search results</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </section>
          
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="app-container">
        <Header />

        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" data-testid="text-results-count">
              Found {results?.length || 0} dealer{results?.length !== 1 ? 's' : ''}
            </h3>
            <Button variant="outline" size="sm" className="text-primary">
              <Map className="w-4 h-4 mr-1" />
              Map View
            </Button>
          </div>

          {results && results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <DealerCard
                  key={result.dealer.id}
                  searchResult={result}
                  onContactDealer={handleContactDealer}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No dealers found matching your criteria</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </section>

        <div className="h-20" />
        <BottomNav />
      </div>
    </div>
  );
}
