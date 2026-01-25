import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MainLayout = () => {
	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
			{/* Gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

			{/* Grid pattern overlay */}
			<div
				className="absolute inset-0 opacity-[0.02]"
				style={{
					backgroundImage: `
						linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
						linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
					`,
					backgroundSize: '60px 60px',
				}}
			/>

			{/* Floating decorative elements */}
			<div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
			<div
				className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float"
				style={{ animationDelay: '-3s' }}
			/>

			{/* Accent lines */}
			<div className="absolute top-0 left-1/2 w-px h-40 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
			<div className="absolute bottom-0 left-1/2 w-px h-40 bg-gradient-to-t from-transparent via-primary/20 to-transparent" />

			{/* App content */}
			<div className="relative z-10 flex flex-col min-h-screen w-full">
				<Navbar />

				<main className="flex-1">
					<Outlet />
				</main>

				<Footer />
			</div>
		</div>
	);
};

export default MainLayout;
