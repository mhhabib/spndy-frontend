import React, { useEffect, useMemo } from 'react';
import {
	Calendar,
	Compass,
	Edit,
	MapPin,
	MoreVertical,
	PlusCircle,
	Trash2,
} from 'lucide-react';
import { Tour } from '@/utils/utils';
import { UUID } from 'crypto';

interface TourListProps {
	tours: Tour[];
	activeTourId: UUID;
	activeTourDropdown: UUID | null;
	onTourClick: (id: UUID) => void;
	onAddTour: () => void;
	onEditTour: (tour: Tour) => void;
	onDeleteTour: (id: UUID) => void;
	onToggleDropdown: (id: UUID) => void;
}

const formatDateRange = (start: Date | string, end: Date | string) => {
	const startDate = new Date(start);
	const endDate = new Date(end);
	return `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`;
};

const TourList: React.FC<TourListProps> = ({
	tours,
	activeTourId,
	activeTourDropdown,
	onTourClick,
	onAddTour,
	onEditTour,
	onDeleteTour,
	onToggleDropdown,
}) => {
	const shouldAddNewTourButtonShown = useMemo(() => {
		const stored = localStorage.getItem('addnewtour');
		return stored === 'true';
	}, []);
	return (
		<div className="bg-white rounded-xl shadow-sm p-4">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold text-gray-700">My tours</h2>
				{shouldAddNewTourButtonShown && (
					<button
						className="text-gray-700 hover:text-green-600 text-sm px-3 py-1.5 rounded-md flex items-center"
						onClick={onAddTour}
					>
						<PlusCircle size={14} className="mr-1.5" />
						<span>Add Tour</span>
					</button>
				)}
			</div>

			{/* Tour Items */}
			<div className="space-y-3">
				{tours.map((tour) => {
					const isActive = activeTourId === tour.id;

					return (
						<div
							key={tour.id}
							onClick={() => onTourClick(tour.id)}
							className={`p-3 rounded-lg cursor-pointer relative transition-colors duration-200 ${
								isActive
									? 'bg-emerald-50 border-l-4 border-emerald-500'
									: 'bg-gray-50 hover:bg-gray-100'
							}`}
						>
							<div className="flex items-center justify-between">
								{/* Tour Info */}
								<div className="flex items-center">
									<Compass
										className={`${
											isActive ? 'text-emerald-500' : 'text-gray-400'
										} mr-3`}
										size={22}
									/>
									<div>
										<h3 className="font-medium text-gray-800">{tour.name}</h3>
										<div className="text-sm text-gray-500 flex items-center mt-1">
											<Calendar size={14} className="mr-1" />
											<span>
												{formatDateRange(tour.startDate, tour.endDate)}
											</span>
										</div>
										<div className="text-sm text-gray-500 flex items-center mt-1">
											<MapPin size={14} className="mr-1" />
											<span>{tour.location}</span>
										</div>
									</div>
								</div>

								{/* Dropdown Menu */}
								{shouldAddNewTourButtonShown && (
									<div className="relative">
										<button
											id={`tour-button-${tour.id}`}
											onClick={(e) => {
												e.stopPropagation();
												onToggleDropdown(
													activeTourDropdown === tour.id ? null : tour.id
												);
											}}
											className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
										>
											<MoreVertical size={18} />
										</button>

										{activeTourDropdown === tour.id && (
											<div
												id={`tour-dropdown-${tour.id}`}
												className="absolute right-0 mt-1 bg-white shadow-lg rounded-md z-10 w-36 py-1 border border-gray-200"
											>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onEditTour(tour);
														onToggleDropdown(null);
													}}
													className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
												>
													<Edit size={14} className="mr-2" />
													Update Tour
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onDeleteTour(tour.id);
														onToggleDropdown(null);
													}}
													className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
												>
													<Trash2 size={14} className="mr-2" />
													Delete Tour
												</button>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TourList;
