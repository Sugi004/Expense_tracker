import { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory } from "../api/categories";
import type { Category } from "../types/index";
import Navbar from "../components/Navbar";


const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const categoriesData = await getCategories();
            setCategories(categoriesData);
        } catch (error) {
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!name) {
            setError("Please enter a category name");
            return;
        }
        try {
            const created = await createCategory(name.trim());
            setCategories([...categories, created]);
            setName("");
            setShowForm(false);
            setError("");
        } catch (error: any) {
            setError(error.response?.data?.detail || "Failed to create category");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await deleteCategory(id);
            setCategories(categories.filter(category => Number(category.id) !== id));
        } catch (error) {
            setError("Failed to delete category");
        }
    };

    if (loading)
        return <div className="min-h-screen flex bg-gray-100"><Navbar />
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-600">Loading...</p></div>
        </div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add Category
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
                        <h2 className="text-lg font-semibold text-gray-700">New Category</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Groceries"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setName(""); setError("") }}
                                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Categories List */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">All Categories</h2>
                    {categories.length === 0 ? (
                        <p className="text-gray-400 text-sm">No categories yet — add your first one!</p>
                    ) : (
                        <div className="space-y-3">
                            {categories.map(category => (
                                <div key={category.id} className="flex justify-between items-center border-b pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <p className="font-medium text-gray-800">{category.name}</p>
                                        {category.user_id === null && (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                Global
                                            </span>
                                        )}
                                    </div>
                                    {category.user_id !== null && (
                                        <button
                                            onClick={() => handleDelete(Number(category.id))}
                                            className="text-sm text-gray-500 hover:text-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Categories