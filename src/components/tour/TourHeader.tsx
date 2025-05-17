import React from 'react';
import { Calendar, DollarSign, Share2, ShieldOff } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/utils/utils';

interface TourHeaderProps {
	name: string;
	startDate: Date;
	endDate: Date;
	location: string;
	totalCost: number;
	isShared: boolean;
	onToggleShare: () => void;
}

const TourHeader: React.FC<TourHeaderProps> = ({
	name,
	startDate,
	endDate,
	location,
	totalCost,
	isShared = false,
	onToggleShare = () => {},
}) => {
	const numDays = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
	return (
		<div className="max-w-6xl mx-auto p-4">
			<h1 className="text-3xl font-bold text-sky-500 text-center mb-3">
				{name}
			</h1>

			<div className="flex items-center justify-center text-gray-600 mb-3">
				<Calendar className="w-3 h-3 mr-1" />
				<span className="text-xs">
					{format(new Date(startDate), 'PPP')} –{' '}
					{format(new Date(endDate), 'PPP')} • {location}
				</span>
			</div>

			<div className="flex items-center justify-center ">
				<div className="flex items-center space-x-5">
					<div className="flex items-center">
						<Calendar className="w-4 h-4 text-sky-500 mr-2" />
						<span className="text-base font-medium text-sm">
							{numDays} days
						</span>
					</div>

					<div className="flex items-center">
						<span className="text-base font-medium text-sm">
							{formatCurrency(totalCost)}
						</span>
					</div>

					<button
						className={`ml-8 px-4 py-2 rounded-lg flex items-center ${
							isShared ? 'text-red-600' : 'text-teal-600'
						}`}
						onClick={onToggleShare}
					>
						{isShared ? (
							<>
								<ShieldOff className="w-4 h-4" />
								<span className="text-base font-medium text-sm">Unshare</span>
							</>
						) : (
							<>
								<Share2 className="w-4 h-4 mr-1" />
								<span className="text-base font-medium text-sm">Share</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default TourHeader;
