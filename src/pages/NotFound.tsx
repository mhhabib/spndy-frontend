import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DollarSign, AlertCircle } from 'lucide-react';

const NotFound = () => {
	const [count, setCount] = useState(30);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (count > 0) {
			const timer = setTimeout(() => setCount(count - 1), 1000);
			return () => clearTimeout(timer);
		}
		navigate('/');
	}, [count]);

  const currentYear = new Date().getFullYear();

	return (
		<div className="min-h-screen bg-gradient-to-br from-white-100 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-lg w-full">

				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{Array.from({ length: 50 }).map((_, i) => (
						<div
							key={i}
							className="absolute text-yellow-500 opacity-20"
							style={{
								left: `${Math.random() * 100}%`,
								top: `-50px`,
								animation: `fall ${5 + Math.random() * 10}s linear ${
									Math.random() * 5
								}s infinite`,
							}}
						>
							<DollarSign size={Math.random() * 20 + 10} />
						</div>
					))}
				</div>

				<div className="bg-white rounded-xl shadow-xl overflow-hidden relative">
					

					{/* Main content */}
					<div className="p-6 md:p-10 text-center">
						<div className="flex justify-center mb-6">
							<div className="relative">
								<div className="text-9xl font-bold text-indigo-600 opacity-10">
									404
								</div>
								<div className="absolute inset-0 flex items-center justify-center">
									<AlertCircle className="text-indigo-600 h-12 w-12" />
								</div>
							</div>
						</div>

						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Page Not Found
						</h1>

						<p className="text-gray-600 mb-8">
							Oops! It seems like this page has vanished like an untracked
							expense. The URL you're looking for doesn't exist on our expense
							tracking app.
						</p>

						{/* Broken URL illustration */}
						<div className="mb-8 bg-gray-50 rounded-lg p-4 mx-auto max-w-sm flex items-center justify-center">
							<span className="text-gray-400 text-sm font-mono">/</span>
							<span className="text-indigo-600 text-sm font-mono">
								spndy.xyz
							</span>
							<span className="line-through text-red-500 text-sm font-mono">
								{location.pathname}
							</span>
							<span className="ml-1 bg-red-50 text-red-500 text-xs px-1 py-0.5 rounded">
								❌
							</span>
						</div>

						<div className="text-sm text-gray-500">
							Redirecting to dashboard in {count} seconds...
						</div>
					</div>

					{/* Footer with helpful links */}
					<div className="bg-gray-50 px-6 py-4">
						<div className="text-center text-sm text-gray-600 mb-2">
							Looking for something specific?
						</div>
						<div className="flex flex-wrap justify-center gap-3">
							<a
								href="/"
								className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
							>
								Dashboard
							</a>
							<a
								href="/my-expenses"
								className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
							>
								My Expenses
							</a>
							<a
								href="/settings"
								className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
							>
								Settings
							</a>
						</div>
					</div>

					<div className="bg-gray-700 px-6 py-3 text-xs text-gray-100 flex justify-center items-center">
						<div>©{currentYear} Spndy</div>
					</div>
				</div>
			</div>

			<style>{`
      @keyframes fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 0.8;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0.2;
        }
      }
    `}</style>
		</div>
	);
};

export default NotFound;
