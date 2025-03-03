
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Settings, User, BarChart, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  showEditControls: boolean;
  onToggleEditControls: (value: boolean) => void;
}

const Navbar = ({ showEditControls, onToggleEditControls }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 w-full px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-semibold text-xl tracking-tight">ExpenseTracker</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center mr-2">
                <span className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">Edit Mode</span>
                <Switch
                  checked={showEditControls}
                  onCheckedChange={onToggleEditControls}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <Link to="/summary">
                <Button size="icon" variant="ghost" className="nav-icon relative">
                  <BarChart className="h-5 w-5" />
                  <span className="sr-only">Summary</span>
                </Button>
              </Link>

              <Link to="/add-expense">
                <Button size="icon" variant="ghost" className="nav-icon relative">
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Add Expense</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/my-expenses">My Expenses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive"
                    onClick={handleLogout}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/summary">
                <Button variant="ghost" className="nav-icon">
                  <BarChart className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Summary</span>
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="default" className="nav-icon">
                  <LogIn className="h-5 w-5 mr-2" />
                  <span>Login</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
