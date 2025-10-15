import React, { useState, useEffect } from "react";
import axios from "../../helpers/axios";
import toast from "react-hot-toast";
import EnhancedNewsForm from "../../component/NewsForm/EnhancedNewsForm";

const EnhancedNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [selectedNews, setSelectedNews] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    author: "",
    search: ""
  });

  const token = window.localStorage.getItem("token");

  // Fetch news data
  const fetchNews = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.author && { author: filters.author }),
        ...(filters.search && { search: filters.search })
      });

      const response = await axios.get(`news?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNews(response.data.news);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews();
  }, [filters]);

  // Handle form success
  const handleFormSuccess = (savedNews) => {
    setShowForm(false);
    setEditingNews(null);
    fetchNews(currentPage);
    toast.success(editingNews ? 'News updated successfully!' : 'News created successfully!');
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingNews(null);
  };

  // Open form for new news
  const openNewForm = () => {
    setEditingNews(null);
    setShowForm(true);
  };

  // Open form for editing
  const openEditForm = (newsItem) => {
    setEditingNews(newsItem);
    setShowForm(true);
  };

  // Delete news
  const deleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news?')) {
      return;
    }

    try {
      await axios.delete(`news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('News deleted successfully');
      fetchNews(currentPage);
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Failed to delete news");
    }
  };

  // Delete multiple news
  const deleteMultipleNews = async () => {
    if (selectedNews.length === 0) {
      toast.error('Please select news to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedNews.length} news items?`)) {
      return;
    }

    try {
      await axios.delete('news', {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selectedNews }
      });
      toast.success(`${selectedNews.length} news items deleted successfully`);
      setSelectedNews([]);
      setIsSelectAll(false);
      fetchNews(currentPage);
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Failed to delete news");
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedNews([]);
    } else {
      setSelectedNews(news.map(item => item._id));
    }
    setIsSelectAll(!isSelectAll);
  };

  // Toggle individual selection
  const toggleSelection = (id) => {
    if (selectedNews.includes(id)) {
      setSelectedNews(selectedNews.filter(item => item !== id));
    } else {
      setSelectedNews([...selectedNews, id]);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNews(page);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <EnhancedNewsForm
          news={editingNews}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
        <button
          onClick={openNewForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New News
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search news..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <input
              type="text"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by author"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNews.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800">
              {selectedNews.length} news selected
            </span>
            <button
              onClick={deleteMultipleNews}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">News Articles ({totalItems})</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelectAll}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
                <span className="text-sm">Select All</span>
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No news found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {news.map((item) => (
              <div key={item._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNews.includes(item._id)}
                    onChange={() => toggleSelection(item._id)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{item.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Category: {item.category}</span>
                          <span>Author: {item.author}</span>
                          <span>Read Time: {item.readTime}</span>
                          <span>Views: {item.viewCount || 0}</span>
                          {item.isFeatured && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'published' ? 'bg-green-100 text-green-800' :
                            item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteNews(item._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {item.bannerImage && (
                      <div className="mt-4">
                        <img
                          src={item.bannerImage}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedNews;
