import React, { useMemo } from 'react';
import {
	BadgeDollarSign,
	Calendar,
	Copy,
	CreditCard,
	Share2,
	ShieldOff,
	ShoppingBag,
	Wallet,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency, ShareLink, Tour } from '@/utils/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { typeIcons } from '@/utils/TourUtils';

interface TourHeaderProps {
	tourData: Tour;
	totalShoppingCost: number;
	shareLink?: ShareLink;
	onToggleShare: () => void;
}

const TourHeader: React.FC<TourHeaderProps> = ({
	tourData,
	totalShoppingCost,
	shareLink,
	onToggleShare = () => {},
}) => {
	const { toast } = useToast();
	const numDays =
		differenceInDays(new Date(tourData.endDate), new Date(tourData.startDate)) +
		1;
	const safeShareLink = shareLink ?? {
		isPublic: false,
		shareLink: null,
		id: '',
		tourId: '',
	};

	const shareActualLink = `https://spndy.xyz/${safeShareLink.shareLink || ''}`;

	const handleCopy = () => {
		navigator.clipboard.writeText(shareActualLink);
		toast({
			title: 'Success',
			description: 'The link is copied to your clipboard',
		});
	};
	const totalAmountByType = useMemo(() => {
		if (!tourData?.entries?.length) return {};

		return tourData.entries.reduce((acc, entry) => {
			if (isNaN(Number(entry.amount))) return acc;

			const type = entry.type;
			if (!acc[type]) acc[type] = 0;

			acc[type] += Number(entry.amount);
			return acc;
		}, {});
	}, [tourData]);

	return (
		<div className="max-w-6xl mx-auto p-4">
			<h1 className="text-3xl font-bold text-sky-500 text-center mb-2">
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

					{totalShoppingCost > 0 && (
						<div className="flex items-center">
							<ShoppingBag className="w-4 h-4 text-purple-500 mr-1" />
							<span className="text-sm font-medium">
								{formatCurrency(totalShoppingCost)}
							</span>
						</div>
					)}

					<div className="flex items-center">
						<BadgeDollarSign className="w-4 h-4 text-red-500 mr-1" />
						<span className="text-sm font-medium">
							{formatCurrency(tourData.totalCost)}
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
					{safeShareLink.isPublic ? (
						<ShieldOff className="w-4 h-4" />
					) : (
						<Share2 className="w-4 h-4" />
					)}
					{safeShareLink.isPublic ? 'Unshare' : 'Share'}
				</Button>

				{safeShareLink.isPublic && (
					<div className="flex items-center gap-2 bg-gray-100 px-4 py-1 rounded-lg">
						<span className="text-sm font-mono text-blue-700">
							{shareActualLink}
						</span>
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
