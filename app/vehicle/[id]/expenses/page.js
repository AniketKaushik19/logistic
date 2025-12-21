"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, IndianRupee, TrendingUp } from "lucide-react";
import { AdminNav } from "@/app/components/AdminNav";
import { useParams } from "next/navigation";

export default function ExpensesPage() {
    const id =useParams().id

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [latestOnly, setLatestOnly] = useState(false);

  const limit = 10;

  const fetchExpenses = async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: latestOnly ? 5 : limit,
        skip: reset ? 0 : skip,
        latest: latestOnly.toString(),
      });

      const response = await fetch(`/api/expense?${params}`);
      const data = await response.json();

      if (data.status === "200") {
        setExpenses(reset ? data.expenses : [...expenses, ...data.expenses]);
        setHasMore(data.hasMore);
        if (!reset) setSkip(skip + limit);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setSkip(0);
    fetchExpenses(true);
  }, [latestOnly]);

  const loadMore = () => {
    if (!latestOnly) fetchExpenses();
  };

  return (
       <>
        <AdminNav id={id}/>   
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* //Admin Navbar  */}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your spending
          </p>
        </div>

        <Button
          onClick={() => setLatestOnly(!latestOnly)}
          variant={latestOnly ? "default" : "outline"}
          className="flex gap-2"
        >
          <TrendingUp size={18} />
          {latestOnly ? "Show All Expenses" : "Show Latest"}
        </Button>
      </div>

      {/* Expenses Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {expenses.map((expense, index) => (
          <Card
            key={index}
            className="rounded-2xl shadow-md hover:shadow-lg transition"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold truncate">
                {expense.title || "Expense"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-1 text-lg font-medium">
                <IndianRupee size={18} className="text-green-600" />
                {expense.Amount}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                {new Date(expense.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {!loading && expenses.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No expenses found
          </div>
        )}
      </div>

      {/* Load More */}
      {!latestOnly && hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl px-8"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
    </>
  );
}
