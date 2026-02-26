import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, CheckCircle, Shield, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, recentRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/dashboard/recent'),
      ]);
      setMetrics(metricsRes.data);
      setRecentItems(recentRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = async (itemId) => {
    try {
      await api.patch(`/items/${itemId}/resolve`);
      fetchData();
    } catch (err) {
      console.error('Failed to resolve item');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const categoryChartData = metrics?.categoryStats?.map((s) => ({
    name: s._id,
    count: s.count,
  })) || [];

  const statusColor = (status) => {
    switch (status) {
      case 'Lost': return 'bg-red-100 text-red-700';
      case 'Found': return 'bg-green-100 text-green-700';
      case 'Resolved': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow-lg" style={{ backgroundColor: '#8B2336' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🎓 ParulConnect</h1>
            <p className="text-sm opacity-80">Admin Console</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-xs">
              <Shield size={12} /> PU System Online
            </span>
            <button onClick={handleLogout} className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg text-sm hover:bg-white/30 transition border-none text-white cursor-pointer">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Active Items</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.activeItems}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{metrics.totalResolved}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Recovery Rate</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.recoveryRate}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">System Health</p>
              <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                <Shield size={18} /> Online
              </p>
            </div>
          </div>
        )}

        {/* Category Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Activity by Category
          </h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B2336" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-8">No category data available</p>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Recent Reports</h3>
          </div>
          {recentItems.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No reports yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentItems.map((item) => (
                <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {item.category} · {item.location} · Reported by {item.reportedBy?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {item.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolve(item._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition border-none cursor-pointer"
                    >
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
