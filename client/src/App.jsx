// client/src/App.jsx (Updated to use React Router)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Components aur Pages Import karein
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import Login from "./components/Login";
import Register from "./components/Register"; // Abhi banayenge
import Cart from "./components/Cart";
import Orders from "./components/Orders";

// Selector to check login status
const selectToken = (state) => state.auth.token;

// --- Private Route Component ---
// Yeh component check karega ki user logged in hai ya nahi.
// Agar nahi hai, toh use /login par bhej dega.
const PrivateRoute = ({ children }) => {
  const token = useSelector(selectToken);
  // Agar token hai toh children (requested component) dikhao, warna /login par navigate karo
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-50 min-h-screen">
        <Header />

        <main className="p-4 container mx-auto">
          <Routes>
            {/* Open Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private/Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <ProductList />
                </PrivateRoute>
              }
            />

            {/* Cart Page Route */}
            <Route
              path="/cart" // ⬅️ NEW ROUTE
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders" // ⬅️ NEW ROUTE
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
