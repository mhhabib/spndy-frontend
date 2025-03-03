
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const YearSummary = () => {
  // Mock data - in a real app, this would come from an API or context
  const yearTotal = 24658.75;
  const yearData: CategoryData[] = [
    { name: "Housing", value: 9600, color: "#3b82f6" },
    { name: "Food", value: 4200, color: "#10b981" },
    { name: "Transport", value: 3600, color: "#f59e0b" },
    { name: "Medical", value: 2400, color: "#ef4444" },
    { name: "Donation", value: 1200, color: "#8b5cf6" },
    { name: "Electronics", value: 2100, color: "#6366f1" },
    { name: "Others", value: 1558.75, color: "#94a3b8" },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="card-glass w-full animate-slide-in-bottom [animation-delay:100ms]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>Year to Date Expenses</span>
          <span className="text-primary">{formatCurrency(yearTotal)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="md:col-span-3 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={yearData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {yearData.map((entry, index) => (
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
          </div>
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {yearData.map((category) => (
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
                  {Math.round((category.value / yearTotal) * 100)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YearSummary;
