import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';
import { Mail, Lock, ArrowRight, Copy, Check } from 'lucide-react';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const { login } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const success = await login(email, password);
			if (success) {
				toast({
					title: 'Login Successful',
					description: 'Welcome back!',
				});
				navigate('/');
			} else {
				toast({
					variant: 'destructive',
					title: 'Login Failed',
					description: 'Please check your credentials and try again.',
				});
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Login Error',
				description: 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const isDev = import.meta.env.MODE === 'development';

	return (
		<AuthLayout
			title="Welcome back"
			subtitle="Enter your credentials to access your account"
		>
			<form onSubmit={handleSubmit} className="space-y-6">
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
					<div className="flex items-center justify-between">
						<Label htmlFor="password" className="text-sm text-muted-foreground">
							Password
						</Label>
						<Link
							to="/forgot-password"
							className="text-xs text-primary/70 hover:text-primary transition-colors"
						>
							Forgot password?
						</Link>
					</div>
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
							Signing in...
						</span>
					) : (
						<span className="flex items-center gap-2">
							Sign in
							<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
						</span>
					)}
				</Button>

				<p className="text-center text-sm text-muted-foreground pt-2">
					Don't have an account?{' '}
					<Link
						to="/ticket"
						className="text-foreground font-medium hover:underline underline-offset-4"
					>
						Sign up
					</Link>
				</p>
			</form>

			{isDev && (
				<div className="mt-8 p-4 rounded-xl bg-muted/30 text-sm">
					<p className="font-medium text-foreground/80 mb-3 flex items-center gap-2">
						<span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
						Dev credentials
					</p>
					<div className="space-y-2">
						<button
							type="button"
							onClick={() => copyToClipboard('dev@gmail.com', 'email')}
							className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
						>
							<span className="text-xs font-mono text-muted-foreground">
								dev@gmail.com
							</span>
							{copiedField === 'email' ? (
								<Check className="w-3.5 h-3.5 text-green-500" />
							) : (
								<Copy className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
							)}
						</button>
						<button
							type="button"
							onClick={() => copyToClipboard('qazwsx@123', 'password')}
							className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
						>
							<span className="text-xs font-mono text-muted-foreground">
								qazwsx@123
							</span>
							{copiedField === 'password' ? (
								<Check className="w-3.5 h-3.5 text-green-500" />
							) : (
								<Copy className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
							)}
						</button>
					</div>
				</div>
			)}
		</AuthLayout>
	);
};

export default Login;
