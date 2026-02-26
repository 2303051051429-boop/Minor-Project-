import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard';
import PostItemModal from '../components/PostItemModal';
import { Search, Plus, LogOut, Activity } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Keys', 'Wallet', 'Other'];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const { data } = await api.get('/items', { params });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  const fetchMetrics = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard/metrics');
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics');
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchMetrics();
  }, [fetchItems, fetchMetrics]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow-lg" style={{ backgroundColor: '#8B2336' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🎓 ParulConnect</h1>
            <p className="text-sm opacity-80">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">Welcome, {user?.name}</span>
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
              <p className="text-sm text-gray-500">Lost Items</p>
              <p className="text-2xl font-bold text-red-600">{metrics.totalLost}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Found Items</p>
              <p className="text-2xl font-bold text-green-600">{metrics.totalFound}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Recovery Rate</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.recoveryRate}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Weekly Growth</p>
              <p className="text-2xl font-bold text-purple-600">
                {metrics.weeklyGrowth > 0 ? '+' : ''}{metrics.weeklyGrowth}%
              </p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search items, buildings, keywords..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition border-none cursor-pointer" style={{ backgroundColor: '#8B2336' }}>
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition border-none cursor-pointer ${
                  category === cat
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={category === cat ? { backgroundColor: '#8B2336' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Post Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity size={20} /> Live Feed
          </h2>
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition border-none cursor-pointer"
            style={{ backgroundColor: '#8B2336' }}
          >
            <Plus size={18} /> Post Item
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg">No items found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or be the first to post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Post Item Modal */}
      {showPostModal && (
        <PostItemModal
          onClose={() => setShowPostModal(false)}
          onCreated={() => { setShowPostModal(false); fetchItems(); fetchMetrics(); }}
        />
      )}
    </div>
  );
}
