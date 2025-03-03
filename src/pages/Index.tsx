
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import YearSummary from "@/components/YearSummary";
import MonthSummary from "@/components/MonthSummary";
import ExpenseSearch from "@/components/ExpenseSearch";
import ExpenseList, { Expense } from "@/components/ExpenseList";
import Footer from "@/components/Footer";

const Index = () => {
  const [showEditControls, setShowEditControls] = useState(() => {
    const savedEditMode = localStorage.getItem('editMode');
    return savedEditMode ? savedEditMode === 'true' : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      amount: 800,
      date: "May 1, 2023",
    },
    {
      id: "2",
      description: "Grocery Shopping",
      category: "Food",
      amount: 120.50,
      date: "May 5, 2023",
    },
    {
      id: "3",
      description: "Gas",
      category: "Transport",
      amount: 45.75,
      date: "May 8, 2023",
    },
    {
      id: "4",
      description: "Doctor Visit",
      category: "Medical",
      amount: 75,
      date: "May 12, 2023",
    },
    {
      id: "5",
      description: "Charity Donation",
      category: "Donation",
      amount: 50,
      date: "May 15, 2023",
    },
    {
      id: "6",
      description: "New Headphones",
      category: "Electronics",
      amount: 89.99,
      date: "May 18, 2023",
    },
    {
      id: "7",
      description: "Miscellaneous",
      category: "Others",
      amount: 35.50,
      date: "May 22, 2023",
    },
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        showEditControls={showEditControls} 
        onToggleEditControls={setShowEditControls} 
      />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <YearSummary />
        <MonthSummary />
        
        <ExpenseSearch onSearch={handleSearch} />
        
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

export default Index;
