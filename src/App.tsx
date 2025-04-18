import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from './pages/Index';
import AddExpense from './pages/AddExpense';
import Settings from './pages/Settings';
import Summary from './pages/Summary';
import MyExpenses from './pages/MyExpenses';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<Routes>
						<Route element={<ProtectedRoute />}>
							<Route path="/" element={<Index />} />
							<Route path="/summary" element={<Summary />} />
							<Route path="/add-expense" element={<AddExpense />} />
							<Route path="/settings" element={<Settings />} />
							<Route path="/my-expenses" element={<MyExpenses />} />
						</Route>
						<Route element={<GuestRoute />}>
							<Route path="/login" element={<Login />} />
							<Route path="/ticket" element={<Signup />} />
						</Route>
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
