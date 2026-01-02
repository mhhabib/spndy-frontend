interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
	return (
		<div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
			{/* Sophisticated gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

			{/* Grid pattern overlay */}
			<div
				className="absolute inset-0 opacity-[0.02]"
				style={{
					backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
					backgroundSize: '60px 60px',
				}}
			/>

			{/* Floating decorative elements */}
			<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
			<div
				className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float"
				style={{ animationDelay: '-3s' }}
			/>

			{/* Accent lines */}
			<div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
			<div className="absolute bottom-0 left-1/2 w-px h-32 bg-gradient-to-t from-transparent via-primary/20 to-transparent" />

			{/* Content */}
			<div className="relative z-10 w-full max-w-md animate-slide-up">
				{/* Card */}
				<div className="backdrop-blur-xl bg-card/80 border border-border/20 rounded-2xl shadow-2xl shadow-foreground/5 p-8 md:p-10">
					<div className="text-center mb-8">
						<h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">
							{title}
						</h1>
						{subtitle && (
							<p className="text-muted-foreground text-sm">{subtitle}</p>
						)}
					</div>
					{children}
				</div>

				{/* Footer text */}
				<p className="text-center text-xs text-muted-foreground/60 mt-6">
					@Spndy - A secure personal financial management app
				</p>
			</div>
		</div>
	);
};

export default AuthLayout;
