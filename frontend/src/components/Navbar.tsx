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
          <Link to="/dashboard" className="font-bold text-blue-600 text-lg">
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