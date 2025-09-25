import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog'; // your radix dialog wrapper
import {
	ArrowUp,
	ArrowDown,
	Calendar,
	DollarSign,
	User,
	Clipboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TransactionType = 'LEND' | 'BORROW';

export interface Transaction {
	id: string;
	from: string;
	to: string;
	type: 'LEND' | 'BORROW';
	description: string;
	amount: string;
	date: string;
	createdAt: string;
	updatedAt: string;
	User: {
		id: number;
		username: string;
	};
}

interface TransactionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (transaction: Partial<Transaction>) => Promise<void>;
	initialData?: Partial<Transaction>;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
	open,
	onOpenChange,
	onSave,
	initialData = {},
}) => {
	const [form, setForm] = useState<Partial<Transaction>>({
		from: '',
		to: '',
		type: 'LEND',
		description: '',
		amount: '',
		date: new Date().toISOString().slice(0, 10),
		...initialData,
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (initialData && Object.keys(initialData).length > 0) {
			setForm({
				id: initialData.id || '',
				from: initialData.from || '',
				to: initialData.to || '',
				type: initialData.type || 'LEND',
				description: initialData.description || '',
				amount: initialData.amount || '',
				date: initialData.date || new Date().toISOString().slice(0, 10),
			});
		}
	}, [initialData]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: name === 'amount' ? Number(value) : value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await onSave(form);
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	};

	const typeColor = form.type === 'LEND' ? 'text-green-500' : 'text-red-500';

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>
						{initialData?.id ? 'Update Transaction' : 'New Transaction'}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2"
				>
					{/* From */}
					<div className="flex items-center space-x-2 border rounded-lg p-2 hover:shadow-md transition-shadow">
						<User className="text-gray-400" />
						<input
							type="text"
							name="from"
							value={form.from}
							onChange={handleChange}
							placeholder="From"
							className="w-full bg-card border-none focus:ring-0 outline-none"
							required
						/>
					</div>

					{/* To */}
					<div className="flex items-center space-x-2 border rounded-lg p-2 hover:shadow-md transition-shadow">
						<User className="text-gray-400" />
						<input
							type="text"
							name="to"
							value={form.to}
							onChange={handleChange}
							placeholder="To"
							className="w-full bg-card border-none focus:ring-0 outline-none"
							required
						/>
					</div>

					{/* Type */}
					<div className="flex items-center space-x-2 border rounded-lg p-2 hover:shadow-md transition-shadow">
						{form.type === 'LEND' ? (
							<ArrowUp className="text-green-500" />
						) : (
							<ArrowDown className="text-red-500" />
						)}
						<select
							name="type"
							value={form.type}
							onChange={handleChange}
							className="w-full bg-card border-none focus:ring-0 outline-none"
						>
							<option value="LEND">LEND</option>
							<option value="BORROW">BORROW</option>
						</select>
					</div>

					{/* Amount */}
					<div
						className={cn(
							'flex items-center space-x-2 border rounded-lg p-2 hover:shadow-md transition-shadow',
							typeColor
						)}
					>
						<DollarSign />
						<input
							type="number"
							name="amount"
							value={form.amount}
							onChange={handleChange}
							placeholder="Amount"
							className="w-full bg-card border-none focus:ring-0 outline-none"
							min={0}
							required
						/>
					</div>

					{/* Date */}
					<div className="flex items-center space-x-2 border rounded-lg p-2 hover:shadow-md transition-shadow">
						<Calendar className="text-gray-400" />
						<input
							type="date"
							name="date"
							value={form.date}
							onChange={handleChange}
							className="w-full bg-card border-none focus:ring-0 outline-none"
							required
						/>
					</div>

					{/* Description */}
					<div className="flex items-start space-x-2 border rounded-lg p-2 hover:shadow-md transition-shadow col-span-1 md:col-span-2">
						<Clipboard className="text-gray-400 mt-1" />
						<textarea
							name="description"
							value={form.description}
							onChange={handleChange}
							placeholder="Description"
							className="w-full bg-card border-none focus:ring-0 outline-none resize-none"
							rows={3}
						/>
					</div>

					{/* Footer Buttons */}
					<DialogFooter className="col-span-1 md:col-span-2 mt-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
						>
							{loading ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
						</button>
						<DialogClose asChild>
							<button
								type="button"
								className="px-4 py-2 rounded-lg bg-muted hover:bg-secondary/60 transition-colors"
							>
								Cancel
							</button>
						</DialogClose>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default TransactionModal;
