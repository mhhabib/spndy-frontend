
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Expense } from "@/components/ExpenseList";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSearch from "@/components/ExpenseSearch";
import Footer from "@/components/Footer";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#FF6B6B', '#4CAF50'];

const MyExpenses = () => {
  const navigate = useNavigate();
  const [showEditControls, setShowEditControls] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("all");

  // Sample data - in a real app, this would come from an API or context
  const [expenses] = useState<Expense[]>([
    { id: "1", description: "Rent", category: "Housing", amount: 1200, date: "2023-06-01" },
    { id: "2", description: "Groceries", category: "Food", amount: 250, date: "2023-06-05" },
    { id: "3", description: "Car payment", category: "Transport", amount: 350, date: "2023-06-10" },
    { id: "4", description: "Internet", category: "Utilities", amount: 80, date: "2023-06-15" },
    { id: "5", description: "Doctors visit", category: "Medical", amount: 100, date: "2023-06-20" },
    { id: "6", description: "Donation", category: "Charity", amount: 50, date: "2023-06-25" },
  ]);

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryTotals).map((category) => ({
    name: category,
    value: categoryTotals[category],
  }));

  const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  const handleDeleteExpense = (id: string) => {
    // In a real app, this would call an API to delete the expense
    console.log("Delete expense with ID:", id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background/80 backdrop-blur-md border-b border-border/40 w-full px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-lg font-semibold">My Expenses</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={showEditControls}
              onCheckedChange={setShowEditControls}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm text-muted-foreground">Edit Mode</span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card-glass lg:col-span-2 animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">Expense Summary</CardTitle>
                <Select 
                  value={timeframe} 
                  onValueChange={setTimeframe}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {Object.entries(categoryTotals).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ 
                          backgroundColor: COLORS[Object.keys(categoryTotals).indexOf(category) % COLORS.length] 
                        }}></div>
                        <span className="text-sm">{category}</span>
                      </div>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ExpenseSearch onSearch={setSearchQuery} />
        
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

export default MyExpenses;

import { Switch } from "@/components/ui/switch";
