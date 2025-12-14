import React, { useState, useEffect } from "react";
import {
  CakeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const SweetList = () => {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingSweet, setEditingSweet] = useState(null);
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSweets();
  }, [token, navigate]);

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

  const handleDelete = async (id, name) => {
    if (!isAdmin) {
      setError("Only admins can delete sweets");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/sweets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSuccessMessage(`✓ "${name}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchSweets();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete sweet");
      }
    }
  };

  const handleEdit = (sweet) => {
    setEditingSweet(sweet);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("Only admins can update sweets");
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/sweets/${editingSweet._id}`,
        {
          name: editingSweet.name,
          category: editingSweet.category,
          price: parseFloat(editingSweet.price),
          quantity: parseInt(editingSweet.quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("✓ Sweet updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setEditingSweet(null);
      fetchSweets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update sweet");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-6"></div>
        <p className="text-gray-600 text-lg font-medium">Loading sweets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            All Sweets
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Browse and manage sweet inventory
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/sweets/add"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add New Sweet
          </Link>
        )}
      </div>

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
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter"
                : "Get started by adding your first sweet"}
            </p>
            {isAdmin && (
              <Link
                to="/sweets/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Add Sweet
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">
                    Quantity
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSweets.map((sweet) => (
                  <tr
                    key={sweet._id}
                    className="hover:bg-purple-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CakeIcon className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold text-gray-900">
                          {sweet.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {sweet.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-purple-600">
                        ${sweet.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(sweet)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sweet._id, sweet.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingSweet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Edit Sweet
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editingSweet.name}
                  onChange={(e) =>
                    setEditingSweet({ ...editingSweet, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={editingSweet.category}
                  onChange={(e) =>
                    setEditingSweet({
                      ...editingSweet,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingSweet.price}
                  onChange={(e) =>
                    setEditingSweet({
                      ...editingSweet,
                      price: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  value={editingSweet.quantity}
                  onChange={(e) =>
                    setEditingSweet({
                      ...editingSweet,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSweet(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SweetList;
