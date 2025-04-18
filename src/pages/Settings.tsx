import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Footer from '@/components/Footer';
import CategoryManagement from '@/components/CategoryManagement';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

const Settings = () => {
	const navigate = useNavigate();
	const [showEditControls, setShowEditControls] = useState(() => {
		const savedEditMode = localStorage.getItem('editMode');
		return savedEditMode ? savedEditMode === 'true' : false;
	});

	useEffect(() => {
		const savedEditMode = localStorage.getItem('editMode');
		if (savedEditMode !== null) {
			setShowEditControls(savedEditMode === 'true');
		}
	}, [showEditControls]);

	const handleToggleEditControls = (value: boolean) => {
		localStorage.setItem('editMode', value.toString());
		setShowEditControls(value);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
				<CategoryManagement />

				<Card className="card-glass w-full animate-fade-in">
					<CardHeader>
						<CardTitle>General Settings</CardTitle>
						<CardDescription>
							Configure your expense tracking preferences
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="notifications">Edit Mode</Label>
								<p className="text-sm text-muted-foreground">
									Switch edit mode to manipulate your content
								</p>
							</div>
							<Switch
								checked={showEditControls}
								onCheckedChange={handleToggleEditControls}
								className="data-[state=checked]:bg-primary"
							/>
						</div>
					</CardContent>
				</Card>
			</main>

			<Footer />
		</div>
	);
};

export default Settings;
