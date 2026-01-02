import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';

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
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="username">Username</Label>
					<Input
						id="usernsmse"
						type="text"
						placeholder="John Doe"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>

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

				<Button
					type="submit"
					className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
					disabled={isLoading}
				>
					{isLoading ? 'Creating account...' : 'Sign Up'}
				</Button>

				<p className="text-center text-sm text-muted-foreground">
					Already have an account?{' '}
					<Link
						to="/login"
						className="text-primary hover:underline font-medium"
					>
						Sign in
					</Link>
				</p>
			</form>
		</AuthLayout>
	);
};

export default Signup;
