import { useQuery } from "@tanstack/react-query";
import { Package, Star, MapPin, CheckCircle, Filter, Phone, MessageCircle, Eye } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PartWithSeller } from "@shared/schema";

export default function Parts() {
  const { data: parts = [], isLoading, error } = useQuery<PartWithSeller[]>({
    queryKey: ['/api/parts'],
  });

  // Filter to only show parts from verified sellers
  const verifiedParts = parts.filter(part => part.seller && part.seller.verified);

  if (isLoading) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          <Header />

          <section className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Package className="text-primary text-xl" />
                <h2 className="text-xl font-bold">All Parts</h2>
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
              <Package className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to Load Parts</h2>
              <p className="text-muted-foreground mb-4">
                Unable to fetch parts information
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
              <Package className="text-primary text-xl" />
              <h2 className="text-xl font-bold">All Parts</h2>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground" data-testid="text-parts-count">
              {verifiedParts.length} part{verifiedParts.length !== 1 ? 's' : ''} from verified sellers at Abossey Okai
            </p>
          </div>

          {verifiedParts.length > 0 ? (
            <div className="space-y-4">
              {verifiedParts.map((part) => (
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
                            onClick={() => window.open(`tel:${part.seller.phone}`, '_self')}
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
                              onClick={() => window.open(`https://wa.me/${part.seller.whatsapp}`, '_blank')}
                              data-testid={`button-whatsapp-${part.id}`}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                          <Link href={`/seller/${part.seller.id}`}>
                            <Button 
                              size="sm" 
                              variant="ghost"
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
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Parts Available</h3>
              <p className="text-muted-foreground">
                No parts from verified sellers are currently available
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