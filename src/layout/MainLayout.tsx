import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import bgimage from '@/avatar/StockChart.svg';

const MainLayout = () => {
	return (
		<div
			className="min-h-screen flex flex-col relative bg-no-repeat bg-slate-50 dark:bg-slate-900 bg-center"
			style={{
				backgroundImage: `url(${bgimage})`,
				backgroundPosition: 'center bottom',
				backgroundSize: '100% 450px',
			}}
		>
			{/* Subtle overlay for better content readability */}
			<div className="absolute inset-0 bg-white/60 dark:bg-black/40 pointer-events-none"></div>

			<div className="relative z-10 flex flex-col min-h-screen">
				<Navbar />

				<main>
					<Outlet />
				</main>

				<Footer />
			</div>
		</div>
	);
};

export default MainLayout;
