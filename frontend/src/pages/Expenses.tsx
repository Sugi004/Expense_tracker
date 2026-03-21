import { useState, useEffect } from "react";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../api/expenses"
import { getCategories } from "../api/categories";
import type { Expense, Category } from "../types/index.ts";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        amount: "",
        date: "",
        category_id: "",
        note: ""
    });

    useEffect(() => { fetchData(); }, [])

    // Fetch expenses and categories on mount
    const fetchData = async () => {
        try {
            const [expensesData, categoriesData] = await Promise.all([
                getExpenses(),
                getCategories()
            ]);
            setExpenses(expensesData);
            setCategories(categoriesData);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({ title: "", description: "", amount: "", date: "", category_id: "", note: "" });
        setEditingExpense(null);
        setShowForm(false);
    };

    // Populate form with expense data for editing
    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setForm({
            title: expense.title,
            description: "",
            amount: expense.amount.toString(),
            date: expense.date.split("T")[0],
            category_id: expense.category_id.toString(),
            note: expense.note || ""
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async () => {
        if (!form.title || !form.amount || !form.date || !form.category_id) {
            toast.error("Please fill all the required fields");
            return;
        }
        try {
            const payload = {
                title: form.title,
                description: form.description,
                amount: parseFloat(form.amount),
                date: new Date(form.date).toISOString(),
                category_id: parseInt(form.category_id),
                note: form.note || undefined,
            }
            if (editingExpense) {
                const updated = await updateExpense(Number(editingExpense.id), payload)
                setExpenses(expenses.map(e => e.id === updated.id ? updated : e));
            } else {
                const created = await createExpense(payload);
                setExpenses([created, ...expenses]);
            }
            resetForm();
            fetchData();
        } catch (error) {
            toast.error("Failed to save expense");
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            await deleteExpense(id);
            setExpenses(expenses.filter(e => Number(e.id) !== id));
        } catch (error: any) {
            toast.error(error.message || "Failed to delete expense");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-lg">Loading...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            {/* px-4 on mobile, px-6 on desktop */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

                {/* Header — smaller text on mobile */}
                <div className="flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Expenses</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                    >
                        + Add Expense
                    </button>
                </div>

                {/* Form — smaller padding on mobile */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                            {editingExpense ? "Edit Expense" : "New Expense"}
                        </h2>

                        {/* Single column on mobile, two columns on sm+ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Lunch"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Note spans full width on sm+ */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                                <textarea
                                    name="note"
                                    value={form.note}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional note"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleSubmit}
                                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                {editingExpense ? "Update" : "Save"}
                            </button>
                            <button
                                onClick={resetForm}
                                className="w-full sm:w-auto bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Expenses list */}
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">All Expenses</h2>
                    {expenses.length === 0 ? (
                        <p className="text-gray-400 text-sm">No expenses yet — add your first one!</p>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map(expense => (
                                <div
                                    key={expense.id}
                                    className="flex justify-between items-start border-b pb-3 gap-2"
                                >
                                    {/* min-w-0 prevents long text from overflowing */}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-800 truncate">{expense.title}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(expense.date).toLocaleDateString()} ·{" "}
                                            {categories.find(c => Number(c.id) === Number(expense.category_id))?.name || "Unknown"}
                                        </p>
                                        {expense.note && (
                                            <p className="text-sm text-gray-500 italic truncate">{expense.note}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 shrink-0">
                                        <p className="font-semibold text-blue-600">
                                            ${expense.amount.toFixed(2)}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(Number(expense.id))}
                                                className="text-xs sm:text-sm text-gray-500 hover:text-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}