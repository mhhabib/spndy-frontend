import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

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
			title="Welcome Back"
			subtitle="Sign in to continue managing your finances"
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<div className="text-right">
					<Link
						to="/forgot-password"
						className="text-sm text-primary hover:underline"
					>
						Forgot password?
					</Link>
				</div>

				<Button
					type="submit"
					className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
					disabled={isLoading}
				>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</Button>

				<p className="text-center text-sm text-muted-foreground">
					Don't have an account?{' '}
					<Link
						to="/ticket"
						className="text-primary hover:underline font-medium"
					>
						Sign up
					</Link>
				</p>
				{isDev && (
					<div className="mt-4 p-4 border rounded bg-yellow-50 text-sm text-gray-700">
						<p className="font-semibold mb-1">
							Demo Credentials (Development Only):
						</p>
						<p>
							Email: <span className="font-mono">dev@gmail.com</span>
						</p>
						<p>
							Password: <span className="font-mono">qazwsx@123</span>
						</p>
					</div>
				)}
			</form>
		</AuthLayout>
	);
};

export default Login;
