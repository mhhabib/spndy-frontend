import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';

const Signup = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { signup } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const success = await signup(username, email, password);
			if (success) {
				toast({
					title: 'Account Created',
					description: 'Welcome to ExpenseTracker!',
				});
				navigate('/login');
			} else {
				toast({
					variant: 'destructive',
					title: 'Signup Failed',
					description: 'Please check your information and try again.',
				});
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Signup Error',
				description: 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Create Account"
			subtitle="Start your financial journey today"
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="username" className="text-sm text-muted-foreground">
						Username
					</Label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
						<Input
							id="username"
							type="text"
							placeholder="johndoe"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="h-11 pl-10 bg-muted/30 border-0 focus:bg-muted/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email" className="text-sm text-muted-foreground">
						Email
					</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="h-11 pl-10 bg-muted/30 border-0 focus:bg-muted/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="password" className="text-sm text-muted-foreground">
						Password
					</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="h-11 pl-10 bg-muted/30 border-0 focus:bg-muted/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
						/>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full h-11 font-medium bg-foreground text-background hover:bg-foreground/90 transition-all group"
					disabled={isLoading}
				>
					{isLoading ? (
						<span className="flex items-center gap-2">
							<span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
							Signing up...
						</span>
					) : (
						<span className="flex items-center gap-2">
							Sign up
							<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
						</span>
					)}
				</Button>

				<p className="text-center text-sm text-muted-foreground pt-2">
					Already have an account?{' '}
					<Link
						to="/login"
						className="text-foreground font-medium hover:underline underline-offset-4"
					>
						Sign in
					</Link>
				</p>
			</form>
		</AuthLayout>
	);
};

export default Signup;
