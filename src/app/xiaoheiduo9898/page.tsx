'use client';

import { useState, useEffect, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  name_cn: string;
  slug: string;
  description: string;
  description_cn: string;
  cover_image: string;
  image_count: number;
  price_cents: number;
  zip_file_key: string;
  zip_file_size: number | null;
  sort_order: number;
}

interface Order {
  id: string;
  email: string;
  category_name: string;
  amount_cents: number;
  status: string;
  download_count: number;
  max_downloads: number;
  created_at: string;
}

interface VisionImage {
  id: string;
  title: string;
  title_cn: string;
  thumbnail_url: string;
  category_id: string;
  categories?: { name: string; name_cn: string; slug: string };
}

type Tab = 'dashboard' | 'images' | 'upload' | 'categories' | 'orders' | 'dedup' | 'blog';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [images, setImages] = useState<VisionImage[]>([]);
  const [imagesPage, setImagesPage] = useState(1);
  const [imagesHasMore, setImagesHasMore] = useState(false);
  const [imagesTotal, setImagesTotal] = useState(0);
  const IMAGES_PAGE_SIZE = 100;
  const [stats, setStats] = useState({ totalImages: 0, totalOrders: 0, totalRevenue: 0, paidOrders: 0, unpaidOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/xiaoheiduo9898/stats', { method: 'GET', credentials: 'include' }).then(res => {
      setAuthenticated(res.ok);
      setAuthChecking(false);
    }).catch(() => {
      setAuthenticated(false);
      setAuthChecking(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/xiaoheiduo9898/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthenticated(true);
      } else {
        setLoginError(data.error || '登录失败');
      }
    } catch {
      setLoginError('网络错误，请重试');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/xiaoheiduo9898/login', { method: 'DELETE', credentials: 'include' });
    setAuthenticated(false);
  };

  // All hooks must be called before any conditional returns
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, orderRes, imgRes, statsRes] = await Promise.all([
        fetch('/api/xiaoheiduo9898/categories', { credentials: 'include' }),
        fetch('/api/xiaoheiduo9898/orders', { credentials: 'include' }),
        fetch(`/api/xiaoheiduo9898/images?limit=${IMAGES_PAGE_SIZE}&offset=0`, { credentials: 'include' }),
        fetch('/api/xiaoheiduo9898/stats', { credentials: 'include' }),
      ]);
      if (catRes.ok) setCategories((await catRes.json()).categories);
      if (orderRes.ok) setOrders((await orderRes.json()).orders);
      if (imgRes.ok) {
        const imgData = (await imgRes.json()).images as VisionImage[];
        // Resolve OSS keys to signed URLs for image thumbnails
        const keys = imgData.map(img => img.thumbnail_url).filter(Boolean);
        if (keys.length > 0) {
          try {
            const resRes = await fetch('/api/resolve-urls', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keys }),
            });
            if (resRes.ok) {
              const { urls } = await resRes.json();
              imgData.forEach((img, i) => {
                if (img.thumbnail_url && urls[i]) {
                  img.thumbnail_url = urls[i];
                }
              });
            }
          } catch (e) {
            console.error('Failed to resolve image URLs:', e);
          }
        }
        setImages(imgData);
        setImagesPage(1);
        setImagesHasMore(imgData.length === IMAGES_PAGE_SIZE);
      }
      if (statsRes.ok) setStats((await statsRes.json()));
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authenticated) fetchData(); }, [authenticated, fetchData]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: '仪表盘', icon: '📊' },
    { key: 'images', label: '图片管理', icon: '🖼️' },
    { key: 'upload', label: '上传图片', icon: '📤' },
    { key: 'dedup', label: '图片去重', icon: '🧹' },
    { key: 'categories', label: '分类管理', icon: '📁' },
    { key: 'blog', label: '文章管理', icon: '📝' },
    { key: 'orders', label: '订单管理', icon: '📦' },
  ];

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-[#1A1A1A] text-lg">验证中...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2 text-center">LXNUYYHYI 后台管理</h1>
          <p className="text-gray-500 text-center mb-6">请输入账号密码登录</p>
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{loginError}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8956C] bg-white"
                placeholder="请输入用户名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8956C] bg-white"
                placeholder="请输入密码"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loginLoading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900 tracking-wider">LXNUYYHYI</span>
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">管理后台</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">退出登录</button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <>
            {tab === 'dashboard' && <DashboardTab stats={stats} categories={categories} />}
            {tab === 'images' && <ImagesTab images={images} categories={categories} onRefresh={fetchData} hasMore={imagesHasMore} onLoadMore={async () => {
              const nextPage = imagesPage + 1;
              const offset = nextPage * IMAGES_PAGE_SIZE;
              const res = await fetch(`/api/xiaoheiduo9898/images?limit=${IMAGES_PAGE_SIZE}&offset=${offset}`, { credentials: 'include' });
              if (res.ok) {
                const data = await res.json();
                const newImgs = data.images as VisionImage[];
                // Resolve URLs
                const keys = newImgs.map(img => img.thumbnail_url).filter(Boolean);
                if (keys.length > 0) {
                  try {
                    const resRes = await fetch('/api/resolve-urls', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ keys }),
                    });
                    if (resRes.ok) {
                      const { urls } = await resRes.json();
                      newImgs.forEach((img, i) => {
                        if (img.thumbnail_url && urls[i]) img.thumbnail_url = urls[i];
                      });
                    }
                  } catch (e) { console.error(e); }
                }
                setImages(prev => [...prev, ...newImgs]);
                setImagesPage(nextPage);
                setImagesHasMore(newImgs.length === IMAGES_PAGE_SIZE);
              }
            }} />}
            {tab === 'upload' && <UploadTab categories={categories} onRefresh={fetchData} />}
            {tab === 'dedup' && <DedupTab categories={categories} onRefresh={fetchData} />}
            {tab === 'categories' && <CategoriesTab categories={categories} onRefresh={fetchData} />}
            {tab === 'orders' && <OrdersTab orders={orders} />}
            {tab === 'blog' && <BlogTab />}
          </>
        )}
      </main>
    </div>
  );
}

