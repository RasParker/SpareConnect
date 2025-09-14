import { useQuery } from "@tanstack/react-query";
import { Bookmark, Search as SearchIcon, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import type { Search } from "@shared/schema";

export default function Saved() {
  const { user } = useAuth();

  const { data: searches = [], isLoading } = useQuery<Search[]>({
    queryKey: ['/api/searches', user?.id],
    enabled: !!user,
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const buildSearchUrl = (search: Search) => {
    const params = new URLSearchParams();
    if (search.vehicleMake) params.set('vehicleMake', search.vehicleMake);
    if (search.vehicleModel) params.set('vehicleModel', search.vehicleModel);
    if (search.vehicleYear) params.set('vehicleYear', search.vehicleYear);
    if (search.partName) params.set('partName', search.partName);
    return `/search?${params.toString()}`;
  };

  if (!user) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          <Header />
          
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to view your saved searches
              </p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
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
          <div className="flex items-center space-x-3 mb-6">
            <Bookmark className="text-primary text-xl" />
            <h2 className="text-xl font-bold">Saved Searches</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searches.length > 0 ? (
            <div className="space-y-4">
              {searches.map((search) => (
                <Card key={search.id} className="bg-card border-border hover:bg-card/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <SearchIcon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold" data-testid={`text-search-part-${search.id}`}>
                            {search.partName || "General Search"}
                          </h4>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {search.vehicleMake && (
                            <Badge variant="outline" className="text-xs">
                              {search.vehicleMake}
                            </Badge>
                          )}
                          {search.vehicleModel && (
                            <Badge variant="outline" className="text-xs">
                              {search.vehicleModel}
                            </Badge>
                          )}
                          {search.vehicleYear && (
                            <Badge variant="outline" className="text-xs">
                              {search.vehicleYear}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span data-testid={`text-search-date-${search.id}`}>
                            {formatDate(search.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <Link href={buildSearchUrl(search)}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-accent"
                          data-testid={`button-repeat-search-${search.id}`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Saved Searches</h3>
              <p className="text-muted-foreground mb-6">
                Your search history will appear here after you perform searches
              </p>
              <Link href="/">
                <Button>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Start Searching
                </Button>
              </Link>
            </div>
          )}
        </section>

        <div className="h-20" />
        <BottomNav />
      </div>
    </div>
  );
}
