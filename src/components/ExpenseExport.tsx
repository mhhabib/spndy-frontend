import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { formToJSON } from 'axios';

export interface CategoryData {
	name: string;
	value: number;
	color: string;
}

export interface Expense {
	id: number;
	date: string;
	description: string;
	amount: number;
	createdAt: string;
	Category?: {
		name: string;
	};
}

interface ExpenseExportProps {
	expenses: Expense[];
	categoryData: CategoryData[];
	totalExpenses: number;
	dateRange?: DateRange;
}

const ExpenseExport = ({
	expenses,
	categoryData,
	totalExpenses,
	dateRange,
}: ExpenseExportProps) => {
	const handleDownloadCSV = (type: 'category' | 'all') => {
		if (expenses.length === 0 && type === 'all') {
			alert('No expense data to download');
			return;
		}

		if (categoryData.length === 0 && type === 'category') {
			alert('No category data to download');
			return;
		}

		let csvContent = '';
		let filename = '';
		const fromDate = dateRange?.from
			? format(dateRange.from, 'yyyy-MM-dd')
			: 'N/A';
		const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : 'N/A';

		if (type === 'all') {
			const headers = ['ID', 'DATE', 'DESCRIPTION', 'CATEGORY', 'AMOUNT'];
			const footers = ['', '', '', 'Total expenses', totalExpenses];
			const rows = expenses.map((e, index) => [
				(index + 1).toString(),
				e.date,
				`"${e.description.replace(/"/g, '""')}"`,
				`"${e.Category?.name || 'Uncategorized'}"`,
				e.amount.toString(),
			]);

			csvContent = [
				headers.join(','),
				...rows.map((row) => row.join(',')),
				'', // Empty row
				footers.join(','),
			].join('\n');

			filename = `Expense report (${fromDate} - ${toDate}).csv`;
		} else {
			const headers = ['ID', 'CATEGORY', 'AMOUNT', 'PERCENTAGE'];
			const footers = ['', 'Total expenses', totalExpenses, ''];
			const rows = categoryData.map((c, index) => [
				(index + 1).toString(),
				`"${c.name}"`,
				c.value.toString(),
				`${((c.value / totalExpenses) * 100).toFixed(2)}%`,
			]);

			csvContent = [
				headers.join(','),
				...rows.map((row) => row.join(',')),
				'', // Empty row
				footers.join(','),
			].join('\n');

			filename = `Category report (${fromDate} - ${toDate}).csv`;
		}

		// Create and download the CSV file
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		document.body.appendChild(link); // Required for Firefox
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url); // Clean up
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="w-full sm:w-auto justify-start gap-2"
				>
					<Download size={16} />
					<span className="hidden sm:inline">Export</span>
					<ChevronDown size={14} className="opacity-70 ml-1" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56 bg-popover">
				<DropdownMenuItem onClick={() => handleDownloadCSV('all')}>
					All Expenses
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleDownloadCSV('category')}>
					By Category
				</DropdownMenuItem>
				<DropdownMenuSeparator />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ExpenseExport;
