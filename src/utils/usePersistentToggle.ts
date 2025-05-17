import { useState, useEffect } from 'react';

export function usePersistentToggle(
	key: string,
	defaultValue = false
): [boolean, (value: boolean) => void] {
	const [state, setState] = useState(() => {
		const stored = localStorage.getItem(key);
		return stored !== null ? stored === 'true' : defaultValue;
	});

	const toggle = (value: boolean) => {
		localStorage.setItem(key, value.toString());
		setState(value);
	};

	useEffect(() => {
		const stored = localStorage.getItem(key);
		if (stored !== null) setState(stored === 'true');
	}, [key]);

	return [state, toggle];
}
