import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme =
	| 'light'
	| 'dark'
	| 'system'
	| 'theme-ocean'
	| 'theme-forest'
	| 'theme-sunset'
	| 'theme-midnight';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	actualTheme: 'light' | 'dark'; // system resolved
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setTheme] = useState<Theme>(() => {
		return (localStorage.getItem('theme') as Theme) || 'light';
	});

	const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove(
			'light',
			'dark',
			'theme-ocean',
			'theme-forest',
			'theme-sunset',
			'theme-midnight'
		);

		let computedTheme: Theme;
		if (theme === 'system') {
			computedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		} else {
			computedTheme = theme;
		}

		root.classList.add(computedTheme);
		setActualTheme(computedTheme === 'dark' ? 'dark' : 'light');

		localStorage.setItem('theme', theme);
	}, [theme]);

	useEffect(() => {
		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handler = () => {
				const systemTheme = mediaQuery.matches ? 'dark' : 'light';
				setActualTheme(systemTheme);
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(systemTheme);
			};
			mediaQuery.addEventListener('change', handler);
			return () => mediaQuery.removeEventListener('change', handler);
		}
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
