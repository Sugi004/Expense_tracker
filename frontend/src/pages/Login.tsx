import React from 'react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import toast from 'react-hot-toast'


export const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setpassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await login(email, password);
            authLogin(token.access_token);
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" value={password} onChange={(e) => setpassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register here</Link>
                    </p>
                </div>
            </div>
        </>
    )
}
