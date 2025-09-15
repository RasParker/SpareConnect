import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Map, Package, Star, MapPin, Phone, MessageCircle, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import type { SearchResult, Part, Seller } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const { user } = useAuth();
  
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

  const handleContactSeller = (sellerId: string, type: "whatsapp" | "call") => {
    if (user) {
      contactMutation.mutate({ sellerId, type });
    }
    
    // Open appropriate contact method
    if (type === "whatsapp") {
      // Find seller to get whatsapp number
      const seller = results?.find(r => r.seller.id === sellerId)?.seller;
      if (seller?.whatsapp) {
        window.open(`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
      }
    } else if (type === "call") {
      // Find seller to get phone number
      const seller = results?.find(r => r.seller.id === sellerId)?.seller;
      if (seller?.phone) {
        window.open(`tel:${seller.phone}`, '_self');
      }
    }
  };

  const handleViewProfile = (sellerId: string) => {
    if (user) {
      contactMutation.mutate({ sellerId, type: "profile_view" });
    }
  };

  // Flatten search results to individual parts with seller information
  const allParts = results?.flatMap(result => 
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
              Found {allParts?.length || 0} part{allParts?.length !== 1 ? 's' : ''}
            </h3>
            <Button variant="outline" size="sm" className="text-primary">
              <Map className="w-4 h-4 mr-1" />
              Map View
            </Button>
          </div>

          {allParts && allParts.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No parts found matching your criteria</p>
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
