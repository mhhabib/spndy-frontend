
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-8 pb-6 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-border/40 pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} ExpenseTracker. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
