import {
	Bed,
	Car,
	CreditCard,
	ShoppingBag,
	Compass,
	DollarSign,
	Utensils,
} from 'lucide-react';

export const getTypeIcon = (type: string) => {
	switch (type) {
		case 'food':
			return <Utensils size={16} className="text-amber-600" />;
		case 'expense':
			return <CreditCard size={16} className="text-red-500" />;
		case 'experience':
			return <Compass size={16} className="text-blue-500" />;
		case 'hotel':
			return <Bed size={16} className="text-indigo-500" />;
		case 'shopping':
			return <ShoppingBag size={16} className="text-pink-600" />;
		case 'transport':
			return <Car size={16} className="text-emerald-600" />;
		default:
			return <DollarSign size={16} className="text-gray-500" />;
	}
};

// Get type color class
export const getTypeColorClass = (type: string) => {
	switch (type) {
		case 'food':
			return 'bg-amber-100 text-amber-700';
		case 'expense':
			return 'bg-red-100 text-red-700';
		case 'experience':
			return 'bg-blue-100 text-blue-700';
		case 'hotel':
			return 'bg-indigo-100 text-indigo-700';
		case 'shopping':
			return 'bg-pink-100 text-pink-700';
		case 'transport':
			return 'bg-emerald-100 text-emerald-700';
		default:
			return 'bg-gray-100 text-gray-700';
	}
};

export const typeIcons = {
	expense: <CreditCard className="w-4 h-4 text-orange-700 mr-1" />,
	shopping: <ShoppingBag className="w-4 h-4 text-pink-600 mr-1" />,
	experience: <Compass className="w-4 h-4 text-blue-600 mr-1" />,
	hotel: <Bed className="w-4 h-4 text-indigo-600 mr-1" />,
	food: <Utensils className="w-4 h-4 text-amber-600 mr-1" />,
	transport: <Car className="w-4 h-4 text-emerald-600 mr-1" />,
};