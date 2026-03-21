import { useEffect, useState } from "react"
import { getDashboardSummary } from "../api/dashboard"
import type { DashboardData } from "../types/index"
import Navbar from "../components/Navbar"
import {
  PieChart, Pie, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend, Cell
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await getDashboardSummary()
        setData(summary)
      } catch (err: any) {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Total Spent */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <p className="text-gray-500 text-sm">Total Spent This Month</p>
          {/* ✅ Smaller font on mobile */}
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 mt-1">
            ${data?.total_spent.toFixed(2)}
          </p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
              Spending by Category
            </h2>
            {data?.category_summary.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data?.category_summary}
                    dataKey="spent"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ name }) => name as string}
                  >
                    {data?.category_summary.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
              Budget vs Actual
            </h2>
            {data?.category_summary.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data?.category_summary}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                  <Bar dataKey="budget" fill="#10b981" name="Budget" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
            Recent Expenses
          </h2>
          {data?.recent_expenses.length === 0 ? (
            <p className="text-gray-400 text-sm">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {data?.recent_expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center border-b pb-3 gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{expense.title}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-blue-600 shrink-0">
                    ${expense.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard