import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import SearchForm from "@/components/search-form";
import DealerCard from "@/components/dealer-card";
import { Map, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { SearchResult } from "@shared/schema";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (searchData: any) => {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...searchData,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setHasSearched(true);
      if (data.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search criteria",
        });
      }
    },
    onError: () => {
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const contactMutation = useMutation({
    mutationFn: async ({ dealerId, type }: { dealerId: string; type: string }) => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          dealerId,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record contact");
      }

      return response.json();
    },
  });

  const handleSearch = (searchData: any) => {
    searchMutation.mutate(searchData);
  };

  const handleContactDealer = (dealerId: string, type: "whatsapp" | "call") => {
    if (user) {
      contactMutation.mutate({ dealerId, type });
    }
  };

  const handleViewProfile = (dealerId: string) => {
    if (user) {
      contactMutation.mutate({ dealerId, type: "profile_view" });
    }
    // Navigation will be handled by the Link component
  };

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="app-container">
        <Header />

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={searchMutation.isPending}
        />

        {hasSearched && (
          <section className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" data-testid="text-results-count">
                Found {searchResults.length} dealer{searchResults.length !== 1 ? 's' : ''}
              </h3>
              <Button variant="outline" size="sm" className="text-primary">
                <Map className="w-4 h-4 mr-1" />
                Map View
              </Button>
            </div>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <DealerCard
                  key={result.dealer.id}
                  searchResult={result}
                  onContactDealer={handleContactDealer}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-6">
                <Card className="bg-card border-border overflow-hidden">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center text-base">
                      <Map className="w-5 h-5 mr-2 text-primary" />
                      Dealer Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="map-container h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mb-2 mx-auto" />
                        <p className="text-sm">Interactive map showing dealer locations</p>
                        <p className="text-xs mt-1">Map integration pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        )}

        <div className="h-20" />
        <BottomNav />
      </div>
    </div>
  );
}
