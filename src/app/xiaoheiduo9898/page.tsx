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

type Tab = 'dashboard' | 'images' | 'upload' | 'categories' | 'orders';

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
  const [stats, setStats] = useState({ totalImages: 0, totalOrders: 0, totalRevenue: 0, paidOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/xiaoheiduo9898/stats', { method: 'GET' }).then(res => {
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
    await fetch('/api/xiaoheiduo9898/login', { method: 'DELETE' });
    setAuthenticated(false);
  };

  // All hooks must be called before any conditional returns
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, orderRes, imgRes, statsRes] = await Promise.all([
        fetch('/api/xiaoheiduo9898/categories'),
        fetch('/api/xiaoheiduo9898/orders'),
        fetch('/api/xiaoheiduo9898/images?limit=50'),
        fetch('/api/xiaoheiduo9898/stats'),
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
    { key: 'categories', label: '分类管理', icon: '📁' },
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
            {tab === 'images' && <ImagesTab images={images} categories={categories} onRefresh={fetchData} />}
            {tab === 'upload' && <UploadTab categories={categories} onRefresh={fetchData} />}
            {tab === 'categories' && <CategoriesTab categories={categories} onRefresh={fetchData} />}
            {tab === 'orders' && <OrdersTab orders={orders} />}
          </>
        )}
      </main>
    </div>
  );
}

function DashboardTab({ stats, categories }: { stats: { totalImages: number; totalOrders: number; totalRevenue: number; paidOrders: number }; categories: Category[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">数据概览</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="图片总数" value={stats.totalImages} icon="🖼️" />
        <StatCard label="分类数" value={categories.length} icon="📁" />
        <StatCard label="订单总数" value={stats.totalOrders} icon="📦" />
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
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">已打包</span>
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

function ImagesTab({ images, categories, onRefresh }: { images: VisionImage[]; categories: Category[]; onRefresh: () => void }) {
  const [filterCat, setFilterCat] = useState('');
  const filtered = filterCat ? images.filter(i => i.category_id === filterCat) : images;
  const catMap = new Map(categories.map(c => [c.id, c]));

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这张图片吗？')) return;
    const res = await fetch(`/api/xiaoheiduo9898/images?id=${id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
    else alert('删除失败');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">图片管理</h2>
        <div className="flex items-center gap-3">
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
          <span className="text-sm text-gray-500">共 {filtered.length} 张</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(img => {
          const cat = catMap.get(img.category_id);
          return (
            <div key={img.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
              <div className="aspect-[4/3] relative">
                <img src={img.thumbnail_url} alt={img.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
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

  const handleSavePrice = async (id: string) => {
    const priceDollars = parseFloat(editPrice);
    if (isNaN(priceDollars) || priceDollars <= 0) {
      alert('请输入有效价格');
      return;
    }
    const res = await fetch('/api/xiaoheiduo9898/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, price_cents: Math.round(priceDollars * 100) }),
    });
    if (res.ok) {
      setEditingId(null);
      onRefresh();
    } else {
      alert('保存失败');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">分类管理</h2>
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
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">已打包</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">未打包</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { setEditingId(cat.id); setEditPrice((cat.price_cents / 100).toFixed(2)); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    改价格
                  </button>
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
