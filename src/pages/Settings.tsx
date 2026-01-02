import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import CategoryManagement from '@/components/CategoryManagement';
import { usePersistentToggle } from '@/utils/usePersistentToggle';
import { SettingToggle } from '@/components/SettingToggle';

const Settings = () => {
	const [showEditControls, setShowEditControls] =
		usePersistentToggle('editMode');
	const [showAnnualSummary, setShowAnnualSummary] =
		usePersistentToggle('annualSummary');
	const [showAddTourButton, setShowAddTourButton] =
		usePersistentToggle('addnewtour');

	return (
		<div className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
			<CategoryManagement />

			<Card className="card-glass w-full animate-fade-in">
				<CardHeader>
					<CardTitle>General Settings</CardTitle>
					<CardDescription>
						Configure your expense tracking preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<SettingToggle
						title="Content Management"
						description="Enable this mode to modify or delete entries within your expense records"
						checked={showEditControls}
						onChange={setShowEditControls}
					/>
					<SettingToggle
						title="Display Annual Summary"
						description="Toggle to show or hide a consolidated view of yearly expense data."
						checked={showAnnualSummary}
						onChange={setShowAnnualSummary}
					/>
					<SettingToggle
						title="Display Add New Tour Button"
						description="Toggle to show or hide the new tour creation button."
						checked={showAddTourButton}
						onChange={setShowAddTourButton}
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default Settings;
