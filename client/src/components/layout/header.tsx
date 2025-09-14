import { Car, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Car className="text-primary text-xl" />
          <h1 className="text-lg font-semibold">Parts Finder</h1>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 rounded-full bg-muted hover:bg-accent"
          data-testid="button-profile"
        >
          <User className="text-sm" />
        </Button>
      </div>
    </header>
  );
}