function DashboardTab({ stats, categories }: { stats: { totalImages: number; totalOrders: number; totalRevenue: number; paidOrders: number; unpaidOrders: number }; categories: Category[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">数据概览</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="图片总数" value={stats.totalImages} icon="🖼️" />
        <StatCard label="分类数" value={categories.length} icon="📁" />
        <StatCard label="已支付订单" value={stats.paidOrders} icon="✅" />
        <StatCard label="未支付订单" value={stats.unpaidOrders} icon="⏳" />
        <StatCard label="总收入" value={`$${(stats.totalRevenue / 100).toFixed(2)}`} icon="💰" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">各分类概览</h3>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">分类名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">图片数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">价格</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">ZIP状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{cat.name_cn}</div>
                  <div className="text-xs text-gray-500">{cat.name}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{cat.image_count}</td>
                <td className="px-4 py-3 text-gray-600">${(cat.price_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {cat.zip_file_key ? (
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full w-fit">已打包</span>
                      {cat.zip_file_size != null && cat.zip_file_size > 0 && (
                        <span className="text-xs text-gray-500">
                          {cat.zip_file_size >= 1073741824
                            ? `${(cat.zip_file_size / 1073741824).toFixed(2)} GB`
                            : cat.zip_file_size >= 1048576
                            ? `${(cat.zip_file_size / 1048576).toFixed(1)} MB`
                            : `${(cat.zip_file_size / 1024).toFixed(0)} KB`}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">未打包</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function ImagesTab({ images, categories, onRefresh, hasMore, onLoadMore }: { images: VisionImage[]; categories: Category[]; onRefresh: () => void; hasMore: boolean; onLoadMore: () => void }) {
  const [filterCat, setFilterCat] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const filtered = filterCat ? images.filter(i => i.category_id === filterCat) : images;
  const catMap = new Map(categories.map(c => [c.id, c]));

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这张图片吗？')) return;
    const res = await fetch(`/api/xiaoheiduo9898/images?id=${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) onRefresh();
    else alert('删除失败');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 张图片吗？\n\n此操作将同时删除 OSS 服务器上的图片文件，不可撤销！`)) return;

    setBatchDeleting(true);
    try {
      const ids = Array.from(selectedIds).join(',');
      const res = await fetch(`/api/xiaoheiduo9898/images?ids=${ids}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || `已删除 ${selectedIds.size} 张图片`);
        setSelectedIds(new Set());
        onRefresh();
      } else {
        const data = await res.json();
        alert(`删除失败: ${data.error}`);
      }
    } catch {
      alert('删除失败，网络错误');
    } finally {
      setBatchDeleting(false);
    }
  };

  const exitSelectMode = () => {
    setSelectedIds(new Set());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">图片管理</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setSelectedIds(new Set()); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
          >
            <option value="">全部分类</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_cn}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">共 {filtered.length} 张</span>

          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-blue-600 font-medium">已选 {selectedIds.size} 张</span>
              <button
                onClick={handleBatchDelete}
                disabled={batchDeleting}
                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {batchDeleting ? '删除中...' : `删除选中 (${selectedIds.size})`}
              </button>
              <button
                onClick={exitSelectMode}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消选择
              </button>
            </>
          )}
        </div>
      </div>

      {/* Select all bar */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filtered.length > 0 && selectedIds.size === filtered.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          全选当前列表
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(img => {
          const cat = catMap.get(img.category_id);
          const isSelected = selectedIds.has(img.id);
          return (
            <div
              key={img.id}
              className={`bg-white rounded-xl border-2 overflow-hidden group cursor-pointer transition-colors ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSelect(img.id)}
            >
              <div className="aspect-[4/3] relative">
                <img src={img.thumbnail_url} alt={img.title} className="w-full h-full object-cover" />
                {/* Selection checkbox overlay */}
                <div className="absolute top-2 left-2">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/80 border-gray-400 group-hover:border-blue-400'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3" onClick={e => e.stopPropagation()}>
                <p className="text-sm font-medium text-gray-900 truncate">{img.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{cat?.name_cn || '未知分类'}</p>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">暂无图片</div>
      )}

      {hasMore && filtered.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 text-sm bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Blog Management Tab
// ============================================================

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  meta_keywords: string[] | null;
  cover_image: string | null;
  content: string;
  category: string;
  tags: string[] | null;
  status: string;
  author: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  rejected_reason: string | null;
  reviewed_at: string | null;
}

const BLOG_CATEGORIES = [
  { value: 'guides', label: '教程指南' },
  { value: 'tips', label: '技巧方法' },
  { value: 'inspiration', label: '灵感故事' },
  { value: 'wealth', label: '财富' },
  { value: 'travel', label: '旅行' },
  { value: 'fitness', label: '健身' },
  { value: 'career', label: '职业' },
  { value: 'self-love', label: '自爱' },
  { value: 'family', label: '家庭' },
  { value: 'home', label: '居家' },
  { value: 'spiritual', label: '灵性' },
];

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Auto-publish settings
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(false);
  const [autoPublishInterval, setAutoPublishInterval] = useState(24);
  const [autoPublishCount, setAutoPublishCount] = useState(1);
  const [lastAutoPublishAt, setLastAutoPublishAt] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formMetaDescription, setFormMetaDescription] = useState('');
  const [formMetaKeywords, setFormMetaKeywords] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('guides');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState('draft');
  const [formAuthor, setFormAuthor] = useState('LXNUYYHYI');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    params.set('pageSize', '50');
    const res = await fetch(`/api/xiaoheiduo9898/blog?${params}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Fetch auto-publish settings
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/xiaoheiduo9898/blog-settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAutoPublishEnabled(data.auto_publish_enabled ?? false);
        setAutoPublishInterval(data.auto_publish_interval_hours ?? 24);
        setAutoPublishCount(data.auto_publish_count ?? 1);
        setLastAutoPublishAt(data.last_auto_publish_at);
      }
    } catch { /* ignore */ }
    setSettingsLoading(false);
  }, []);

  // Fetch pending count
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch('/api/xiaoheiduo9898/blog?status=pending&pageSize=1', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.total || 0);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchSettings(); fetchPendingCount(); }, [fetchSettings, fetchPendingCount]);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/xiaoheiduo9898/blog-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          auto_publish_enabled: autoPublishEnabled,
          auto_publish_interval_hours: autoPublishInterval,
          auto_publish_count: autoPublishCount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastAutoPublishAt(data.last_auto_publish_at);
        alert('设置已保存');
      } else {
        const data = await res.json();
        alert(data.error || 'Save failed');
      }
    } catch {
      alert('Network error');
    }
    setSettingsSaving(false);
  };

  const handleApprove = async (post: BlogPost) => {
    const res = await fetch(`/api/xiaoheiduo9898/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
      credentials: 'include',
    });
    if (res.ok) { fetchPosts(); fetchPendingCount(); }
  };

  const handleReject = async (post: BlogPost) => {
    const reason = rejectReason.trim() || 'Content needs revision';
    const res = await fetch(`/api/xiaoheiduo9898/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft', rejected_reason: reason }),
      credentials: 'include',
    });
    if (res.ok) {
      setRejectingId(null);
      setRejectReason('');
      fetchPosts();
      fetchPendingCount();
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormSlug('');
    setFormMetaDescription('');
    setFormMetaKeywords('');
    setFormCoverImage('');
    setFormContent('');
    setFormCategory('guides');
    setFormTags('');
    setFormStatus('draft');
    setFormAuthor('LXNUYYHYI');
  };

  const startCreate = () => {
    resetForm();
    setEditingPost(null);
    setIsCreating(true);
  };

  const startEdit = (post: BlogPost) => {
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormMetaDescription(post.meta_description || '');
    setFormMetaKeywords((post.meta_keywords || []).join(', '));
    setFormCoverImage(post.cover_image || '');
    setFormContent(post.content);
    setFormCategory(post.category);
    setFormTags((post.tags || []).join(', '));
    setFormStatus(post.status);
    setFormAuthor(post.author);
    setEditingPost(post);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formSlug.trim()) {
      alert('标题和 Slug 不能为空');
      return;
    }
    setSaving(true);

    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
      meta_description: formMetaDescription.trim() || null,
      meta_keywords: formMetaKeywords.split(',').map(k => k.trim()).filter(Boolean),
      cover_image: formCoverImage.trim() || null,
      content: formContent,
      category: formCategory,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      status: formStatus,
      author: formAuthor.trim() || 'LXNUYYHYI',
    };

    try {
      let res: Response;
      if (editingPost) {
        res = await fetch(`/api/xiaoheiduo9898/blog/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/xiaoheiduo9898/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsCreating(false);
        setEditingPost(null);
        resetForm();
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || 'Save failed');
      }
    } catch {
      alert('Network error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    const res = await fetch(`/api/xiaoheiduo9898/blog/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) fetchPosts();
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/xiaoheiduo9898/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { fetchPosts(); fetchPendingCount(); }
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setFormTitle(value);
    if (!editingPost) {
      setFormSlug(value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{editingPost ? '编辑文章' : '新建文章'}</h2>
          <button onClick={() => { setIsCreating(false); setEditingPost(null); }} className="text-sm text-gray-500 hover:text-gray-700">← 返回列表</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">文章标题 *</label>
              <input type="text" value={formTitle} onChange={e => handleTitleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter article title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
              <input type="text" value={formSlug} onChange={e => setFormSlug(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" placeholder="how-to-create-vision-board" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">文章内容 (Markdown)</label>
              <textarea value={formContent} onChange={e => setFormContent(e.target.value)} rows={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" placeholder="Write your article content in Markdown..." />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-900">发布设置</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="draft">草稿</option>
                  <option value="pending">待审核</option>
                  <option value="published">已发布</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {BLOG_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                <input type="text" value={formAuthor} onChange={e => setFormAuthor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-900">SEO 设置</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea value={formMetaDescription} onChange={e => setFormMetaDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="SEO description (max 160 chars)" maxLength={160} />
                <p className="text-xs text-gray-400 mt-1">{formMetaDescription.length}/160</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords (逗号分隔)</label>
                <input type="text" value={formMetaKeywords} onChange={e => setFormMetaKeywords(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="vision board, manifestation, law of attraction" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (逗号分隔)</label>
                <input type="text" value={formTags} onChange={e => setFormTags(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="vision board, DIY, print" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-900">封面图片</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input type="text" value={formCoverImage} onChange={e => setFormCoverImage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
              </div>
              {formCoverImage && (
                <img src={formCoverImage} alt="Cover preview" className="w-full h-32 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? '保存中...' : (editingPost ? '更新文章' : '创建文章')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">文章管理</h2>
          <span className="text-sm text-gray-500">共 {total} 篇</span>
        </div>
        <button onClick={startCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          + 新建文章
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 text-sm rounded-lg ${!filterStatus ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>全部</button>
        <button onClick={() => setFilterStatus('pending')} className={`px-3 py-1.5 text-sm rounded-lg ${filterStatus === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>待审核 {pendingCount > 0 ? `(${pendingCount})` : ''}</button>
        <button onClick={() => setFilterStatus('published')} className={`px-3 py-1.5 text-sm rounded-lg ${filterStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>已发布</button>
        <button onClick={() => setFilterStatus('draft')} className={`px-3 py-1.5 text-sm rounded-lg ${filterStatus === 'draft' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>草稿</button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无文章，点击「新建文章」开始创作</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">标题</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">分类</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">发布时间</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{post.title}</div>
                    <div className="text-xs text-gray-400 font-mono">/blog/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {BLOG_CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                      post.status === 'published' ? 'bg-green-100 text-green-700' :
                      post.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {post.status === 'published' ? '已发布' : post.status === 'pending' ? '待审核' : '草稿'}
                    </span>
                    {post.rejected_reason && post.status === 'draft' && (
                      <div className="text-xs text-red-500 mt-1" title={post.rejected_reason}>退回: {post.rejected_reason.slice(0, 30)}{post.rejected_reason.length > 30 ? '...' : ''}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(post)} className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100">通过</button>
                          {rejectingId === post.id ? (
                            <div className="flex items-center gap-1">
                              <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="退回原因..." className="text-xs px-2 py-1 border rounded w-28" />
                              <button onClick={() => handleReject(post)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">确认</button>
                              <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="text-xs px-1 py-1 text-gray-400 hover:text-gray-600">X</button>
                            </div>
                          ) : (
                            <button onClick={() => setRejectingId(post.id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">退回</button>
                          )}
                        </>
                      ) : (
                        <button onClick={() => handleTogglePublish(post)} className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-gray-600">
                          {post.status === 'published' ? '取消发布' : '发布'}
                        </button>
                      )}
                      <button onClick={() => startEdit(post)} className="text-xs px-2 py-1 rounded hover:bg-blue-50 text-blue-600">编辑</button>
                      <button onClick={() => handleDelete(post.id)} className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-600">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Auto Publish Settings */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-700 mb-3">定时自动发布设置</h4>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoPublishEnabled} onChange={e => setAutoPublishEnabled(e.target.checked)} className="rounded" />
            <span className="text-sm">启用自动发布</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            每隔
            <input type="number" min="1" max="720" value={autoPublishInterval} onChange={e => setAutoPublishInterval(Number(e.target.value))} className="w-16 px-2 py-1 border rounded text-center" />
            小时
          </label>
          <label className="flex items-center gap-2 text-sm">
            每次发布
            <input type="number" min="1" max="10" value={autoPublishCount} onChange={e => setAutoPublishCount(Number(e.target.value))} className="w-16 px-2 py-1 border rounded text-center" />
            篇
          </label>
          <button onClick={handleSaveSettings} disabled={settingsSaving} className="px-3 py-1 bg-[#1A1A1A] text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50">
            {settingsSaving ? '保存中...' : '保存设置'}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {lastAutoPublishAt ? `上次自动发布: ${new Date(lastAutoPublishAt).toLocaleString('zh-CN')}` : '尚未自动发布过'}
          {' | '}
          待审核文章: {posts.filter(p => p.status === 'pending').length} 篇
        </div>
      </div>
    </div>
  );
}
function UploadTab({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [selectedCat, setSelectedCat] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Array<{ name: string; status: string; percent: number }>>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !selectedCat) {
      alert('请先选择分类');
      return;
    }

    setUploading(true);
    const cat = categories.find(c => c.id === selectedCat);
    const newProgress = Array.from(files).map(f => ({ name: f.name, status: '等待中', percent: 0 }));
    setProgress(newProgress);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: '上传中', percent: 10 } : p));

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', selectedCat);
        formData.append('categorySlug', cat?.slug || '');
        formData.append('title', file.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' '));
        formData.append('titleCn', '');

        setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, percent: 30 } : p));

        const res = await fetch('/api/xiaoheiduo9898/images/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (res.ok) {
          setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: '完成', percent: 100 } : p));
        } else {
          const data = await res.json();
          setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: `失败: ${data.error}`, percent: 0 } : p));
        }
      } catch {
        setProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: '失败', percent: 0 } : p));
      }
    }

    setUploading(false);
    onRefresh();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">上传图片</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择分类</label>
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="w-full sm:w-64 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="">-- 请选择分类 --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_cn} ({c.name})</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择图片（支持多选）</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading || !selectedCat}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${uploading || !selectedCat ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-4xl mb-3">📂</div>
              <p className="text-sm text-gray-600">
                {selectedCat ? '点击选择图片或拖拽到此处' : '请先选择分类'}
              </p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG/PNG，单张最大 50MB</p>
            </label>
          </div>
        </div>

        {progress.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">上传列表</h3>
            <div className="space-y-2">
              {progress.map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-4">
                    {p.status === '完成' ? '✅' : p.status === '失败' ? '❌' : p.status === '上传中' ? '⏳' : '⏸️'}
                  </span>
                  <span className="flex-1 truncate text-gray-700">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === '完成' ? 'bg-green-100 text-green-700' :
                    p.status === '失败' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {p.status}
                  </span>
                  {p.percent > 0 && p.percent < 100 && (
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.percent}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoriesTab({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [uploadingZip, setUploadingZip] = useState<string | null>(null);

  const handleSavePrice = async (id: string) => {
    const priceDollars = parseFloat(editPrice);
    if (isNaN(priceDollars) || priceDollars <= 0) {
      alert('请输入有效价格');
      return;
    }
    const res = await fetch('/api/xiaoheiduo9898/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, price_cents: Math.round(priceDollars * 100) }),
    });
    if (res.ok) {
      setEditingId(null);
      onRefresh();
    } else {
      alert('保存失败');
    }
  };

  const handleUploadZip = async (catId: string, catName: string, catSlug: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (!file.name.endsWith('.zip')) {
        alert('请选择 ZIP 文件');
        return;
      }
      setUploadingZip(catId);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', catId);
        const res = await fetch('/api/xiaoheiduo9898/packages/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert(data.message);
          onRefresh();
        } else {
          alert('上传失败: ' + (data.error || '未知错误'));
        }
      } catch {
        alert('上传失败，请重试');
      } finally {
        setUploadingZip(null);
      }
    };
    input.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">分类管理</h2>
        <p className="text-sm text-gray-500">每个分类需上传对应的 ZIP 压缩包，用户购买后才能下载</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">中文名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">英文名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">图片数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">价格</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">ZIP</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name_cn}</td>
                <td className="px-4 py-3 text-gray-600">{cat.name}</td>
                <td className="px-4 py-3 text-gray-600">{cat.image_count}</td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button onClick={() => handleSavePrice(cat.id)} className="text-xs text-blue-600 hover:underline">保存</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:underline">取消</button>
                    </div>
                  ) : (
                    <span className="text-gray-600">${(cat.price_cents / 100).toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {cat.zip_file_key ? (
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full w-fit">已打包</span>
                      {cat.zip_file_size != null && cat.zip_file_size > 0 && (
                        <span className="text-xs text-gray-500">
                          {cat.zip_file_size >= 1073741824
                            ? `${(cat.zip_file_size / 1073741824).toFixed(2)} GB`
                            : cat.zip_file_size >= 1048576
                            ? `${(cat.zip_file_size / 1048576).toFixed(1)} MB`
                            : `${(cat.zip_file_size / 1024).toFixed(0)} KB`}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">未打包</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditPrice((cat.price_cents / 100).toFixed(2)); }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      改价格
                    </button>
                    <button
                      onClick={() => handleUploadZip(cat.id, cat.name_cn || cat.name, cat.slug)}
                      disabled={uploadingZip === cat.id}
                      className="text-xs text-green-600 hover:underline disabled:text-gray-400"
                    >
                      {uploadingZip === cat.id ? '上传中...' : cat.zip_file_key ? '重新上传ZIP' : '上传ZIP'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">订单管理</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          暂无订单
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">订单ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">邮箱</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">分类</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">金额</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">下载次数</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-gray-600">{order.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{order.category_name}</td>
                  <td className="px-4 py-3 text-gray-600">${(order.amount_cents / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.download_count}/{order.max_downloads}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface DuplicateGroup {
  title: string;
  categoryName: string;
  categoryNameCn: string;
  categoryId: string;
  keepId: string;
  duplicateIds: string[];
  duplicateCount: number;
}

function DedupTab({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [deduping, setDeduping] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [totalDuplicates, setTotalDuplicates] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('');

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      const res = await fetch('/api/xiaoheiduo9898/dedup', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDuplicateGroups(data.duplicateGroups || []);
        setTotalDuplicates(data.totalDuplicates || 0);
        setTotalGroups(data.totalGroups || 0);
        setScanned(true);
      } else {
        const data = await res.json();
        setResult(`扫描失败: ${data.error}`);
      }
    } catch {
      setResult('扫描失败，网络错误');
    } finally {
      setScanning(false);
    }
  };

  const handleDedup = async () => {
    if (!confirm(`确定要删除 ${totalDuplicates} 条重复图片吗？\n\n操作将：\n1. 从数据库删除重复记录（保留每组最早的一条）\n2. 从 OSS 服务器删除对应的图片文件\n\n此操作不可撤销！`)) {
      return;
    }

    setDeduping(true);
    setResult(null);
    try {
      const body: { categoryIds?: string[] } = {};
      if (filterCat) {
        body.categoryIds = [filterCat];
      }
      const res = await fetch('/api/xiaoheiduo9898/dedup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.message);
        setDuplicateGroups([]);
        setTotalDuplicates(0);
        setTotalGroups(0);
        setScanned(false);
        onRefresh();
      } else {
        const data = await res.json();
        setResult(`去重失败: ${data.error}`);
      }
    } catch {
      setResult('去重失败，网络错误');
    } finally {
      setDeduping(false);
    }
  };

  // Filter duplicate groups by category
  const filteredGroups = filterCat
    ? duplicateGroups.filter(g => g.categoryId === filterCat)
    : duplicateGroups;
  const filteredTotal = filteredGroups.reduce((sum, g) => sum + g.duplicateCount, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">图片去重</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-600 mb-4">
          扫描数据库中相同分类下相同标题的重复图片，保留每组最早的一条记录，删除其余重复项。
          删除时会同时清理 OSS 服务器上对应的图片文件。
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
          >
            <option value="">全部分类</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_cn}</option>
            ))}
          </select>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {scanning ? '扫描中...' : '扫描重复图片'}
          </button>

          {scanned && totalDuplicates > 0 && (
            <button
              onClick={handleDedup}
              disabled={deduping}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deduping ? '去重中...' : `一键去重（${filterCat ? filteredTotal : totalDuplicates} 条）`}
            </button>
          )}
        </div>

        {result && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm ${
            result.includes('失败') ? 'bg-red-50 border border-red-200 text-red-600' :
            'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {result}
          </div>
        )}
      </div>

      {scanned && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">重复图片详情</h3>
            <span className="text-sm text-gray-500">
              共 {filteredGroups.length} 组重复，{filteredTotal} 条多余记录
            </span>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {totalDuplicates === 0 ? '没有发现重复图片，数据很干净！' : '该分类下没有重复图片'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">图片标题</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">所属分类</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">重复数量</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">保留记录</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">删除记录</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGroups.map((group, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-gray-900 truncate max-w-[200px]">{group.title}</td>
                      <td className="px-4 py-2 text-gray-600">{group.categoryNameCn}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                          {group.duplicateCount} 条重复
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500 font-mono text-xs">{group.keepId.slice(0, 8)}...</td>
                      <td className="px-4 py-2 text-gray-400 font-mono text-xs">
                        {group.duplicateIds.slice(0, 2).map(id => id.slice(0, 8)).join(', ')}
                        {group.duplicateIds.length > 2 ? ` 等${group.duplicateIds.length}条` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
