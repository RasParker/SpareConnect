import { Store, Star, MapPin, Phone, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import type { SearchResult } from "@shared/schema";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";

interface SellerCardProps {
  searchResult: SearchResult;
  onContactSeller: (sellerId: string, type: "whatsapp" | "call") => void;
  onViewProfile: (sellerId: string) => void;
}

export default function SellerCard({ searchResult, onContactSeller, onViewProfile }: SellerCardProps) {
  const { seller, matchingParts } = searchResult;
  const { user } = useAuth();

  const handleContact = (type: "whatsapp" | "call") => {
    if (user) {
      onContactSeller(seller.id, type);
    }
    
    // Open appropriate contact method
    if (type === "whatsapp" && seller.whatsapp) {
      window.open(`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    } else if (type === "call") {
      window.location.href = `tel:${seller.phone}`;
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

  return (
    <div className="seller-card bg-card rounded-lg p-4 border border-border" data-testid={`card-seller-${seller.id}`}>
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <Store className="text-primary" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold" data-testid={`text-seller-name-${seller.id}`}>
              {seller.shopName}
            </h4>
            {seller.verified && (
              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Star className="text-yellow-400 w-4 h-4 mr-1" />
            <span data-testid={`text-rating-${seller.id}`}>{seller.rating}</span>
            <span className="mx-1">•</span>
            <span data-testid={`text-review-count-${seller.id}`}>{seller.reviewCount} reviews</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span data-testid={`text-address-${seller.id}`}>{seller.address}</span>
          </div>

          {/* Available Parts */}
          <div className="mb-3 space-y-2">
            {matchingParts.map((part) => (
              <div key={part.id} className="flex items-center space-x-2 text-sm">
                <Badge 
                  variant="outline"
                  className={`text-xs ${
                    getAvailabilityColor(part.availability) === 'green' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : getAvailabilityColor(part.availability) === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {getAvailabilityLabel(part.availability)}
                </Badge>
                <span data-testid={`text-part-name-${part.id}`}>{part.name}</span>
                {part.price && (
                  <span className="text-primary font-semibold" data-testid={`text-price-${part.id}`}>
                    ₵{part.price}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Contact Buttons */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              className="contact-button flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={() => handleContact("whatsapp")}
              data-testid={`button-whatsapp-${seller.id}`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
            
            <Button
              size="sm"
              className="contact-button flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={() => handleContact("call")}
              data-testid={`button-call-${seller.id}`}
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="contact-button px-3 bg-muted hover:bg-accent"
              onClick={() => onViewProfile(seller.id)}
              data-testid={`button-view-profile-${seller.id}`}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
