import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { API_BASE_URL } from '@/config/Config';
import { Loader2 } from 'lucide-react';

const AddTour = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const { token } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Check if we're in edit mode based on the location state
	const isEditing = location.state?.isEditing || false;
	const tourToEdit = location.state?.tour || null;

	const today = new Date();

	// Initialize form with either existing expense data or defaults
	const [formData, setFormData] = useState({
		name: isEditing ? tourToEdit.name : '',
		location: isEditing ? tourToEdit.location : '',
		startDate: isEditing
			? new Date(tourToEdit.startDate).toISOString().split('T')[0]
			: today.toISOString().split('T')[0],
		endDate: isEditing
			? new Date(tourToEdit.endDate).toISOString().split('T')[0]
			: new Date(today.getTime() + 24 * 60 * 60 * 1000)
					.toISOString()
					.split('T')[0],
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name || !formData.location) {
			toast({
				title: 'Error',
				description: 'Please fill all required fields',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const tourData = {
				name: formData.name,
				location: formData.location,
				startDate: formData.startDate,
				endDate: formData.endDate,
				totalCost: 0,
				isPublic: false,
			};
			if (isEditing) {
				await axios.put(`${API_BASE_URL}/tours/${tourToEdit.id}`, tourData, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				});
				toast({
					title: 'Success',
					description: 'Expense updated successfully',
				});
				navigate('/tours');
			} else {
				const respone = await axios.post(`${API_BASE_URL}/tours`, tourData, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				});
				console.log('Add tour ', respone.data);
				toast({ title: 'Success', description: 'Expense added successfully' });
				navigate('/tours');
			}
		} catch (error) {
			console.error(
				`Error ${isEditing ? 'updating' : 'adding'} expense:`,
				error
			);
			toast({
				title: 'Error',
				description: `Failed to ${
					isEditing ? 'update' : 'add'
				} expense. Please try again.`,
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
				<Card className="card-glass w-full animate-fade-in">
					<CardHeader>
						<CardTitle>
							{isEditing ? 'Update tour informations' : 'Add tour informations'}
						</CardTitle>
						<CardDescription>
							{isEditing
								? 'Update the details of your tour information'
								: 'Enter the details of your tour information'}
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Tour Name</Label>
								<Input
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="Winter in Sundarban"
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="location">Location</Label>
								<Input
									id="location"
									name="location"
									type="location"
									value={formData.location}
									onChange={handleChange}
									placeholder="Dhaka, Bangladesh"
									disabled={isSubmitting}
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Start Date */}
								<div className="space-y-2">
									<Label htmlFor="startDate">Start Date</Label>
									<Input
										id="startDate"
										name="startDate"
										type="date"
										value={formData.startDate}
										onChange={handleChange}
										className="bg-white/70 backdrop-blur-sm"
										disabled={isSubmitting}
									/>
								</div>

								{/* End Date */}
								<div className="space-y-2">
									<Label htmlFor="endDate">End Date</Label>
									<Input
										id="endDate"
										name="endDate"
										type="date"
										value={formData.endDate}
										onChange={handleChange}
										className="bg-white/70 backdrop-blur-sm"
										disabled={isSubmitting}
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate('/tours')}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{isEditing ? 'Updating...' : 'Adding...'}
									</>
								) : (
									<>{isEditing ? 'Update Tour' : 'Add Tour'}</>
								)}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</main>
			<Footer />
		</div>
	);
};

export default AddTour;
