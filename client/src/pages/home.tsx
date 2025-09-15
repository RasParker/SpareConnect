import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import SearchForm from "@/components/search-form";
import { Map, MapPin, Package, Star, Phone, MessageCircle, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    mutationFn: async ({ sellerId, type }: { sellerId: string; type: string }) => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          sellerId,
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

  const handleContactSeller = (sellerId: string, type: "whatsapp" | "call") => {
    if (user) {
      contactMutation.mutate({ sellerId, type });
    }
    
    // Open appropriate contact method
    if (type === "whatsapp") {
      // Find seller to get whatsapp number
      const seller = searchResults?.find(r => r.seller.id === sellerId)?.seller;
      if (seller?.whatsapp) {
        window.open(`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
      }
    } else if (type === "call") {
      // Find seller to get phone number
      const seller = searchResults?.find(r => r.seller.id === sellerId)?.seller;
      if (seller?.phone) {
        window.open(`tel:${seller.phone}`, '_self');
      }
    }
  };

  const handleViewProfile = (sellerId: string) => {
    if (user) {
      contactMutation.mutate({ sellerId, type: "profile_view" });
    }
    // Navigation will be handled by the Link component
  };

  // Flatten search results to individual parts with seller information
  const allParts = searchResults?.flatMap(result => 
    result.matchingParts.map(part => ({
      ...part,
      seller: {
        id: result.seller.id,
        shopName: result.seller.shopName,
        address: result.seller.address,
        phone: result.seller.phone,
        whatsapp: result.seller.whatsapp,
        verified: result.seller.verified,
        rating: result.seller.rating
      }
    }))
  ) || [];

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
                Found {allParts.length} part{allParts.length !== 1 ? 's' : ''}
              </h3>
              <Button variant="outline" size="sm" className="text-primary">
                <Map className="w-4 h-4 mr-1" />
                Map View
              </Button>
            </div>

            <div className="space-y-4">
              {allParts.map((part) => (
                <Card key={part.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {part.imageUrl ? (
                          <img 
                            src={part.imageUrl} 
                            alt={part.name}
                            className="w-full h-full object-cover"
                            data-testid={`img-part-${part.id}`}
                          />
                        ) : (
                          <Package className="text-primary" size={24} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold" data-testid={`text-part-name-${part.id}`}>
                              {part.name}
                            </h4>
                            {part.seller.verified && (
                              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Seller
                              </Badge>
                            )}
                          </div>
                          {part.price && (
                            <span className="font-bold text-primary" data-testid={`text-price-${part.id}`}>
                              ₵{parseFloat(part.price).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {(part.vehicleMake || part.vehicleModel || part.vehicleYear) && (
                          <div className="text-sm text-muted-foreground mb-2" data-testid={`text-vehicle-${part.id}`}>
                            {[part.vehicleMake, part.vehicleModel, part.vehicleYear].filter(Boolean).join(' ')}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-4">
                            <Badge 
                              variant={part.availability === 'in_stock' ? 'default' : part.availability === 'low_stock' ? 'secondary' : 'destructive'}
                              className="text-xs"
                              data-testid={`badge-availability-${part.id}`}
                            >
                              {part.availability === 'in_stock' ? 'In Stock' : 
                               part.availability === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="text-yellow-400 w-4 h-4 mr-1" />
                              <span data-testid={`text-seller-rating-${part.id}`}>{part.seller.rating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span data-testid={`text-seller-address-${part.id}`}>{part.seller.address}</span>
                          <span className="mx-2">•</span>
                          <span data-testid={`text-seller-name-${part.id}`}>{part.seller.shopName}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleContactSeller(part.seller.id, 'call')}
                            data-testid={`button-call-${part.id}`}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          {part.seller.whatsapp && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleContactSeller(part.seller.id, 'whatsapp')}
                              data-testid={`button-whatsapp-${part.id}`}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                          <Link href={`/dealer/${part.seller.id}`}>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewProfile(part.seller.id)}
                              data-testid={`button-view-seller-${part.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {allParts.length > 0 && (
              <div className="mt-6">
                <Card className="bg-card border-border overflow-hidden">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center text-base">
                      <Map className="w-5 h-5 mr-2 text-primary" />
                      Part Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="map-container h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mb-2 mx-auto" />
                        <p className="text-sm">Interactive map showing part locations</p>
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