import { useState, useEffect } from "react";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../api/budgets";
import Navbar from "../components/Navbar";
import type { Budget, Category } from "../types/index";
import { getCategories } from "../api/categories";

const Budgets = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    // Form state
    const [form, setForm] = useState({
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        category_id: ""
    });

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const [budgetsData, categoriesData] = await Promise.all([
                getBudgets(),
                getCategories()
            ]);
            setBudgets(budgetsData);
            setCategories(categoriesData);
        } catch (error) {
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            amount: "",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            category_id: ""
        });
        setEditingBudget(null);
        setShowForm(false);
        setError("");
    };

    const handleSubmit = async () => {
        if (!form.amount || !form.category_id) {
            setError("Please fill all the required fields");
            return;
        }

        try {
            const payload = {
                amount: parseFloat(form.amount),
                month: Number(form.month),
                year: Number(form.year),
                category_id: Number(form.category_id)
            }

            if (editingBudget) {
                const updated = await updateBudget(Number(editingBudget.id), payload)
                setBudgets(budgets.map(budget => budget.id === updated.id ? updated : budget));
            } else {
                const created = await createBudget(payload);
                setBudgets([created, ...budgets]);
            }
            resetForm();

            setShowForm(false);
            setEditingBudget(null);
            fetchData();
        } catch (error) {
            setError("Failed to save budget");
        }
    };

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setForm({
            amount: budget.amount.toString(),
            month: budget.month,
            year: budget.year,
            category_id: budget.category_id.toString()
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        if (!confirm("Are you sure you want to delete this budget?")) return;
        try {
            await deleteBudget(id);
            setBudgets(budgets.filter(budget => Number(budget.id) !== id));
        } catch (error: any) {
            setError(error.message || "Failed to delete budget");
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (loading) return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading...</p>
            </div>
        </div>
    )
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Budgets</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add Budget
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700">
                            {editingBudget ? "Edit Budget" : "New Budget"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                                <select
                                    name="month"
                                    value={form.month}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {months.map((month, index) => (
                                        <option key={index + 1} value={index + 1}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="2026"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                {editingBudget ? "Update" : "Save"}
                            </button>
                            <button
                                onClick={resetForm}
                                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Budgets List */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">All Budgets</h2>
                    {budgets.length === 0 ? (
                        <p className="text-gray-400 text-sm">No budgets yet — add your first one!</p>
                    ) : (
                        <div className="space-y-3">
                            {budgets.map(budget => (
                                <div key={budget.id} className="flex justify-between items-center border-b pb-3">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {categories.find(c => Number(c.id) === Number(budget.category_id))?.name || "Unknown"}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {months[budget.month - 1]} {budget.year}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold text-green-600">${budget.amount.toFixed(2)}</p>
                                        <button
                                            onClick={() => handleEdit(budget)}
                                            className="text-sm text-gray-500 hover:text-blue-600 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(Number(budget.id))}
                                            className="text-sm text-gray-500 hover:text-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Budgets;
