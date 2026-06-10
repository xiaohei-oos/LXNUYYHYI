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

type Tab = 'dashboard' | 'images' | 'upload' | 'categories' | 'orders' | 'dedup';

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
        fetch(`/api/xiaoheiduo9898/images?limit=${IMAGES_PAGE_SIZE}&offset=0`),
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
              const res = await fetch(`/api/xiaoheiduo9898/images?limit=${IMAGES_PAGE_SIZE}&offset=${offset}`);
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
    const res = await fetch(`/api/xiaoheiduo9898/images?id=${id}`, { method: 'DELETE' });
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
      const res = await fetch(`/api/xiaoheiduo9898/images?ids=${ids}`, { method: 'DELETE' });
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
      const res = await fetch('/api/xiaoheiduo9898/dedup');
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
