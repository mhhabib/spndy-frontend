
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Search, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExpenseList, { Expense } from "@/components/ExpenseList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Summary = () => {
  const [showEditControls, setShowEditControls] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  // Mock data - in a real app, this would come from an API or context
  const allExpenses: Expense[] = [
    {
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      amount: 800,
      date: "2023-05-01",
    },
    {
      id: "2",
      description: "Grocery Shopping",
      category: "Food",
      amount: 120.50,
      date: "2023-05-05",
    },
    {
      id: "3",
      description: "Gas",
      category: "Transport",
      amount: 45.75,
      date: "2023-05-08",
    },
    {
      id: "4",
      description: "Doctor Visit",
      category: "Medical",
      amount: 75,
      date: "2023-06-12",
    },
    {
      id: "5",
      description: "Charity Donation",
      category: "Donation",
      amount: 50,
      date: "2023-06-15",
    },
    {
      id: "6",
      description: "New Headphones",
      category: "Electronics",
      amount: 89.99,
      date: "2023-07-18",
    },
    {
      id: "7",
      description: "Miscellaneous",
      category: "Others",
      amount: 35.50,
      date: "2023-07-22",
    },
  ];

  // Filter expenses based on date range and search query
  const filteredExpenses = allExpenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    const withinDateRange = dateRange?.from && dateRange?.to 
      ? isWithinInterval(expenseDate, { start: dateRange.from, end: dateRange.to })
      : true;
    
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return withinDateRange && matchesSearch;
  });

  // Calculate total for filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Generate category data for chart
  const categories = ["Housing", "Food", "Transport", "Medical", "Donation", "Electronics", "Others"];
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1", "#94a3b8"];
  
  const categoryData: CategoryData[] = categories.map((category, index) => {
    const totalForCategory = filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category,
      value: totalForCategory,
      color: colors[index]
    };
  }).filter(category => category.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDeleteExpense = (id: string) => {
    // In a real app, this would call an API or update context
    console.log(`Delete expense with id: ${id}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Select date range";
    if (!dateRange.to) return `From ${format(dateRange.from, "PPP")}`;
    return `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        showEditControls={showEditControls} 
        onToggleEditControls={setShowEditControls} 
      />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Expense Summary</h1>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start gap-2">
                <Calendar className="h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="bg-white rounded-md border border-border/50"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Card className="card-glass w-full animate-slide-in-bottom [animation-delay:100ms]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex justify-between items-center">
              <span>Expenses for Selected Period</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div className="md:col-span-3 h-[240px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          border: 'none' 
                        }}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No expenses found for this period</p>
                  </div>
                )}
              </div>
              <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoryData.map((category) => (
                  <div 
                    key={category.name} 
                    className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-border/50 shadow-sm hover-scale"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(category.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((category.value / totalAmount) * 100) || 0}% of total
                    </p>
                  </div>
                ))}
                {categoryData.length === 0 && (
                  <div className="p-3 col-span-3 rounded-lg bg-white/50 backdrop-blur-sm border border-border/50 shadow-sm">
                    <p className="text-center text-muted-foreground">No expense data available for the selected period</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="relative w-full animate-slide-in-bottom [animation-delay:300ms]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 py-6 bg-white/70 backdrop-blur-md border-border/50 focus-visible:ring-primary"
            />
          </div>
        </div>
        
        <ExpenseList 
          expenses={filteredExpenses} 
          showEditControls={showEditControls}
          onDeleteExpense={handleDeleteExpense}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Summary;
