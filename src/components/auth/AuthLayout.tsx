interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
	return (
		<div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
			{/* Gradient Background */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"
				style={{
					backgroundImage: 'var(--gradient-background)',
				}}
			/>

			{/* Animated Circles */}
			<div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
			<div
				className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"
				style={{ animationDelay: '1s' }}
			/>

			{/* Content */}
			<div className="relative z-10 w-full max-w-md animate-slide-up">
				<div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
							{title}
						</h1>
						{subtitle && (
							<p className="text-muted-foreground text-sm">{subtitle}</p>
						)}
					</div>
					{children}
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
