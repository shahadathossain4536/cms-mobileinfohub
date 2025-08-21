import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [selectedNews, setSelectedNews] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    author: ""
  });

  const token = window.localStorage.getItem("token");
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Fetch news data
  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...filters
      });

      const response = await axios.get(
        `https://deviceinfohub-server.vercel.app/api/news?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Check if response has the expected structure
      if (response.data && response.data.news) {
        setNews(response.data.news);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalItems(response.data.pagination.totalItems || 0);
          setCurrentPage(response.data.pagination.currentPage || 1);
        } else {
          // Fallback if pagination is missing
          setTotalPages(1);
          setTotalItems(response.data.news.length || 0);
          setCurrentPage(1);
        }
      } else {
        // Handle case where response structure is different
        console.log('Unexpected API response structure:', response.data);
        setNews(response.data || []);
        setTotalPages(1);
        setTotalItems(response.data?.length || 0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to fetch news");
      // Set default values on error
      setNews([]);
      setTotalPages(1);
      setTotalItems(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [filters]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNews(page);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Open modal for adding news
  const openAddModal = () => {
    setEditingNews(null);
    reset();
    setIsModalOpen(true);
  };

  // Open modal for editing news
  const openEditModal = (newsItem) => {
    setEditingNews(newsItem);
    setValue("title", newsItem.title);
    setValue("excerpt", newsItem.excerpt);
    setValue("content", JSON.stringify(newsItem.content, null, 2));
    setValue("image", newsItem.image);
    setValue("category", newsItem.category);
    setValue("author", newsItem.author);
    setValue("readTime", newsItem.readTime);
    setValue("tags", newsItem.tags?.join(", "));
    setValue("status", newsItem.status);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
    reset();
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Parse content if it's a string
      let parsedContent = data.content;
      if (typeof data.content === "string") {
        try {
          parsedContent = JSON.parse(data.content);
        } catch (e) {
          toast.error("Invalid content format. Please use valid JSON.");
          return;
        }
      }

      // Parse tags
      const tags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [];

      const newsData = {
        title: data.title,
        excerpt: data.excerpt,
        content: parsedContent,
        image: data.image,
        category: data.category,
        author: data.author,
        readTime: data.readTime,
        tags: tags,
        status: data.status
      };

      if (editingNews) {
        // Update existing news
        await axios.put(
          `https://deviceinfohub-server.vercel.app/api/news/${editingNews._id}`,
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success("News updated successfully");
      } else {
        // Create new news
        await axios.post(
          "https://deviceinfohub-server.vercel.app/api/news",
          newsData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success("News created successfully");
      }

      closeModal();
      fetchNews(currentPage);
    } catch (error) {
      console.error("Error saving news:", error);
      toast.error(editingNews ? "Failed to update news" : "Failed to create news");
    }
  };

  // Handle delete single news
  const handleDeleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      await axios.delete(
        `https://deviceinfohub-server.vercel.app/api/news/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success("News deleted successfully");
      fetchNews(currentPage);
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Failed to delete news");
    }
  };

  // Handle multiple news deletion
  const handleDeleteMultiple = async () => {
    if (selectedNews.length === 0) {
      toast.error("Please select news to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedNews.length} selected news?`)) return;

    try {
      await axios.delete(
        "https://deviceinfohub-server.vercel.app/api/news",
        {
          data: { ids: selectedNews },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success(`${selectedNews.length} news deleted successfully`);
      setSelectedNews([]);
      setIsSelectAll(false);
      fetchNews(currentPage);
    } catch (error) {
      console.error("Error deleting multiple news:", error);
      toast.error("Failed to delete selected news");
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    setIsSelectAll(checked);
    if (checked) {
      setSelectedNews(news.map(item => item._id));
    } else {
      setSelectedNews([]);
    }
  };

  // Handle individual selection
  const handleSelectNews = (id, checked) => {
    if (checked) {
      setSelectedNews(prev => [...prev, id]);
    } else {
      setSelectedNews(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Update select all state when individual selections change
  useEffect(() => {
    if (selectedNews.length === news.length && news.length > 0) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedNews, news]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              News Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Manage news articles and publications
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              + Add News
            </button>
            {selectedNews.length > 0 && (
              <button
                onClick={handleDeleteMultiple}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Selected ({selectedNews.length})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                placeholder="Filter by category"
                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Author
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) => handleFilterChange("author", e.target.value)}
                placeholder="Filter by author"
                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading news...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={isSelectAll}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Author
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Published
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {Array.isArray(news) && news.length > 0 ? (
                      news.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedNews.includes(item._id)}
                              onChange={(e) => handleSelectNews(item._id, e.target.checked)}
                              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {item.title}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {item.excerpt?.substring(0, 60)}...
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                            {item.author}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'published' ? 'bg-green-100 text-green-800' :
                              item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteNews(item._id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                          {loading ? 'Loading news...' : 'No news found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            page === currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-500'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingNews ? 'Edit News' : 'Add News'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter news title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category *
                  </label>
                  <input
                    {...register("category", { required: "Category is required" })}
                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter category"
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Author *
                  </label>
                  <input
                    {...register("author", { required: "Author is required" })}
                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter author name"
                  />
                  {errors.author && (
                    <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Read Time *
                  </label>
                  <input
                    {...register("readTime", { required: "Read time is required" })}
                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 5 min read"
                  />
                  {errors.readTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.readTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Image URL *
                  </label>
                  <input
                    {...register("image", { required: "Image URL is required" })}
                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter image URL"
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Excerpt *
                </label>
                <textarea
                  {...register("excerpt", { required: "Excerpt is required" })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter news excerpt"
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags
                </label>
                <input
                  {...register("tags")}
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content (JSON) *
                </label>
                <textarea
                  {...register("content", { required: "Content is required" })}
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder='[{"type": "text", "content": "Your text content"}, {"type": "image", "images": [{"url": "image-url", "alt": "alt text"}], "imageLayout": "grid"}]'
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Use valid JSON format. Each content item should have type (text/image), content (for text), or images array (for images).
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingNews ? 'Update News' : 'Create News'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
