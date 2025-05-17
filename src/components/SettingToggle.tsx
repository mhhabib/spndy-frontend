import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SettingToggleProps {
	title: string;
	description: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
	title,
	description,
	checked,
	onChange,
}) => (
	<div className="flex items-center justify-between">
		<div className="space-y-0.5">
			<Label>{title}</Label>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
		<Switch
			checked={checked}
			onCheckedChange={onChange}
			className="data-[state=checked]:bg-primary"
		/>
	</div>
);
