import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";
import DealerProfile from "@/pages/dealer-profile";
import DealerDashboard from "@/pages/dealer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Saved from "@/pages/saved";
import Parts from "@/pages/dealers";
import Profile from "@/pages/profile";
import Login from "@/pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route path="/dealer/:id" component={DealerProfile} />
      <Route path="/dealer-dashboard" component={DealerDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/saved" component={Saved} />
      <Route path="/parts" component={Parts} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
