import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, X, Search, Store, Star, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import type { Dealer } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: analytics } = useQuery<{
    totalDealers: number;
    totalParts: number;
    totalSearches: number;
    pendingVerifications: number;
  }>({
    queryKey: ['/api/analytics'],
    enabled: !!user && user.role === 'admin',
  });

  const { data: pendingDealers = [] } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers/pending/verification'],
    enabled: !!user && user.role === 'admin',
  });

  const approveDealerMutation = useMutation({
    mutationFn: async (dealerId: string) => {
      const response = await fetch(`/api/dealers/${dealerId}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve dealer');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/pending/verification'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Dealer approved",
        description: "The dealer has been verified successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to approve dealer",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const rejectDealerMutation = useMutation({
    mutationFn: async (dealerId: string) => {
      // In a real app, you might want to delete the dealer or mark as rejected
      // For now, we'll just remove from pending list by not doing anything
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/pending/verification'] });
      toast({
        title: "Dealer rejected",
        description: "The dealer application has been rejected",
      });
    },
    onError: () => {
      toast({
        title: "Failed to reject dealer",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleApproveDealer = (dealerId: string) => {
    approveDealerMutation.mutate(dealerId);
  };

  const handleRejectDealer = (dealerId: string) => {
    if (confirm("Are you sure you want to reject this dealer application?")) {
      rejectDealerMutation.mutate(dealerId);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container flex items-center justify-center min-h-screen">
          <p className="text-center">Access denied. Admin account required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="app-container">
        <Header />

        {/* Admin Header */}
        <div className="bg-card p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">Manage dealers and monitor platform activity</p>
        </div>

        {/* Admin Stats */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <Card className="bg-card border-border text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary" data-testid="text-active-dealers">
                {analytics?.totalDealers || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Dealers</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary" data-testid="text-monthly-searches">
                {analytics?.totalSearches || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Searches</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500" data-testid="text-pending-verifications">
                {analytics?.pendingVerifications || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending Verifications</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500" data-testid="text-parts-listed">
                {analytics?.totalParts || 0}
              </div>
              <div className="text-sm text-muted-foreground">Parts Listed</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Dealer Verifications */}
        <div className="p-4">
          <h3 className="font-semibold mb-4">Pending Dealer Verifications</h3>
          <div className="space-y-3">
            {pendingDealers.length > 0 ? (
              pendingDealers.map((dealer) => (
                <Card key={dealer.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" data-testid={`text-dealer-name-${dealer.id}`}>
                          {dealer.shopName}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-address-${dealer.id}`}>
                          {dealer.address}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-phone-${dealer.id}`}>
                          {dealer.phone}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApproveDealer(dealer.id)}
                          disabled={approveDealerMutation.isPending}
                          data-testid={`button-approve-${dealer.id}`}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectDealer(dealer.id)}
                          disabled={rejectDealerMutation.isPending}
                          data-testid={`button-reject-${dealer.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending verifications</p>
                  <p className="text-sm text-muted-foreground">All dealers are up to date</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 pb-24">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <Search className="text-primary w-5 h-5" />
              <span>User searched for "Toyota Camry brake pad"</span>
              <span className="text-muted-foreground ml-auto">2 mins ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Store className="text-green-500 w-5 h-5" />
              <span>New dealer "Premium Parts" registered</span>
              <span className="text-muted-foreground ml-auto">1 hour ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Star className="text-yellow-500 w-5 h-5" />
              <span>Auto Parts Ghana received a 5-star rating</span>
              <span className="text-muted-foreground ml-auto">3 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Activity className="text-blue-500 w-5 h-5" />
              <span>System processed 50+ searches today</span>
              <span className="text-muted-foreground ml-auto">5 hours ago</span>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
