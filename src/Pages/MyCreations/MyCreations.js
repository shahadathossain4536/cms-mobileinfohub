import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../helpers/axios';
import { toast } from 'react-hot-toast';
import Card, { CardHeader, CardContent } from '../../component/ui/Card';
import Button from '../../component/ui/Button';

const MyCreations = () => {
  const [creations, setCreations] = useState({
    devices: [],
    news: [],
    blogs: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [nextRefresh, setNextRefresh] = useState(new Date(Date.now() + 30000));

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch all user creations
  const fetchCreations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user's devices
      const devicesResponse = await axios.get(
        `devicesData?createdBy=${user._id}`,
        { headers }
      );

      // Fetch user's news
      const newsResponse = await axios.get(
        `news?author=${user.email}`,
        { headers }
      );

      // Fetch user's blogs
      const blogsResponse = await axios.get(
        `blogs?author=${user.email}`,
        { headers }
      );

      setCreations({
        devices: devicesResponse.data || [],
        news: newsResponse.data?.news || newsResponse.data || [],
        blogs: blogsResponse.data?.blogs || blogsResponse.data || []
      });

      setLastRefresh(new Date());
      setNextRefresh(new Date(Date.now() + 30000));

      if (isRefresh) {
        toast.success('Creations refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching creations:', error);
      toast.error('Failed to fetch creations');
      
      // Set empty arrays on error to prevent crashes
      setCreations({
        devices: [],
        news: [],
        blogs: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user._id, user.email]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchCreations();

    const interval = setInterval(() => {
      fetchCreations(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCreations]);

  // Countdown timer for next refresh
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeLeft = Math.max(0, Math.ceil((nextRefresh - now) / 1000));
      
      if (timeLeft === 0) {
        setNextRefresh(new Date(Date.now() + 30000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRefresh]);

  const getTimeLeft = () => {
    const now = new Date();
    const timeLeft = Math.max(0, Math.ceil((nextRefresh - now) / 1000));
    return timeLeft;
  };

  const totalCreations = creations.devices.length + creations.news.length + creations.blogs.length;

  if (loading) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Creations</h2>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-slate-500">Loading...</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with refresh info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My Creations</h2>
              <p className="text-sm text-slate-500">
                Total: {totalCreations} creations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                <span>Next refresh in: </span>
                <span className="font-mono font-semibold text-indigo-600">
                  {getTimeLeft()}s
                </span>
              </div>
              <Button 
                onClick={() => fetchCreations(true)}
                disabled={refreshing}
                className="min-w-[100px]"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  'Refresh Now'
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      {/* Devices Section */}
      <Card>
        <CardHeader>
          <h3 className="text-md font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            Devices ({creations.devices.length})
          </h3>
        </CardHeader>
        <CardContent>
          {creations.devices.length > 0 ? (
            <div className="space-y-3">
              {creations.devices.map((device) => (
                <div key={device._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <h4 className="font-medium">{device.deviceName}</h4>
                    <p className="text-sm text-slate-500">{device.brand}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(device.createdAt || device.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No devices created yet</p>
          )}
        </CardContent>
      </Card>

      {/* News Section */}
      <Card>
        <CardHeader>
          <h3 className="text-md font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            News Articles ({creations.news.length})
          </h3>
        </CardHeader>
        <CardContent>
          {creations.news.length > 0 ? (
            <div className="space-y-3">
              {creations.news.map((article) => (
                <div key={article._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-slate-500">{article.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      article.status === 'published' ? 'bg-green-100 text-green-800' :
                      article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {article.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No news articles created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Blogs Section */}
      <Card>
        <CardHeader>
          <h3 className="text-md font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Blog Posts ({creations.blogs.length})
          </h3>
        </CardHeader>
        <CardContent>
          {creations.blogs.length > 0 ? (
            <div className="space-y-3">
              {creations.blogs.map((blog) => (
                <div key={blog._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <h4 className="font-medium">{blog.title}</h4>
                    <p className="text-sm text-slate-500">{blog.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      blog.status === 'published' ? 'bg-green-100 text-green-800' :
                      blog.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No blog posts created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCreations;
