import React, { useState, useEffect } from 'react';
import axios from '../../helpers/axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const NewsCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
  const token = window.localStorage.getItem("token");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('news-categories');
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      description: '',
      icon: '📰',
      order: 0,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description);
    setValue('icon', category.icon);
    setValue('order', category.order);
    setValue('status', category.status);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  // Submit form (add or edit)
  const onSubmit = async (data) => {
    try {
      const requestData = {
        ...data,
        order: parseInt(data.order) || 0
      };

      let response;
      if (editingCategory) {
        // Update existing category
        response = await axios.put(`news-categories/${editingCategory._id}`, requestData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Category updated successfully!');
      } else {
        // Create new category
        response = await axios.post('news-categories', requestData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Category created successfully!');
      }

      if (response.data) {
        fetchCategories(); // Refresh the list
        closeModal();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setDeletingCategory(id);
    try {
      await axios.delete(`news-categories/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Category deleted successfully!');
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingCategory(null);
    }
  };

  // Toggle category status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.patch(`news-categories/${id}/toggle`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error(error.response?.data?.message || 'Failed to update category status');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Categories</h1>
          <p className="text-gray-600 mt-1">Manage news categories for organizing articles</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Category
        </button>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first news category.</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-2xl">
                        {category.icon}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.newsCount || 0} articles
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category._id, category.status)}
                            className={`transition-colors ${
                              category.status === 'active' 
                                ? 'text-yellow-600 hover:text-yellow-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {category.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            disabled={deletingCategory === category._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {deletingCategory === category._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  {...register('name', { required: 'Category name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <input
                  {...register('icon')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="📰 (emoji)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  {...register('order')}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCategories;