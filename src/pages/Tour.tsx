import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourHeader from '@/components/tour/TourHeader';
import TourList from '@/components/tour/TourList';
import TourDaysList from '@/components/tour/TourDaysList';
import { Tour } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/Config';
import { useToast } from '@/hooks/use-toast';
import { UUID } from 'crypto';

export default function TourPlanner() {
	const [activeTourDropdown, setActiveTourDropdown] = useState<UUID>(null);
	const [activeDayDropdown, setActiveDayDropdown] = useState<UUID>(null);
	const [isTourPublic, setIsTourPublic] = useState<Boolean>(false);
	const [tours, setTours] = useState<Tour[]>([]);
	const [activeTourId, setActiveTourId] = useState<UUID>(null);
	const navigate = useNavigate();
	const { token, userId } = useAuth();
	const { toast } = useToast();

	const fetchTours = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/tours`);
			if (!response.ok) throw new Error('Failed to fetch tours');
			const data = await response.json();
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

	// Handle click outside to close dropdowns
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
				// Find the dropdown menu element
				const dropdownElement = document.getElementById(
					`day-dropdown-${activeDayDropdown}`
				);
				// If we clicked outside the dropdown, close it
				if (
					dropdownElement &&
					!dropdownElement.contains(event.target) &&
					!event.target.closest(`#day-button-${activeDayDropdown}`)
				) {
					setActiveDayDropdown(null);
				}
			}
		}

		// Add event listener
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			// Clean up event listener
			document.removeEventListener('mousedown', handleClickOutside);
		};
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
			const response = await fetch(`${API_BASE_URL}/tours/share`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					isPublic: newIsPublic,
					tourId: activeTour.id,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error response:', errorData);
				setIsTourPublic(currentPublicStatus);
				return;
			}

			const updatedLink = await response.json();

			// ✅ Manually update tour's shareLink in your tours state
			setTours((prevTours) =>
				prevTours.map((tour) =>
					tour.id === activeTour.id ? { ...tour, shareLink: updatedLink } : tour
				)
			);
		} catch (err) {
			console.error('Error toggling share link:', err);
			setIsTourPublic(currentPublicStatus);
		}
	};

	const handleDeleteTour = async (id) => {
		const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const { message } = await response.json();
		if (response.ok) {
			fetchTours();
			toast({
				title: 'Tour deleted!',
				description: message,
				variant: 'destructive',
			});
		} else {
			toast({
				title: 'Error deleting tour!',
				description: message,
				variant: 'destructive',
			});
		}
	};

	const handleDeleteDayEntry = async (tourId, entryId) => {
		const response = await fetch(
			`${API_BASE_URL}/entries/${tourId}/${entryId}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}
		);
		const { message } = await response.json();
		if (response.ok) {
			fetchTours();
			toast({
				title: 'Day entry deleted!',
				description: message,
				variant: 'destructive',
			});
		} else {
			toast({
				title: 'Error deleting tour!',
				description: message,
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-grow max-w-full w-full mx-auto px-4 sm:px-6 py-6 texture-dots bg-gray-300">
				{activeTour && (
					<TourHeader
						name={activeTour.name}
						startDate={activeTour.startDate}
						endDate={activeTour.endDate}
						location={activeTour.location}
						totalCost={activeTour.totalCost}
						totalShoppingCost={totalShoppingCost}
						shareLink={activeTour.shareLink}
						onToggleShare={handleToggleShare}
					/>
				)}

				{/* Main content area */}
				<div className="max-w-6xl mx-auto mt-4 px-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
						{/* Tour list column */}
						<div className="md:col-span-1">
							<TourList
								tours={tours}
								activeTourId={activeTourId}
								activeTourDropdown={activeTourDropdown}
								onTourClick={handleTourClick}
								onAddTour={() => navigate('/add-tour')}
								onEditTour={(tour) =>
									navigate('/add-tour', {
										state: {
											isEditing: true,
											tour,
										},
									})
								}
								onDeleteTour={(id) => handleDeleteTour(id)}
								onToggleDropdown={setActiveTourDropdown}
							/>
						</div>

						{/* Tour days column - spans 2 columns */}
						<div className="md:col-span-2">
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
				</div>
			</main>
			<Footer />
		</div>
	);
}
