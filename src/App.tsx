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
import Tour from './pages/Tour';
import AddTour from './components/tour/AddTour';
import AddTourDay from './components/tour/AddTourDay';
import TourShareHandler from './pages/TourShareHandler';

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
							<Route path="/tours" element={<Tour />} />
							<Route path="/my-expenses" element={<MyExpenses />} />
							<Route path="/add-tour" element={<AddTour />} />
							<Route path="/add-tour-day" element={<AddTourDay />} />
						</Route>
						<Route element={<GuestRoute />}>
							<Route path="/login" element={<Login />} />
							<Route path="/ticket" element={<Signup />} />
						</Route>
						{/* Public dynamic route for shared links */}
						<Route path="/:hexId" element={<TourShareHandler />} />
						<Route path="/404" element={<NotFound />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
