import { useEffect, useState, useMemo } from 'react';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { useApiClient } from '@/utils/apiClient';

const AddTourDay = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const types = [
		'food',
		'expense',
		'experience',
		'hotel',
		'shopping',
		'transport',
	];
	const today = new Date();
	const apiClient = useApiClient();

	const isEditing = useMemo(
		() => location.state?.isEditing || false,
		[location.state]
	);
	const tourDayToEdit = useMemo(
		() => location.state?.day || null,
		[location.state]
	);

	const activeTourId = useMemo(
		() => location.state?.tourId || tourDayToEdit.tourId || null,
		[location.state, tourDayToEdit]
	);

	useEffect(() => {
		if (!activeTourId) navigate('/tours');
	}, [activeTourId]);

	const [formData, setFormData] = useState({
		description: isEditing ? tourDayToEdit.description : '',
		location: isEditing ? tourDayToEdit.location : '',
		amount: isEditing ? tourDayToEdit.amount : 0,
		tourId: isEditing ? tourDayToEdit.tourId : activeTourId,
		type: isEditing ? tourDayToEdit.type : '',
		date: isEditing
			? new Date(tourDayToEdit.date).toISOString().split('T')[0]
			: today.toISOString().split('T')[0],
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!formData.description ||
			!formData.tourId ||
			!formData.type ||
			(formData.type !== 'experience' && !formData.amount)
		) {
			toast({
				title: 'Error',
				description: 'Please fill all required fields',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const tourDayData = {
				description: formData.description,
				location: formData.location,
				date: formData.date,
				amount: formData.amount,
				type: formData.type,
				tourId: formData.tourId,
			};

			if (isEditing) {
				await apiClient.put(`/entries/${tourDayToEdit.id}`, tourDayData);
				toast({
					title: 'Success',
					description: 'Tour day details updated successfully',
				});
				navigate('/tours');
			} else {
				await apiClient.post('/entries', tourDayData);
				toast({
					title: 'Success',
					description: 'Tour day details added successfully',
				});
				navigate('/tours');
			}
		} catch (error: any) {
			console.error(
				`Error ${isEditing ? 'updating' : 'adding'} tour day:`,
				error
			);
			toast({
				title: 'Error',
				description: `Failed to ${
					isEditing ? 'update' : 'add'
				} tour day. Please try again.`,
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleTypeChange = (value) => {
		setFormData((prev) => ({ ...prev, type: value }));
	};

	return (
		<main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
			<Card className="card-glass w-full animate-fade-in">
				<CardHeader>
					<CardTitle>
						{isEditing
							? 'Update the details for this specific tour day'
							: 'Fill in the details for this specific tour day'}
					</CardTitle>
					<CardDescription>
						{isEditing
							? 'Update the details of your tour day information'
							: 'Enter the details of your tour day information'}
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Dine at coral station"
								disabled={isSubmitting}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="type">Type</Label>
							<Select
								value={formData.type}
								onValueChange={handleTypeChange}
								disabled={isSubmitting}
							>
								<SelectTrigger id="type">
									<SelectValue placeholder="Select Type" />
								</SelectTrigger>
								<SelectContent
									style={{ maxHeight: '160px', overflowY: 'auto' }}
								>
									{types.map((name) => (
										<SelectItem key={name} value={name}>
											{name.replace(/^./, (char) => char.toUpperCase())}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{formData.type !== 'experience' && (
							<div className="space-y-2">
								<Label htmlFor="amount">Amount</Label>
								<Input
									id="amount"
									name="amount"
									type="number"
									value={formData.amount}
									onChange={handleChange}
									placeholder="0.00"
									min="0"
									step="0.01"
									disabled={isSubmitting}
								/>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="location">Location(Optional)</Label>
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
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								name="date"
								type="date"
								value={formData.date}
								onChange={handleChange}
								className="bg-white/70 backdrop-blur-sm"
								disabled={isSubmitting}
							/>
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
								<>{isEditing ? 'Update details' : 'Add details'}</>
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</main>
	);
};

export default AddTourDay;
