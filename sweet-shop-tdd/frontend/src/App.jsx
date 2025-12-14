import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SweetList from "./pages/SweetList";
import AddSweet from "./pages/AddSweet";
import PrivateRoute from "./components/Auth/PrivateRoute";
import AdminRoute from "./components/Auth/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route - always shows register first */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with Layout */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* User Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin Only Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Sweets Management */}
            <Route path="/sweets" element={<SweetList />} />
            <Route
              path="/sweets/add"
              element={
                <AdminRoute>
                  <AddSweet />
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to register */}
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
