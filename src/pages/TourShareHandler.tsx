import { useParams, Navigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/Config';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency, ShareLink } from '@/utils/utils';
import {
	Calendar,
	CreditCard,
	ShoppingBag,
	BadgeDollarSign,
	Info,
	MapPin,
} from 'lucide-react';
import { getTypeColorClass, getTypeIcon, typeIcons } from '@/utils/TourUtils';
import Footer from '@/components/Footer';

// API function to validate the hex ID
const validateHexId = async (hexId) => {
	const response = await fetch(`${API_BASE_URL}/tours/share/${hexId}`);
	if (!response.ok) {
		throw new Error('Tour not found or expired');
	}
	return response.json();
};

const TourShareHandler = () => {
	const { hexId } = useParams();
	const [isValidating, setIsValidating] = useState(true);
	const isValidHexFormat = /^[a-fA-F0-9]{6}$/.test(hexId);

	const { data, error, isLoading } = useQuery({
		queryKey: ['validateTour', hexId],
		queryFn: () => validateHexId(hexId),
		enabled: isValidHexFormat,
		retry: false,
	});

	useEffect(() => {
		setIsValidating(isLoading);
	}, [isLoading]);

	const tourData = useMemo(() => {
		return data?.data;
	}, [data]);

	const shoppingCost = useMemo(() => {
		if (!tourData?.entries?.length) return 0;

		return tourData.entries
			.filter(
				(entry) => entry.type === 'shopping' && !isNaN(Number(entry.amount))
			)
			.reduce((sum, entry) => sum + Number(entry.amount), 0);
	}, [tourData]);

	const sortedTourDays = useMemo(() => {
		if (!tourData?.entries?.length) return [];

		const withoutShoppingData = tourData.entries.filter(
			(entry) => entry.type !== 'shopping'
		);
		if (!withoutShoppingData.length) return [];

		return [...withoutShoppingData].sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();

			if (dateA !== dateB) return dateB - dateA;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [tourData]);

	const totalAmountByType = useMemo(() => {
		if (!tourData?.entries?.length) return {};

		return tourData.entries.reduce((acc, entry) => {
			if (entry.type === 'shopping') return acc;
			if (isNaN(Number(entry.amount))) return acc;

			const type = entry.type;
			if (!acc[type]) acc[type] = 0;

			acc[type] += Number(entry.amount);
			return acc;
		}, {} as Record<string, number>);
	}, [tourData]);

	if (!isValidHexFormat) {
		return <Navigate to="/404" replace />;
	}

	if (error) {
		return <Navigate to="/404" replace />;
	}

	if (isValidating) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-lg">Validating tour...</p>
				</div>
			</div>
		);
	}

	const numDays =
		differenceInDays(new Date(tourData.endDate), new Date(tourData.startDate)) +
		1;

	return (
		<div className="relative h-screen">
			<div className="absolute inset-0">
				<div className="absolute top-0 -z-10 h-full w-full bg-white [&>div]:absolute [&>div]:bottom-auto [&>div]:left-auto [&>div]:right-0 [&>div]:top-0 [&>div]:h-[500px] [&>div]:w-[500px] [&>div]:-translate-x-[30%] [&>div]:translate-y-[20%] [&>div]:rounded-full [&>div]:bg-[rgba(109,244,173,0.5)] [&>div]:opacity-50 [&>div]:blur-[80px]">
					<div></div>
				</div>
			</div>
			<div className="relative z-10 flex h-full min-h-screen flex flex-col">
				<main className="flex-grow max-w-full w-full mx-auto px-4 sm:px-6 py-6">
					<h1 className="text-4xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-slate-900 text-center mb-2 mt-10">
						{tourData.name}
					</h1>

					<div className="flex items-center justify-center text-gray-600 mb-2">
						<Calendar className="w-3 h-3 mr-1" />
						<span className="text-xs">
							{format(new Date(tourData.startDate), 'PPP')} –{' '}
							{format(new Date(tourData.endDate), 'PPP')} • {tourData.location}
						</span>
					</div>

					<div className="flex justify-center">
						<div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:gap-x-5 gap-3">
							<div className="flex items-center">
								<Calendar className="w-4 h-4 text-green-500 mr-1" />
								<span className="text-sm font-medium">{numDays} days</span>
							</div>

							{Object.entries(totalAmountByType)
								.filter(([_, amount]) => (amount as number) > 0)
								.map(([type, amount]) => (
									<div key={type} className="flex items-center">
										{typeIcons[type] ?? (
											<CreditCard className="w-4 h-4 text-gray-600 mr-1" />
										)}
										<span className="text-sm font-medium">
											{formatCurrency(amount as number)}
										</span>
									</div>
								))}

							<div className="flex items-center">
								<BadgeDollarSign className="w-4 h-4 text-red-500 mr-1" />
								<span className="text-sm font-medium">
									{formatCurrency(tourData.totalCost - shoppingCost)}
								</span>
							</div>
						</div>
					</div>

					<div className="max-w-3xl mx-auto mt-10 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
						<div className="bg-gray-50 px-6 py-3 border-b border-gray-200 bg-yellow-100">
							<p className="text-sm text-gray-800 flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-4 h-4 mr-2 text-yellow-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
									/>
								</svg>
								You're viewing the limited data. Some information may be limited
								or hidden.
							</p>
						</div>

						{/* Body content */}
						<div className="px-6 py-6">
							{sortedTourDays.map((day) => (
								<div
									key={day.id}
									className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 relative mb-2 shadow-sm"
								>
									<div className="flex justify-between">
										<div className="flex">
											<div
												className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
												style={{
													backgroundColor:
														day.type === 'food'
															? '#FEF3C7' // amber-100
															: day.type === 'expense'
															? '#FEE2E2' // red-100
															: day.type === 'experience'
															? '#DBEAFE' // blue-100
															: day.type === 'hotel'
															? '#E0E7FF' // indigo-100
															: day.type === 'shopping'
															? '#FCE7F3' // pink-100
															: day.type === 'transport'
															? '#D1FAE5' // emerald-100
															: '#F3F4F6', // gray-100 (default)
												}}
											>
												{getTypeIcon(day.type)}
											</div>
											<div>
												<div className="flex justify-between items-center">
													<span className="font-medium text-gray-800 pr-24">
														{day.description}
													</span>
													{day.amount !== null && day.type !== 'experience' && (
														<span className="absolute right-0 top-0 text-sm font-medium text-red-600 bg-red-200 px-2 py-1 rounded-md">
															{formatCurrency(day.amount)}
														</span>
													)}
												</div>
												<div className="flex flex-wrap gap-2 mt-2">
													<span
														className={`text-xs px-2 py-1 rounded-full ${getTypeColorClass(
															day.type
														)}`}
													>
														{day.type.charAt(0).toUpperCase() +
															day.type.slice(1)}
													</span>
													<span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center">
														<Calendar size={12} className="mr-1" />
														{new Date(day.date).toLocaleDateString('en-US', {
															month: 'short',
															day: 'numeric',
														})}
													</span>
													{day.location && (
														<span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center">
															<MapPin size={12} className="mr-1" />
															{day.location}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</main>
				<Footer />
			</div>
		</div>
	);
};

export default TourShareHandler;
