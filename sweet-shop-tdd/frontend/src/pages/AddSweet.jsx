import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CakeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AddSweet = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAdmin) {
      setError("Only admins can add sweets");
      return;
    }

    if (parseFloat(formData.price) < 0) {
      setError("Price cannot be negative");
      return;
    }

    if (parseInt(formData.quantity) < 0) {
      setError("Quantity cannot be negative");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/sweets`,
        {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/sweets");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add sweet");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-3">
            Access Denied
          </h2>
          <p className="text-red-700 mb-6">
            Only administrators can add sweets to the inventory.
          </p>
          <Link
            to="/sweets"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Sweets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/sweets"
          className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6 text-purple-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add New Sweet
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Add a new sweet to your inventory
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sweet Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CakeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., Chocolate Bar"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g., Chocolate, Candy, Gummy"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-900 font-medium mb-2">
              ℹ️ Quick Tips:
            </p>
            <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
              <li>Use descriptive names for better searchability</li>
              <li>
                Keep categories consistent (e.g., "Chocolate" not "chocolates")
              </li>
              <li>Price should include cents (e.g., 2.99)</li>
              <li>You can set quantity to 0 if currently out of stock</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="h-5 w-5" />
              {loading ? "Adding Sweet..." : "Add Sweet"}
            </button>

            <Link
              to="/sweets"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          🍬 Popular Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Chocolate",
            "Candy",
            "Gummy",
            "Hard Candy",
            "Soft Candy",
            "Lollipops",
            "Caramel",
            "Mint",
          ].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFormData({ ...formData, category })}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddSweet;
