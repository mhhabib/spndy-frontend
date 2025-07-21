import React from 'react';
import {
	BadgeDollarSign,
	Calendar,
	Copy,
	Share2,
	ShieldOff,
	ShoppingBag,
	Wallet,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/utils/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface TourHeaderProps {
	name: string;
	startDate: Date;
	endDate: Date;
	location: string;
	totalCost: number;
	totalShoppingCost: number;
	isShared: Boolean;
	onToggleShare: () => void;
}

const TourHeader: React.FC<TourHeaderProps> = ({
	name,
	startDate,
	endDate,
	location,
	totalCost,
	totalShoppingCost,
	isShared = false,
	onToggleShare = () => {},
}) => {
	const { toast } = useToast();
	const numDays = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
	const shareLink = 'https://spndy.xyz/tours/78eaub3';

	const handleCopy = () => {
		navigator.clipboard.writeText(shareLink);
		toast({
			title: 'Success',
			description: 'The link is copied to your clipboard',
		});
	};
	return (
		<div className="max-w-6xl mx-auto p-4">
			<h1 className="text-3xl font-bold text-sky-500 text-center mb-2">
				{name}
			</h1>

			<div className="flex items-center justify-center text-gray-600 mb-2">
				<Calendar className="w-3 h-3 mr-1" />
				<span className="text-xs">
					{format(new Date(startDate), 'PPP')} –{' '}
					{format(new Date(endDate), 'PPP')} • {location}
				</span>
			</div>

			<div className="flex items-center justify-center ">
				<div className="flex items-center space-x-5">
					<div className="flex items-center">
						<Calendar className="w-4 h-4 text-green-500 mr-1" />
						<span className="text-base font-medium text-sm">
							{numDays} days
						</span>
					</div>

					<div className="flex items-center">
						<Wallet className="w-4 h-4 text-orange-700 mr-1" />
						<span className="text-base font-medium text-sm">
							{formatCurrency(totalCost - totalShoppingCost)}
						</span>
					</div>
					{totalShoppingCost > 0 && (
						<div className="flex items-center">
							<ShoppingBag className="w-4 h-4 text-purple-500 mr-1" />
							<span className="text-base font-medium text-sm">
								{formatCurrency(totalShoppingCost)}
							</span>
						</div>
					)}

					<div className="flex items-center">
						<BadgeDollarSign className="w-4 h-4 text-red-500 mr-1" />
						<span className="text-base font-medium text-sm">
							{formatCurrency(totalCost)}
						</span>
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-5">
				<Button
					variant="outline"
					onClick={onToggleShare}
					className="flex items-center gap-2"
				>
					{isShared ? (
						<ShieldOff className="w-4 h-4" />
					) : (
						<Share2 className="w-4 h-4" />
					)}
					{isShared ? 'Unshare' : 'Share'}
				</Button>

				{isShared && (
					<div className="flex items-center gap-2 bg-gray-100 px-4 py-1 rounded-lg">
						<span className="text-sm font-mono text-blue-700">{shareLink}</span>
						<Button variant="ghost" size="sm" onClick={handleCopy}>
							<Copy className="w-4 h-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default TourHeader;
