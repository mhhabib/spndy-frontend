import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: 'default' | 'destructive' | 'outline';
	onConfirm: () => void;
	onCancel?: () => void;
	trigger?: ReactNode; // optional, e.g. a button or icon
}

const ConfirmDialog = ({
	open,
	onOpenChange,
	title = 'Confirm Action',
	description = 'Are you sure you want to perform this action?',
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	confirmVariant = 'destructive',
	onConfirm,
	onCancel,
	trigger,
}: ConfirmDialogProps) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => {
							onCancel?.();
							onOpenChange(false);
						}}
					>
						{cancelText}
					</Button>
					<Button
						variant={confirmVariant}
						onClick={() => {
							onConfirm();
							onOpenChange(false);
						}}
					>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDialog;
