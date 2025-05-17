import React from 'react';
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
}

const TourDaysList: React.FC<TourDaysListProps> = ({
	activeTourId,
	tourDays = [],
	activeDayDropdown,
	onAddTourDay,
	onEditDay,
	onDeleteDay,
	onToggleDropdown,
}) => {
	const sortedTourDays = Array.isArray(tourDays)
		? [...tourDays].sort((a, b) => {
				const dateA = new Date(a.date).getTime();
				const dateB = new Date(b.date).getTime();

				if (dateA !== dateB) return dateB - dateA;

				const createdA = new Date(a.createdAt).getTime();
				const createdB = new Date(b.createdAt).getTime();

				return createdB - createdA;
		  })
		: [];

	return (
		<div className="md:col-span-2 bg-white rounded-xl shadow-sm p-4">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-bold text-gray-700">Tour Days</h2>
				<button
					className="text-gray-700 hover:text-green-600 text-sm px-3 py-1.5 rounded-md flex items-center"
					onClick={() => onAddTourDay(activeTourId)}
				>
					<PlusCircle size={14} className="mr-1.5" />
					<span>Add tour days</span>
				</button>
			</div>

			{/* Tour Day Items */}
			<div className="space-y-4">
				{sortedTourDays?.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 px-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
						<Calendar size={36} className="text-blue-400 mb-3" />
						<h3 className="text-lg font-semibold text-blue-700">
							No days added yet
						</h3>
						<p className="text-sm text-blue-600 mt-1">
							You haven’t added any activities or events for this tour.
						</p>
						<button
							onClick={() => onAddTourDay(activeTourId)}
							className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
						>
							<PlusCircle size={16} className="mr-2" />
							Add Tour Day
						</button>
					</div>
				) : (
					sortedTourDays?.map((day) => (
						<div
							key={day.id}
							className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 relative"
						>
							<div className="flex justify-between">
								<div className="flex">
									<div
										className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
										style={{
											backgroundColor:
												day.type === 'expense'
													? '#FEE2E2'
													: day.type === 'shopping'
													? '#EDE9FE'
													: '#DBEAFE',
										}}
									>
										{getTypeIcon(day.type)}
									</div>
									<div>
										<h3 className="font-medium text-gray-800">
											{day.description}
										</h3>
										<div className="flex flex-wrap gap-2 mt-2">
											<span
												className={`text-xs px-2 py-1 rounded-full ${getTypeColorClass(
													day.type
												)}`}
											>
												{day.type.charAt(0).toUpperCase() + day.type.slice(1)}
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
											{day.amount !== null && day.type !== 'experience' && (
												<span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center">
													{formatCurrency(day.amount)}
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Dropdown */}
								<div className="relative">
									<button
										id={`day-button-${day.id}`}
										onClick={(e) => {
											e.stopPropagation();
											onToggleDropdown(
												activeDayDropdown === day.id ? null : day.id
											);
										}}
										className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
									>
										<MoreVertical size={18} />
									</button>

									{activeDayDropdown === day.id && (
										<div
											id={`day-dropdown-${day.id}`}
											className="absolute right-0 mt-1 bg-white shadow-lg rounded-md z-10 w-36 py-1 border border-gray-200"
										>
											<button
												onClick={(e) => {
													e.stopPropagation();
													onEditDay(day);
													onToggleDropdown(null);
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
											>
												<Edit size={14} className="mr-2" />
												Edit Day
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													onDeleteDay(activeTourId, day.id);
													onToggleDropdown(null);
												}}
												className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
											>
												<Trash2 size={14} className="mr-2" />
												Delete Day
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default TourDaysList;
