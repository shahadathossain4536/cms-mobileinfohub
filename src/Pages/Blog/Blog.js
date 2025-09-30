import React, { useState, useEffect } from "react";
import axios from "../../helpers/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    author: ""
  });

  const token = window.localStorage.getItem("token");
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Fetch blogs data
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...filters
      });

      const response = await axios.get(`blogs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Check if response has the expected structure
      if (response.data && response.data.blogs) {
        setBlogs(response.data.blogs);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalItems(response.data.pagination.totalItems || 0);
          setCurrentPage(response.data.pagination.currentPage || 1);
        } else {
          // Fallback if pagination is missing
          setTotalPages(1);
          setTotalItems(response.data.blogs.length || 0);
          setCurrentPage(1);
        }
      } else {
        // Handle case where response structure is different
        console.log('Unexpected API response structure:', response.data);
        setBlogs(response.data || []);
        setTotalPages(1);
        setTotalItems(response.data?.length || 0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs");
      // Set default values on error
      setBlogs([]);
      setTotalPages(1);
      setTotalItems(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBlogs(page);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Open modal for adding blog
  const openAddModal = () => {
    setEditingBlog(null);
    reset();
    setIsModalOpen(true);
  };

  // Open modal for editing blog
  const openEditModal = (blogItem) => {
    setEditingBlog(blogItem);
    setValue("title", blogItem.title);
    setValue("excerpt", blogItem.excerpt);
    setValue("content", JSON.stringify(blogItem.content, null, 2));
    setValue("image", blogItem.image);
    setValue("category", blogItem.category);
    setValue("author", blogItem.author);
    setValue("readTime", blogItem.readTime);
    setValue("tags", blogItem.tags?.join(", "));
    setValue("status", blogItem.status);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
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

      const blogData = {
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

      if (editingBlog) {
        // Update existing blog
        await axios.put(`blogs/${editingBlog._id}`, blogData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Blog updated successfully");
      } else {
        // Create new blog
        await axios.post("blogs", blogData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Blog created successfully");
      }

      closeModal();
      fetchBlogs(currentPage);
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(editingBlog ? "Failed to update blog" : "Failed to create blog");
    }
  };

  // Handle delete single blog
  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Blog deleted successfully");
      fetchBlogs(currentPage);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  // Handle multiple blog deletion
  const handleDeleteMultiple = async () => {
    if (selectedBlogs.length === 0) {
      toast.error("Please select blogs to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedBlogs.length} selected blogs?`)) return;

    try {
      await axios.delete("blogs", {
        data: { ids: selectedBlogs },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${selectedBlogs.length} blogs deleted successfully`);
      setSelectedBlogs([]);
      setIsSelectAll(false);
      fetchBlogs(currentPage);
    } catch (error) {
      console.error("Error deleting multiple blogs:", error);
      toast.error("Failed to delete selected blogs");
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    setIsSelectAll(checked);
    if (checked) {
      setSelectedBlogs(blogs.map(item => item._id));
    } else {
      setSelectedBlogs([]);
    }
  };

  // Handle individual selection
  const handleSelectBlog = (id, checked) => {
    if (checked) {
      setSelectedBlogs(prev => [...prev, id]);
    } else {
      setSelectedBlogs(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Update select all state when individual selections change
  useEffect(() => {
    if (selectedBlogs.length === blogs.length && blogs.length > 0) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedBlogs, blogs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Blog Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Manage blog articles and publications
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              + Add Blog
            </button>
            {selectedBlogs.length > 0 && (
              <button
                onClick={handleDeleteMultiple}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Selected ({selectedBlogs.length})
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

        {/* Blog List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading blogs...</p>
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
                  <tbody className="divide-y divide-slate-200 dark:border-slate-700">
                    {Array.isArray(blogs) && blogs.length > 0 ? (
                      blogs.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedBlogs.includes(item._id)}
                              onChange={(e) => handleSelectBlog(item._id, e.target.checked)}
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
                                onClick={() => handleDeleteBlog(item._id)}
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
                          {loading ? 'Loading blogs...' : 'No blogs found'}
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
                  {editingBlog ? 'Edit Blog' : 'Add Blog'}
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
                    placeholder="Enter blog title"
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
                  placeholder="Enter blog excerpt"
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
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
