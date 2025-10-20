import React, { useMemo } from 'react';
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
		<div className="bg-card border border-border rounded-xl shadow-sm p-4 transition-colors duration-300">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-lg font-semibold text-foreground">My Tours</h2>
				{shouldAddNewTourButtonShown && (
					<button
						onClick={onAddTour}
						className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						<PlusCircle size={14} />
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
							className={`p-3 rounded-lg cursor-pointer relative transition-all duration-200 border ${
								isActive
									? 'border-primary bg-primary/10'
									: 'border-transparent hover:bg-muted/60'
							}`}
						>
							<div className="flex items-center justify-between">
								{/* Tour Info */}
								<div className="flex items-center">
									<Compass
										className={`${
											isActive ? 'text-primary' : 'text-muted-foreground'
										} mr-3`}
										size={22}
									/>
									<div>
										<h3 className="font-medium text-foreground">{tour.name}</h3>
										<div className="text-sm text-muted-foreground flex items-center mt-1">
											<Calendar size={14} className="mr-1" />
											<span>
												{formatDateRange(tour.startDate, tour.endDate)}
											</span>
										</div>
										<div className="text-sm text-muted-foreground flex items-center mt-1">
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
											className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
										>
											<MoreVertical size={18} />
										</button>

										{activeTourDropdown === tour.id && (
											<div
												id={`tour-dropdown-${tour.id}`}
												className="absolute right-0 mt-1 bg-popover text-popover-foreground shadow-md rounded-md z-10 w-40 border border-border py-1"
											>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onEditTour(tour);
														onToggleDropdown(null);
													}}
													className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
												>
													<Edit size={14} />
													Update Tour
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onDeleteTour(tour.id);
														onToggleDropdown(null);
													}}
													className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
												>
													<Trash2 size={14} />
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

				{tours.length === 0 && (
					<div className="text-center text-muted-foreground py-6 text-sm">
						No tours found.{' '}
						{shouldAddNewTourButtonShown && 'Create your first one!'}
					</div>
				)}
			</div>
		</div>
	);
};

export default TourList;
