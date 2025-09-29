// client/src/components/Header.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice.js";
import { Link } from "react-router-dom";

// Selector function to get user details
const selectUser = (state) => state.auth.user;
const selectToken = (state) => state.auth.token;

const Header = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();

  const handleLogout = () => {
    // 1. Redux state aur Local Storage se token/user clear karna
    dispatch(logout());
    // 2. Browser ko redirect karna (Next step mein router se karenge, abhi refresh)
    // Abhi simple rakhte hain, App.jsx mein conditional rendering khud hi login page dikha dega
    console.log("User logged out successfully!");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-indigo-600">E-Shop</h1>

        <nav className="flex items-center space-x-4">
          {token && user ? (
            // Logged In State
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Welcome, {user.first_name}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition duration-150 text-sm"
              >
                Logout
              </button>
              <Link
                to="/orders"
                className="text-gray-600 hover:text-indigo-600 font-semibold transition duration-150"
              >
                My Orders
              </Link>
              <Link
                to="/cart" // ⬅️ Cart route link
                className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-150 flex items-center space-x-1"
              >
                <span>🛒</span> <span>Cart</span>
              </Link>
            </div>
          ) : (
            // Logged Out State (Yaani Login page par hain)
            <div className="text-gray-500 text-sm">Please sign in</div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
