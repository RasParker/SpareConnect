import { useState } from "react";
import { User, LogOut, Settings, Shield, Store, HelpCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!user) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container">
          <Header />
          
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to view your profile
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
          {/* User Info Card */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg" data-testid="text-username">
                    {user.username}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground" data-testid="text-email">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'outline'}
                      className={
                        user.role === 'admin' 
                          ? 'bg-primary text-primary-foreground' 
                          : user.role === 'dealer'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }
                    >
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role === 'dealer' && <Store className="w-3 h-3 mr-1" />}
                      {user.role === 'buyer' && <User className="w-3 h-3 mr-1" />}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Dashboard Links */}
          {user.role === 'dealer' && (
            <Card className="bg-card border-border mb-4">
              <CardContent className="p-4">
                <Link href="/dealer-dashboard">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    data-testid="button-dealer-dashboard"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Dealer Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {user.role === 'admin' && (
            <Card className="bg-card border-border mb-4">
              <CardContent className="p-4">
                <Link href="/admin-dashboard">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    data-testid="button-admin-dashboard"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Menu Options */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-4 py-3 h-auto"
                  data-testid="button-settings"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Button>
                
                <Separator className="mx-4" />
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-4 py-3 h-auto"
                  data-testid="button-help"
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Help & Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

          {/* App Info */}
          <div className="text-center mt-8 mb-24">
            <p className="text-xs text-muted-foreground">
              Parts Finder v1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Connecting buyers with dealers at Abossey Okai
            </p>
          </div>
        </section>

        <BottomNav />
      </div>
    </div>
  );
}
