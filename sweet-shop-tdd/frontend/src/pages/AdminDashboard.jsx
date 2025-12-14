import React, { useState, useEffect, useCallback } from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSweets: 0,
    totalRevenue: 0,
    lowStockSweets: 0,
    outOfStockSweets: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const fetchAdminData = useCallback(async () => {
    if (!token) {
      console.log("⚠️ No token, skipping fetch");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📡 Fetching sweets from API...");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sweets?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ API Response:", response.data);

      const sweets = response.data.sweets || [];

      // Calculate statistics
      const totalSweets = sweets.length;
      const totalRevenue = sweets.reduce(
        (sum, sweet) => sum + sweet.price * sweet.quantity,
        0
      );
      const lowStock = sweets.filter(
        (sweet) => sweet.quantity > 0 && sweet.quantity <= 10
      );
      const outOfStock = sweets.filter((sweet) => sweet.quantity === 0);

      setStats({
        totalSweets,
        totalRevenue,
        lowStockSweets: lowStock.length,
        outOfStockSweets: outOfStock.length,
      });

      setLowStockItems(lowStock);
      setOutOfStockItems(outOfStock);
    } catch (err) {
      console.error("❌ Error fetching admin data:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch dashboard data"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    console.log("🔍 AdminDashboard mounted - User:", user);
    fetchAdminData();
  }, [fetchAdminData, user]);

  const handleRestock = async (id, currentQuantity) => {
    const quantity = prompt(
      `Enter restock quantity:\n(Current: ${currentQuantity})`
    );

    if (!quantity) return;

    if (isNaN(quantity) || parseInt(quantity) <= 0) {
      setError("Please enter a valid positive number");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/sweets/${id}/restock`,
        { quantity: parseInt(quantity) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(`✓ Successfully restocked ${quantity} units!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Restock failed");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/sweets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage(`✓ Successfully deleted ${name}!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-6"></div>
        <p className="text-gray-600 text-lg font-medium">
          Loading Admin Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
              👨‍💼 ADMIN
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Welcome back, {user?.email} - Manage your sweet shop
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="h-10 w-10 opacity-80" />
            <span className="text-3xl font-bold">{stats.totalSweets}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Sweets</h3>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="h-10 w-10 opacity-80" />
            <span className="text-3xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <ExclamationTriangleIcon className="h-10 w-10 opacity-80" />
            <span className="text-3xl font-bold">{stats.lowStockSweets}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Low Stock Items</h3>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <XCircleIcon className="h-10 w-10 opacity-80" />
            <span className="text-3xl font-bold">{stats.outOfStockSweets}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Out of Stock</h3>
        </div>
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
            Low Stock Items (≤10 units)
          </h2>
          <div className="space-y-3">
            {lowStockItems.map((sweet) => (
              <div
                key={sweet._id}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{sweet.name}</h3>
                  <p className="text-sm text-gray-600">
                    {sweet.category} • ${sweet.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {sweet.quantity} units
                  </span>
                  <button
                    onClick={() => handleRestock(sweet._id, sweet.quantity)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <XCircleIcon className="h-6 w-6 text-red-500" />
            Out of Stock Items
          </h2>
          <div className="space-y-3">
            {outOfStockItems.map((sweet) => (
              <div
                key={sweet._id}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{sweet.name}</h3>
                  <p className="text-sm text-gray-600">
                    {sweet.category} • ${sweet.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    Out of Stock
                  </span>
                  <button
                    onClick={() => handleRestock(sweet._id, sweet.quantity)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => handleDelete(sweet._id, sweet.name)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12 text-center border-2 border-green-200">
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            ✅ All Good!
          </h3>
          <p className="text-green-700">
            All items are well-stocked. No action needed.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🚀 Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/sweets/add")}
            className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            + Add New Sweet
          </button>
          <button
            onClick={() => navigate("/sweets")}
            className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            📋 View All Sweets
          </button>
          <button
            onClick={fetchAdminData}
            className="p-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
