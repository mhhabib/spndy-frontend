import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
		<div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">Time to track the damage?</h1>
					<p className="text-muted-foreground">
						Let’s find out who’s been eating your money.
					</p>
				</div>

				<div className="bg-card rounded-lg shadow-lg p-6 border">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
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
								placeholder="your@email.com"
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
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? 'Joining the club ongoing...' : 'Join the Club'}
						</Button>
					</form>

					<div className="mt-6 text-center text-sm">
						Been here before?{' '}
						<Link to="/login" className="text-primary hover:underline">
							Track Regret
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;
