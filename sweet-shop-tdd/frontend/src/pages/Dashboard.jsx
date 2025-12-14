import React, { useState, useEffect } from "react";
import {
  CakeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const { token, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("❌ No token, redirecting to login");
      navigate("/login");
      return;
    }

    if (isAdmin) {
      console.log("👨‍💼 Admin user, redirecting to admin dashboard");
      navigate("/admin-dashboard");
      return;
    }

    console.log("✅ Regular user, fetching sweets");
    fetchSweets();
  }, [token, isAdmin, navigate]);

  const fetchSweets = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sweets?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSweets(response.data.sweets || []);
      setFilteredSweets(response.data.sweets || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch sweets");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = sweets;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (sweet) =>
          sweet.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((sweet) =>
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSweets(filtered);
  }, [searchTerm, selectedCategory, sweets]);

  const categories = ["all", ...new Set(sweets.map((s) => s.category))];

  const handlePurchase = async (sweetId, name, availableQuantity) => {
    const quantity = prompt(
      `How many "${name}" would you like to purchase?\n(Available: ${availableQuantity})`
    );

    if (!quantity) return;

    if (isNaN(quantity) || parseInt(quantity) <= 0) {
      setError("Please enter a valid positive number");
      return;
    }

    if (parseInt(quantity) > availableQuantity) {
      setError(`Only ${availableQuantity} units available`);
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/sweets/${sweetId}/purchase`,
        { quantity: parseInt(quantity) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(`✓ Successfully purchased ${quantity} ${name}(s)!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchSweets();
    } catch (err) {
      setError(
        err.response?.data?.message || "Purchase failed. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-6"></div>
        <p className="text-gray-600 text-lg font-medium">
          Loading Sweet Shop...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sweet Shop
            </h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
              👤 USER
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Welcome, {user?.email} - Browse and purchase delicious sweets
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <XCircleIcon className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sweets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {filteredSweets.length === 0 ? (
          <div className="text-center py-12">
            <CakeIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Sweets Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter"
                : "The shop is currently empty"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSweets.map((sweet) => (
              <div
                key={sweet._id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-xl transition-shadow border border-purple-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {sweet.name}
                    </h3>
                    <p className="text-sm text-purple-600 font-medium">
                      {sweet.category}
                    </p>
                  </div>
                  <CakeIcon className="h-8 w-8 text-purple-500" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ${sweet.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        sweet.quantity === 0
                          ? "bg-red-100 text-red-800"
                          : sweet.quantity <= 10
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {sweet.quantity === 0
                        ? "Out of Stock"
                        : `${sweet.quantity} units`}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handlePurchase(sweet._id, sweet.name, sweet.quantity)
                    }
                    disabled={sweet.quantity === 0}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      sweet.quantity === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    {sweet.quantity === 0 ? "Out of Stock" : "Purchase"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ℹ️ User Permissions
        </h3>
        <div className="flex flex-wrap gap-2 text-sm text-purple-700">
          <span className="px-3 py-1 bg-purple-100 rounded-full">
            ✓ View Sweets
          </span>
          <span className="px-3 py-1 bg-purple-100 rounded-full">
            ✓ Purchase Sweets
          </span>
          <span className="px-3 py-1 bg-purple-100 rounded-full">
            ✓ Search & Filter
          </span>
          <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full">
            ✗ Add/Edit/Delete (Admin Only)
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
