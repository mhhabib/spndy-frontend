import { CreditCard, ShoppingBag, Compass, DollarSign } from 'lucide-react';

export const getTypeIcon = (type) => {
	switch (type) {
		case 'expense':
			return <CreditCard size={16} className="text-red-500" />;
		case 'shopping':
			return <ShoppingBag size={16} className="text-purple-500" />;
		case 'experience':
			return <Compass size={16} className="text-blue-500" />;
		default:
			return <DollarSign size={16} className="text-gray-500" />;
	}
};

// Get type color class
export const getTypeColorClass = (type) => {
	switch (type) {
		case 'expense':
			return 'bg-red-100 text-red-700';
		case 'shopping':
			return 'bg-purple-100 text-purple-700';
		case 'experience':
			return 'bg-blue-100 text-blue-700';
		default:
			return 'bg-gray-100 text-gray-700';
	}
};
