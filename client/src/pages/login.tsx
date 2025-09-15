import { useState } from "react";
import { Car, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/login-form";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="app-container flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Car className="text-primary text-2xl" />
              <h1 className="text-2xl font-bold">Parts Finder</h1>
            </div>
            <p className="text-muted-foreground">
              Welcome back! Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Demo Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Seller:</strong> autopartsghana / dealer123</p>
                <p><strong>Buyer:</strong> Create new account</p>
              </div>
            </CardContent>
          </Card>

          {/* Back to App */}
          <div className="text-center">
            <Link href="/">
              <Button variant="outline" size="sm">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
