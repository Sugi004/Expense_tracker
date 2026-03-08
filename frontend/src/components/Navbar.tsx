import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-white shadow-sm px-6 flex justify-between items-center">
        <div className="flex gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8">
              <rect width="100" height="100" rx="20" fill="#2563eb" />
              <text x="50" y="68" font-size="60" text-anchor="middle" fill="white">💰</text>
            </svg>
            Expense Tracker
          </Link>
          <Link
            to="/expenses"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Expenses
          </Link>
          <Link
            to="/budgets"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Budgets
          </Link>
          <Link
            to="/categories"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Categories
          </Link>
          <Link
            to="/profile"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Profile
          </Link>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 transition">
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;