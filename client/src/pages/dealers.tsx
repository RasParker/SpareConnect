import { useQuery } from "@tanstack/react-query";
import { Store, Star, MapPin, CheckCircle, Filter } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Dealer } from "@shared/schema";

export default function Dealers() {
  const { data: dealers = [], isLoading, error } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers'],
  });

  // Filter to only show verified dealers
  const verifiedDealers = dealers.filter(dealer => dealer.verified);

  if (isLoading) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          <Header />
          
          <section className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Store className="text-primary text-xl" />
                <h2 className="text-xl font-bold">All Dealers</h2>
              </div>
              <Skeleton className="h-8 w-16" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
          
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Store className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to Load Dealers</h2>
              <p className="text-muted-foreground mb-4">
                Unable to fetch dealer information
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
          
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Store className="text-primary text-xl" />
              <h2 className="text-xl font-bold">All Dealers</h2>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground" data-testid="text-dealers-count">
              {verifiedDealers.length} verified dealer{verifiedDealers.length !== 1 ? 's' : ''} at Abossey Okai
            </p>
          </div>

          {verifiedDealers.length > 0 ? (
            <div className="space-y-4">
              {verifiedDealers.map((dealer) => (
                <Link key={dealer.id} href={`/dealer/${dealer.id}`}>
                  <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Store className="text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold" data-testid={`text-dealer-name-${dealer.id}`}>
                              {dealer.shopName}
                            </h4>
                            {dealer.verified && (
                              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Star className="text-yellow-400 w-4 h-4 mr-1" />
                            <span data-testid={`text-rating-${dealer.id}`}>{dealer.rating}</span>
                            <span className="mx-1">•</span>
                            <span data-testid={`text-review-count-${dealer.id}`}>{dealer.reviewCount} reviews</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span data-testid={`text-address-${dealer.id}`}>{dealer.address}</span>
                          </div>

                          {dealer.description && (
                            <p className="text-sm text-muted-foreground" data-testid={`text-description-${dealer.id}`}>
                              {dealer.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Verified Dealers</h3>
              <p className="text-muted-foreground">
                No verified dealers are currently available
              </p>
            </div>
          )}
        </section>

        <div className="h-20" />
        <BottomNav />
      </div>
    </div>
  );
}
