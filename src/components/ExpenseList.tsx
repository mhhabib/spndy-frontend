
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  showEditControls: boolean;
  onDeleteExpense: (id: string) => void;
}

const ExpenseList = ({ expenses, showEditControls, onDeleteExpense }: ExpenseListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    if (deleteId) {
      onDeleteExpense(deleteId);
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="card-glass w-full animate-slide-in-bottom [animation-delay:400ms]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/30 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">#</th>
                <th scope="col" className="px-4 py-3">Description</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                {showEditControls && (
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr 
                  key={expense.id} 
                  className="expense-item border-b border-border/40 bg-white/30 backdrop-blur-sm last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(expense.amount)}</td>
                  {showEditControls && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Dialog open={isDeleteDialogOpen && deleteId === expense.id} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
                              onClick={() => setDeleteId(expense.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this expense? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setIsDeleteDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleDelete}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr className="border-b border-border/40 bg-white/30 backdrop-blur-sm">
                  <td colSpan={showEditControls ? 5 : 4} className="px-4 py-10 text-center text-muted-foreground">
                    No expenses found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
