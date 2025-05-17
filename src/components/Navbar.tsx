import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart, LogIn, Plane, Plus, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import habibAvatar from '@/avatar/habib.jpg';
import kanjunAvatar from '@/avatar/kanjun.jpg';

const Navbar = () => {
	const { username, email, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();

	const handleLogout = () => {
		logout();
		toast({
			title: 'Logged Out',
			description: 'You have been successfully logged out.',
		});
		navigate('/');
	};

	// Check if current path matches the given path
	const isActive = (path) => {
		return location.pathname === path;
	};

	const getUserAvatar = (userName: string) => {
		return userName === 'Habib' ? habibAvatar : kanjunAvatar;
	};

	return (
		<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-xs w-full px-4 py-3 sm:px-6">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<div>
					<Link to="/" className="flex items-center space-x-2">
						<div className="flex items-center gap-2">
							<Wallet size={20} className="text-primary" />
							<span className="text-2xl font-bold tracking-wide text-primary">
								SPNDY
							</span>
						</div>
					</Link>
				</div>

				<div className="flex items-center space-x-1 sm:space-x-4">
					{isAuthenticated ? (
						<>
							<Link to="/add-expense">
								<Button
									size="icon"
									variant="ghost"
									className={cn(
										'nav-icon relative',
										isActive('/add-expense') &&
											'bg-primary/20 text-primary hover:bg-primary/30'
									)}
								>
									<Plus className="h-5 w-5" />
									<span className="sr-only">Add Expense</span>
								</Button>
							</Link>

							<Link to="/tours">
								<Button
									size="icon"
									variant="ghost"
									className={cn(
										'nav-icon relative',
										isActive('/tours') &&
											'bg-primary/20 text-primary hover:bg-primary/30'
									)}
								>
									<Plane className="h-5 w-5" />
									<span className="sr-only">Tours</span>
								</Button>
							</Link>

							<Link to="/summary">
								<Button
									size="icon"
									variant="ghost"
									className={cn(
										'nav-icon relative',
										isActive('/summary') &&
											'bg-primary/20 text-primary hover:bg-primary/30'
									)}
								>
									<BarChart className="h-5 w-5" />
									<span className="sr-only">Summary</span>
								</Button>
							</Link>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className={cn(
											'relative h-9 w-9 rounded-full flex items-center justify-center p-0',
											(isActive('/my-expenses') || isActive('/settings')) &&
												'bg-primary/20 text-primary hover:bg-primary/30'
										)}
									>
										<img
											className="w-6 h-6 rounded-full object-cover"
											src={getUserAvatar(username)}
											alt="profile picture"
										/>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56 bg-popover">
									<div className="flex flex-col space-y-1 p-2">
										<p className="text-sm font-medium leading-none">
											{username || 'User'}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{email || 'user@example.com'}
										</p>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className={cn(
											'cursor-pointer',
											isActive('/my-expenses') && 'bg-primary/20 text-primary'
										)}
										asChild
									>
										<Link to="/my-expenses">My Expenses</Link>
									</DropdownMenuItem>
									<DropdownMenuItem
										className={cn(
											'cursor-pointer',
											isActive('/settings') && 'bg-primary/20 text-primary'
										)}
										asChild
									>
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
								<Button
									variant="ghost"
									className={cn(
										'nav-icon',
										isActive('/summary') &&
											'bg-primary/20 text-primary hover:bg-primary/30'
									)}
								>
									<BarChart className="h-5 w-5 mr-2" />
									<span className="hidden sm:inline">Summary</span>
								</Button>
							</Link>

							<Link to="/login">
								<Button
									variant="default"
									className={cn(
										'nav-icon',
										isActive('/login') && 'bg-primary/30 border-primary/20'
									)}
								>
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
