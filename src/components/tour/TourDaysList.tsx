import React, { useState } from 'react';
import {
	Calendar,
	Edit,
	MapPin,
	MoreVertical,
	PlusCircle,
	Trash2,
} from 'lucide-react';
import { getTypeColorClass, getTypeIcon } from '@/utils/TourUtils';
import { formatCurrency, TourDay } from '@/utils/utils';
import { UUID } from 'crypto';

interface TourDaysListProps {
	activeTourId: UUID | null;
	tourDays: TourDay[];
	activeDayDropdown: UUID | null;
	onAddTourDay: (id: UUID) => void;
	onEditDay: (day: TourDay) => void;
	onDeleteDay: (tourId: UUID, entryId: UUID) => void;
	onToggleDropdown: (id: UUID) => void;
	currentUserId: string;
	myTotalTourCost: number;
}

const TourDaysList: React.FC<TourDaysListProps> = ({
	activeTourId,
	tourDays = [],
	activeDayDropdown,
	onAddTourDay,
	onEditDay,
	onDeleteDay,
	onToggleDropdown,
	currentUserId,
	myTotalTourCost,
}) => {
	const [tab, setTab] = useState<'all' | 'my'>('all');

	const filteredTourDays = Array.isArray(tourDays)
		? tourDays.filter((day) => tab === 'all' || day.userId === currentUserId)
		: [];

	const sortedTourDays = [...filteredTourDays].sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		if (dateA !== dateB) return dateB - dateA;
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	return (
		<div className="md:col-span-2 bg-background text-foreground rounded-xl shadow-sm p-4 transition-colors">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-bold">Tour Activities</h2>
				<div className="inline-flex rounded-md shadow-sm" role="group">
					<button
						onClick={() => setTab('all')}
						className={`px-3 py-1.5 text-sm font-medium border border-border rounded-l-md focus:z-10 focus:ring-2 focus:ring-ring focus:border-ring transition-colors ${
							tab === 'all'
								? 'bg-primary text-primary-foreground'
								: 'bg-background hover:bg-accent hover:text-accent-foreground'
						}`}
					>
						All
					</button>
					<button
						onClick={() => setTab('my')}
						className={`px-3 py-1.5 text-sm font-medium border border-border -ml-px focus:z-10 focus:ring-2 focus:ring-ring focus:border-ring transition-colors ${
							tab === 'my'
								? 'bg-primary text-primary-foreground'
								: 'bg-background hover:bg-accent hover:text-accent-foreground'
						}`}
					>
						My Entry
					</button>
					<button
						onClick={() => onAddTourDay(activeTourId)}
						className="text-foreground hover:text-primary hover:bg-accent text-sm px-3 py-1.5 border border-border rounded-r-md -ml-px flex items-center focus:z-10 focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
					>
						<PlusCircle size={14} className="mr-1.5" />
						<span>Add Entry</span>
					</button>
				</div>
			</div>

			{/* Tour Day Cards */}
			<div className="space-y-4">
				{sortedTourDays.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 px-4 bg-accent/20 border border-border rounded-lg text-center transition-colors">
						<Calendar size={36} className="text-muted-foreground mb-3" />
						<h3 className="text-lg font-semibold">No days added yet</h3>
						<p className="text-sm text-muted-foreground mt-1">
							You haven’t added any activities or events for this tour.
						</p>
						<button
							onClick={() => onAddTourDay(activeTourId)}
							className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
						>
							<PlusCircle size={16} className="mr-2" />
							Add Tour Day
						</button>
					</div>
				) : (
					<>
						{tab === 'my' && (
							<div className="flex items-center gap-2">
								<div className="flex-grow border-t border-dashed border-border"></div>
								<p className="text-xs text-muted-foreground italic whitespace-nowrap">
									My total tour cost: {formatCurrency(myTotalTourCost)}
								</p>
							</div>
						)}

						{sortedTourDays.map((day) => (
							<div
								key={day.id}
								className="p-4 rounded-lg bg-muted/40 hover:bg-accent/30 transition-colors relative"
							>
								<div className="flex justify-between">
									<div className="flex">
										<div
											className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
											style={{
												backgroundColor:
													day.type === 'food'
														? '#FEF3C7'
														: day.type === 'expense'
														? '#FEE2E2'
														: day.type === 'experience'
														? '#DBEAFE'
														: day.type === 'hotel'
														? '#E0E7FF'
														: day.type === 'shopping'
														? '#FCE7F3'
														: day.type === 'transport'
														? '#D1FAE5'
														: '#F3F4F6',
											}}
										>
											{getTypeIcon(day.type)}
										</div>
										<div>
											<h3 className="font-medium">{day.description}</h3>
											<div className="flex flex-wrap gap-2 mt-2">
												<span
													className={`text-xs px-2 py-1 rounded-full ${getTypeColorClass(
														day.type
													)}`}
												>
													{day.type.charAt(0).toUpperCase() + day.type.slice(1)}
												</span>
												<span className="text-xs px-2 py-1 rounded-full bg-accent/30 text-muted-foreground flex items-center">
													<Calendar size={12} className="mr-1" />
													{new Date(day.date).toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric',
													})}
												</span>
												{day.location && (
													<span className="text-xs px-2 py-1 rounded-full bg-accent/30 text-muted-foreground flex items-center">
														<MapPin size={12} className="mr-1" />
														{day.location}
													</span>
												)}
												{day.amount !== null && day.type !== 'experience' && (
													<span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive flex items-center">
														{formatCurrency(day.amount)}
													</span>
												)}
											</div>
										</div>
									</div>

									{tab !== 'all' && (
										<div className="relative">
											<button
												id={`day-button-${day.id}`}
												onClick={(e) => {
													e.stopPropagation();
													onToggleDropdown(
														activeDayDropdown === day.id ? null : day.id
													);
												}}
												className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent/40 transition-colors"
											>
												<MoreVertical size={18} />
											</button>

											{activeDayDropdown === day.id && (
												<div
													id={`day-dropdown-${day.id}`}
													className="absolute right-0 mt-1 bg-popover text-popover-foreground shadow-lg rounded-md z-10 w-36 py-1 border border-border"
												>
													<button
														onClick={(e) => {
															e.stopPropagation();
															onEditDay(day);
															onToggleDropdown(null);
														}}
														className="w-full text-left px-4 py-2 text-sm hover:bg-accent/30 flex items-center transition-colors"
													>
														<Edit size={14} className="mr-2" />
														Update Entry
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															onDeleteDay(activeTourId, day.id);
															onToggleDropdown(null);
														}}
														className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent/30 flex items-center transition-colors"
													>
														<Trash2 size={14} className="mr-2" />
														Delete Entry
													</button>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						))}
					</>
				)}
			</div>
		</div>
	);
};

export default TourDaysList;
