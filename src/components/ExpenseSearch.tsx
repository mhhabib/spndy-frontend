
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ExpenseSearchProps {
  onSearch: (query: string) => void;
}

const ExpenseSearch = ({ onSearch }: ExpenseSearchProps) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative w-full animate-slide-in-bottom [animation-delay:300ms]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search expenses..."
          value={query}
          onChange={handleChange}
          className="pl-10 py-6 bg-white/70 backdrop-blur-md border-border/50 focus-visible:ring-primary"
        />
      </div>
    </div>
  );
};

export default ExpenseSearch;
