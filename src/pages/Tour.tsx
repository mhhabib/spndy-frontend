import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourHeader from '@/components/tour/TourHeader';
import TourList from '@/components/tour/TourList';
import TourDaysList from '@/components/tour/TourDaysList';
import { Tour } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UUID } from 'crypto';
import { useApiClient } from '@/utils/apiClient';

export default function TourPlanner() {
	const [activeTourDropdown, setActiveTourDropdown] = useState<UUID>(null);
	const [activeDayDropdown, setActiveDayDropdown] = useState<UUID>(null);
	const [isTourPublic, setIsTourPublic] = useState<Boolean>(false);
	const [tours, setTours] = useState<Tour[]>([]);
	const [activeTourId, setActiveTourId] = useState<UUID>(null);

	const navigate = useNavigate();
	const { token, userId } = useAuth();
	const { toast } = useToast();
	const apiClient = useApiClient();

	const fetchTours = async () => {
		try {
			const data = await apiClient.get('/tours');
			const sortedTourData = data.sort((a, b) => {
				const endA = new Date(a.endDate).getTime();
				const endB = new Date(b.endDate).getTime();

				if (endA === endB) {
					const createdA = new Date(a.createdAt).getTime();
					const createdB = new Date(b.createdAt).getTime();
					return createdB - createdA;
				}
				return endB - endA;
			});

			setTours(sortedTourData);
			if (sortedTourData.length > 0) setActiveTourId(sortedTourData[0].id);
		} catch (error) {
			console.error('Error loading tours:', error);
			toast({
				title: 'Error',
				description: 'Failed to load tours from server.',
				variant: 'destructive',
			});
		}
	};

	useEffect(() => {
		fetchTours();
	}, [toast]);

	const activeTour = useMemo(() => {
		return tours.find((tour) => tour.id === activeTourId) || tours[0];
	}, [tours, activeTourId, isTourPublic]);

	const totalShoppingCost = useMemo(() => {
		const tour = tours.find((t) => t.id === activeTourId);
		if (!tour) return 0;

		return tour.entries
			.filter(
				(entry) => entry.type === 'shopping' && !isNaN(Number(entry.amount))
			)
			.reduce((sum, entry) => sum + Number(entry.amount), 0);
	}, [tours, activeTourId, isTourPublic]);

	const myTotalTourCost = useMemo(() => {
		const tour = tours.find((t) => t.id === activeTourId);
		if (!tour || !userId) return 0;

		return tour.entries
			.filter(
				(entry) => entry.userId === userId && !isNaN(Number(entry.amount))
			)
			.reduce((sum, entry) => sum + Number(entry.amount), 0);
	}, [tours, userId, activeTourId, isTourPublic]);

	// Handle click outside dropdowns
	useEffect(() => {
		function handleClickOutside(event) {
			if (activeTourDropdown !== null) {
				const dropdownElement = document.getElementById(
					`tour-dropdown-${activeTourDropdown}`
				);
				if (
					dropdownElement &&
					!dropdownElement.contains(event.target) &&
					!event.target.closest(`#tour-button-${activeTourDropdown}`)
				) {
					setActiveTourDropdown(null);
				}
			}
			if (activeDayDropdown !== null) {
				const dropdownElement = document.getElementById(
					`day-dropdown-${activeDayDropdown}`
				);
				if (
					dropdownElement &&
					!dropdownElement.contains(event.target) &&
					!event.target.closest(`#day-button-${activeDayDropdown}`)
				) {
					setActiveDayDropdown(null);
				}
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [activeTourDropdown, activeDayDropdown]);

	const handleTourClick = (tourId) => {
		setActiveTourId(tourId);
		setActiveTourDropdown(null);
	};

	const handleToggleShare = async () => {
		if (!activeTour) return;

		const currentPublicStatus = activeTour.shareLink?.isPublic ?? isTourPublic;
		const newIsPublic = !currentPublicStatus;
		setIsTourPublic(newIsPublic);

		try {
			const updatedLink = await apiClient.post<typeof activeTour.shareLink>(
				'/tours/share',
				{
					isPublic: newIsPublic,
					tourId: activeTour.id,
				}
			);

			setTours((prevTours) =>
				prevTours.map((tour) =>
					tour.id === activeTour.id ? { ...tour, shareLink: updatedLink } : tour
				)
			);
		} catch (err: any) {
			console.error('Error toggling share link:', err);
			setIsTourPublic(currentPublicStatus);
		}
	};

	const handleDeleteTour = async (id: string) => {
		try {
			const data = await apiClient.del<{ message: string }>(`/tours/${id}`);
			toast({
				title: 'Tour deleted!',
				description: data.message,
				variant: 'destructive',
			});
			fetchTours();
		} catch (err: any) {
			console.error('Error deleting tour:', err);
			toast({
				title: 'Error deleting tour!',
				description:
					err?.data?.message || err.message || 'Something went wrong',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteDayEntry = async (tourId: string, entryId: string) => {
		try {
			const data = await apiClient.del<{ message: string }>(
				`/entries/${tourId}/${entryId}`
			);
			toast({
				title: 'Day entry deleted!',
				description: data.message,
				variant: 'destructive',
			});
			fetchTours();
		} catch (err: any) {
			console.error('Error deleting day entry:', err);
			toast({
				title: 'Error deleting day entry!',
				description:
					err?.data?.message || err.message || 'Something went wrong',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
			<Navbar />

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
				{activeTour && (
					<TourHeader
						tourData={activeTour}
						totalShoppingCost={totalShoppingCost}
						shareLink={activeTour.shareLink}
						onToggleShare={handleToggleShare}
					/>
				)}

				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
					{/* Tour list */}
					<div className="md:col-span-1 bg-card border border-border rounded-xl shadow-sm p-4">
						<TourList
							tours={tours}
							activeTourId={activeTourId}
							activeTourDropdown={activeTourDropdown}
							onTourClick={handleTourClick}
							onAddTour={() => navigate('/add-tour')}
							onEditTour={(tour) =>
								navigate('/add-tour', {
									state: { isEditing: true, tour },
								})
							}
							onDeleteTour={(id) => handleDeleteTour(id)}
							onToggleDropdown={setActiveTourDropdown}
						/>
					</div>

					{/* Tour days */}
					<div className="md:col-span-2 bg-card border border-border rounded-xl shadow-sm p-4">
						<TourDaysList
							tourDays={activeTour?.entries || []}
							activeTourId={activeTourId}
							activeDayDropdown={activeDayDropdown}
							currentUserId={userId}
							onAddTourDay={(tourId) =>
								navigate('/add-tour-day', {
									state: { tourId },
								})
							}
							onEditDay={(day) =>
								navigate('/add-tour-day', {
									state: { day, isEditing: true },
								})
							}
							onDeleteDay={(tourId, entryId) =>
								handleDeleteDayEntry(tourId, entryId)
							}
							onToggleDropdown={(id) =>
								setActiveDayDropdown((prev) => (prev === id ? null : id))
							}
							myTotalTourCost={myTotalTourCost}
						/>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
