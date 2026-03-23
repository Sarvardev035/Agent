"use client";

import { Calendar } from "@/components/ui/calendar-rac";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
import type { DateValue } from "react-aria-components";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface DailyStatistics {
  date: string;
  income: number;
  expenses: number;
  transactions: number;
  categories: {
    name: string;
    amount: number;
    trend: "up" | "down";
  }[];
}

// Mock data generator for statistics
const generateMockStats = (dateString: string): DailyStatistics => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth();

  return {
    date: dateString,
    income: Math.round(1000 + (day * 50 + month * 100) % 5000),
    expenses: Math.round(500 + (day * 30 + month * 80) % 3000),
    transactions: Math.floor(5 + (day % 20)),
    categories: [
      {
        name: "Food & Dining",
        amount: Math.round(100 + (day * 10) % 500),
        trend: day % 2 === 0 ? "up" : "down",
      },
      {
        name: "Transportation",
        amount: Math.round(50 + (day * 5) % 300),
        trend: day % 3 === 0 ? "up" : "down",
      },
      {
        name: "Entertainment",
        amount: Math.round(75 + (day * 8) % 400),
        trend: day % 2 === 0 ? "down" : "up",
      },
      {
        name: "Shopping",
        amount: Math.round(150 + (day * 15) % 600),
        trend: day % 4 === 0 ? "down" : "up",
      },
    ],
  };
};

function CalendarWithStatistics() {
  const [date, setDate] = useState<DateValue | null>(today(getLocalTimeZone()));
  const [stats, setStats] = useState<DailyStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (newDate: DateValue) => {
    setDate(newDate);
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const dateString = `${newDate.year}-${String(newDate.month).padStart(2, "0")}-${String(newDate.day).padStart(2, "0")}`;
      const newStats = generateMockStats(dateString);
      setStats(newStats);
      setLoading(false);
    }, 500);
  };

  const balance = stats ? stats.income - stats.expenses : 0;
  const isPositive = balance >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-bold text-slate-900">
          Financial Dashboard
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Select a date to view detailed statistics
        </p>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Select Date
              </h2>
              <div className="flex justify-center">
                <Calendar
                  className="rounded-lg border border-slate-200 p-3"
                  value={date}
                  onChange={handleDateChange}
                />
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-sm text-slate-600">Selected Date</p>
                <p className="text-2xl font-bold text-slate-900">
                  {date
                    ? `${date.month}/${date.day}/${date.year}`
                    : "No date selected"}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
                <div className="text-center">
                  <div className="mb-4 inline-block">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"></div>
                  </div>
                  <p className="text-slate-600">Loading statistics...</p>
                </div>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Income
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ${stats.income.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-lg bg-green-100 p-3">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Expenses
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          ${stats.expenses.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-lg bg-red-100 p-3">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Balance
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isPositive ? "text-blue-600" : "text-orange-600"
                          }`}
                        >
                          {isPositive ? "+" : ""}{" "}
                          ${Math.abs(balance).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`rounded-lg ${
                          isPositive ? "bg-blue-100" : "bg-orange-100"
                        } p-3`}
                      >
                        <DollarSign
                          className={`h-6 w-6 ${
                            isPositive ? "text-blue-600" : "text-orange-600"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Count */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Total Transactions
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stats.transactions}
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-100 p-3">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-900">
                    Spending by Category
                  </h3>
                  <div className="space-y-3">
                    {stats.categories.map((category, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium text-slate-700">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            ${category.amount.toLocaleString()}
                          </span>
                          {category.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
                <p className="text-slate-500">
                  Select a date to view statistics
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CalendarWithStatistics };
