import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Phone, MessageCircle, Store, Star, MapPin, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import type { SellerWithParts } from "@shared/schema";

export default function SellerProfile() {
  const [, params] = useRoute("/seller/:id");
  const sellerId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: seller, isLoading, error } = useQuery<SellerWithParts>({
    queryKey: ['/api/sellers', sellerId],
    enabled: !!sellerId,
  });

  const contactMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
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

  const handleContact = (type: "whatsapp" | "call") => {
    if (user) {
      contactMutation.mutate({ type });
    }

    if (seller) {
      if (type === "whatsapp" && seller.whatsapp) {
        window.open(`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
      } else if (type === "call") {
        window.location.href = `tel:${seller.phone}`;
      }
    }
  };

  const getAvailabilityColor = (availability: string) => {
    const option = AVAILABILITY_OPTIONS.find(opt => opt.value === availability);
    return option?.color || "gray";
  };

  const getAvailabilityLabel = (availability: string) => {
    const option = AVAILABILITY_OPTIONS.find(opt => opt.value === availability);
    return option?.label || availability;
  };

  if (isLoading) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Skeleton className="h-6 w-32" />
            <div className="w-10" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            <div className="text-center">
              <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h3 className="text-lg font-semibold">Seller Profile</h3>
            <div className="w-10" />
          </div>

          <div className="p-4 text-center py-8">
            <p className="text-destructive">Failed to load seller profile</p>
            <Link href="/">
              <Button className="mt-4">Go Back</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="app-container">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h3 className="text-lg font-semibold">Seller Profile</h3>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Seller Info */}
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
              <Store className="text-primary text-2xl" />
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h4 className="text-xl font-bold" data-testid="text-seller-name">
                {seller.shopName}
              </h4>
              {seller.verified && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="flex items-center text-sm">
                <Star className="text-yellow-400 w-4 h-4 mr-1" />
                <span data-testid="text-rating">{seller.rating} ({seller.reviewCount} reviews)</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm" data-testid="text-description">
              {seller.description}
            </p>
          </div>

          {/* Contact Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="text-primary w-5 h-5" />
                <span data-testid="text-phone">{seller.phone}</span>
              </div>
              {seller.whatsapp && (
                <div className="flex items-center space-x-3">
                  <MessageCircle className="text-green-500 w-5 h-5" />
                  <span data-testid="text-whatsapp">{seller.whatsapp}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <MapPin className="text-primary w-5 h-5" />
                <span data-testid="text-address">{seller.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Available Parts */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Available Parts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {seller.parts.length > 0 ? (
                seller.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      {part.imageUrl ? (
                        <img 
                          src={part.imageUrl} 
                          alt={part.name}
                          className="w-12 h-12 rounded object-cover" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/20 rounded flex items-center justify-center">
                          <Store className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-part-name-${part.id}`}>
                          {part.name}
                        </p>
                        {(part.vehicleMake || part.vehicleModel || part.vehicleYear) && (
                          <p className="text-xs text-muted-foreground" data-testid={`text-vehicle-info-${part.id}`}>
                            {[part.vehicleMake, part.vehicleModel, part.vehicleYear].filter(Boolean).join(' ')}
                          </p>
                        )}
                        <Badge 
                          variant="outline"
                          className={`text-xs mt-1 ${
                            getAvailabilityColor(part.availability) === 'green' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : getAvailabilityColor(part.availability) === 'yellow'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {getAvailabilityLabel(part.availability)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {part.price && (
                        <p className="font-semibold text-primary" data-testid={`text-price-${part.id}`}>
                          ₵{part.price}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No parts listed yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pb-8">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={() => handleContact("whatsapp")}
              data-testid="button-whatsapp"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={() => handleContact("call")}
              data-testid="button-call"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}