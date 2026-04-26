import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Search, Star, Plus, Crosshair, FileText, Users, ChevronUp, ExternalLink, Menu, X, Settings, LogOut } from 'lucide-react';
import { fetchItems, fetchFeedback, fetchAnalytics, toggleUpvote, getUserProfile, fetchCurrentUser, logoutUser, type Item, type Category, type FeedbackEntry, type AnalyticsData, type AuthUser, getAvgRating, timeAgo, SESSION_ID } from './lib/store';
import { ItemDetail } from './components/ItemDetail';
import { SubmitForm } from './components/SubmitForm';
import { UserProfilePanel } from './components/UserProfile';
import { FeedbackPage } from './components/FeedbackPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { SettingsPanel } from './components/SettingsPanel';
import { LoginPage } from './components/LoginPage';

const CATEGORIES: Category[] = ['All', 'Products', 'Services', 'Ideas', 'Projects', 'Tools', 'Players'];

const catColor: Record<string, string> = {
  Products: 'bg-blue-50 text-blue-600', Services: 'bg-emerald-50 text-emerald-600',
  Ideas: 'bg-amber-50 text-amber-600', Projects: 'bg-rose-50 text-rose-600', Tools: 'bg-violet-50 text-violet-600',
  Players: 'bg-red-50 text-red-600',
};

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState('listings');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status
  useEffect(() => {
    fetchCurrentUser().then(({ authenticated, user }) => {
      if (authenticated && user) setAuthUser(user);
      setAuthChecked(true);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setAuthUser(null);
    window.location.reload();
  };

  // Load items
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadItems(); }, [loadItems]);

  // Load feedback when page switches
  useEffect(() => {
    if (page === 'feedback') {
      fetchFeedback().then(setFeedbackData).catch(console.error);
    }
    if (page === 'analytics') {
      fetchAnalytics().then(setAnalyticsData).catch(console.error);
    }
  }, [page]);

  const filtered = useMemo(() => {
    let list = items;
    if (activeCategory !== 'All') list = list.filter(i => i.category === activeCategory);
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); list = list.filter(i => i.name.toLowerCase().includes(q) || i.tagline.toLowerCase().includes(q)); }
    return list.sort((a, b) => b.upvotes - a.upvotes);
  }, [items, activeCategory, searchQuery]);

  const selectedItem = selectedItemId ? items.find(i => i._id === selectedItemId) : null;
  const totalFeedback = items.reduce((s, i) => s + i.ratings.length, 0);
  const totalUpvotes = items.reduce((s, i) => s + i.upvotes, 0);

  const handleUpvote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const updated = await toggleUpvote(id);
      setItems(prev => prev.map(i => i._id === id ? updated : i));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleNavClick = (newPage: string) => {
    setPage(newPage);
    setSelectedItemId(null);
    setMobileMenuOpen(false);
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#00BFA6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7B8190] mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!authUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 h-screen z-50 lg:z-auto w-[220px] bg-white border-r border-[#E8ECF0] flex flex-col flex-shrink-0 overflow-y-auto transition-transform duration-300`}>
        <div className="px-4 py-4 flex items-center justify-between border-b border-[#E8ECF0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00BFA6] to-[#00897B] flex items-center justify-center"><span className="text-white text-[10px] tracking-tighter">⭐⭐⭐</span></div>
            <span className="text-sm font-extrabold text-[#1E1E2D]">RateMyStuff</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded cursor-pointer">
            <X className="w-4 h-4 text-[#7B8190]" />
          </button>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          <div className="section-title">DISCOVERY</div>
          <button onClick={() => handleNavClick('listings')} className={`sidebar-item ${page === 'listings' ? 'active' : ''}`}>
            <Crosshair className="w-4 h-4" /> Browse All
          </button>
          <button onClick={() => handleNavClick('feedback')} className={`sidebar-item ${page === 'feedback' ? 'active' : ''}`}>
            <FileText className="w-4 h-4" /> Feedback
          </button>
          <button onClick={() => handleNavClick('analytics')} className={`sidebar-item ${page === 'analytics' ? 'active' : ''}`}>
            <BarChart3 className="w-4 h-4" /> Analytics
          </button>
          <div className="section-title mt-4">MANAGE</div>
          <button onClick={() => { setShowSubmit(true); setMobileMenuOpen(false); }} className="sidebar-item"><Plus className="w-4 h-4" /> Submit New</button>
          <button onClick={() => { setShowProfile(true); setMobileMenuOpen(false); }} className="sidebar-item"><Users className="w-4 h-4" /> My Activity</button>
          <button onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }} className="sidebar-item"><Settings className="w-4 h-4" /> Settings</button>
        </nav>
        <div className="p-3 border-t border-[#E8ECF0]">
          <div className="bg-[#F4F5F7] rounded-lg p-3 mb-2">
            <p className="text-[9px] font-bold text-[#00BFA6] uppercase tracking-wider">Platform Stats</p>
            <p className="text-lg font-extrabold text-[#1E1E2D]">{totalUpvotes} <span className="text-xs font-bold text-[#7B8190]">upvotes</span></p>
            <p className="text-[10px] text-[#7B8190]">{totalFeedback} reviews · {items.length} listings</p>
          </div>
          {authUser ? (
            <div className="space-y-1">
              <button onClick={() => { setShowProfile(true); setMobileMenuOpen(false); }} className="sidebar-item w-full">
                {authUser.avatar ? (
                  <img src={authUser.avatar} alt={authUser.name} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00BFA6] to-[#00897B] flex items-center justify-center text-white text-[10px] font-bold">{authUser.name[0]?.toUpperCase()}</div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#1E1E2D] truncate block">{authUser.name}</span>
                  <span className="text-[9px] text-[#B0B7C3] flex items-center gap-1">
                    🔵 Google
                  </span>
                </div>
              </button>
              <button onClick={handleLogout} className="sidebar-item w-full text-[#EB5757] hover:bg-[#EB5757]/5">
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-xs">Sign Out</span>
              </button>
            </div>
          ) : (
            <a href="/auth/google" className="sidebar-item w-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F2994A] to-[#EB5757] flex items-center justify-center text-white text-sm">{getUserProfile().avatar || '⚡'}</div>
              <span className="text-xs font-semibold text-[#00BFA6]">Sign In</span>
            </a>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[56px] bg-white border-b border-[#E8ECF0] flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
              <Menu className="w-5 h-5 text-[#7B8190]" />
            </button>
            <div>
              <h1 className="text-sm font-extrabold text-[#1E1E2D]">
                {page === 'listings' ? 'Discover & Rate' : page === 'feedback' ? 'Feedback History' : page === 'analytics' ? 'Platform Analytics' : 'RateMyStuff'}
              </h1>
              <p className="text-[10px] text-[#7B8190] hidden sm:block">
                {page === 'listings' ? 'Rate anything — products, players, tools & more' : page === 'feedback' ? 'All user reviews and ratings' : page === 'analytics' ? 'Platform performance & insights' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B7C3]" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search listings..." className="w-40 md:w-52 pl-9 pr-3 py-2 text-xs" />
            </div>
            <button onClick={() => setShowSubmit(true)}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-[#00BFA6] text-white text-xs font-bold rounded-lg hover:bg-[#00A693] transition cursor-pointer">
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> <span className="hidden sm:inline">Submit</span>
            </button>
          </div>
        </header>

        {/* ── Mobile Search Bar ── */}
        <div className="sm:hidden px-4 py-2 bg-white border-b border-[#E8ECF0]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B7C3]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search listings..." className="w-full pl-9 pr-3 py-2 text-xs" />
          </div>
        </div>

        <main className="flex-1 p-3 md:p-5 overflow-auto">
          {/* ── Feedback Page ── */}
          {page === 'feedback' && !selectedItem && (
            <FeedbackPage feedback={feedbackData} onSelectItem={(id) => { setSelectedItemId(id); setPage('listings'); }} />
          )}

          {/* ── Analytics Page ── */}
          {page === 'analytics' && !selectedItem && (
            <AnalyticsPage data={analyticsData} onSelectItem={(id) => { setSelectedItemId(id); setPage('listings'); }} />
          )}

          {/* ── Listings / Detail ── */}
          {(page === 'listings' || selectedItem) && (
            selectedItem ? (
              <ItemDetail item={selectedItem} onBack={() => setSelectedItemId(null)} onUpdate={(updated) => setItems(prev => prev.map(i => i._id === updated._id ? updated : i))} authUser={authUser} />
            ) : (
              <div className="max-w-[1100px] mx-auto">
                {/* Category Filters */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`cat-pill whitespace-nowrap ${activeCategory === cat ? 'active' : ''}`}>{cat}</button>
                  ))}
                  <span className="text-xs text-[#B0B7C3] ml-auto font-medium whitespace-nowrap">{filtered.length} results</span>
                </div>

                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-block w-8 h-8 border-3 border-[#00BFA6] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#7B8190] mt-3">Loading listings...</p>
                  </div>
                ) : (
                  <>
                    {/* ── Product Card Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtered.map(item => {
                        const avg = getAvgRating(item);
                        const hasUpvoted = item.upvotedBy.includes(SESSION_ID);
                        return (
                          <motion.div key={item._id}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedItemId(item._id)}
                            className="card p-0 overflow-hidden cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            {/* Card Image */}
                            <div className="h-36 bg-gradient-to-br from-[#F4F5F7] to-[#E8ECF0] flex items-center justify-center relative group-hover:from-[#E8ECF0] group-hover:to-[#DDE0E4] transition-all overflow-hidden">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center text-3xl font-bold text-[#00BFA6]">{item.name[0]}</div>
                              )}
                              <span className={`absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded ${catColor[item.category] || 'bg-gray-100 text-gray-500'}`}>{item.category}</span>
                              {item.link && <ExternalLink className="w-3 h-3 text-[#B0B7C3] absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition" />}
                            </div>
                            {/* Card Body */}
                            <div className="p-3.5">
                              <h3 className="text-sm font-bold text-[#1E1E2D] group-hover:text-[#00BFA6] transition-colors truncate">{item.name}</h3>
                              <p className="text-[11px] text-[#7B8190] mt-0.5 line-clamp-2 leading-relaxed">{item.tagline}</p>
                              {/* Rating */}
                              <div className="flex items-center gap-1 mt-2.5">
                                {avg > 0 ? (
                                  <>
                                    <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
                                    <span className="text-[11px] font-bold text-[#1E1E2D] ml-0.5">{avg.toFixed(1)}</span>
                                    <span className="text-[10px] text-[#B0B7C3]">({item.ratings.length})</span>
                                  </>
                                ) : <span className="text-[10px] text-[#B0B7C3]">No ratings yet</span>}
                              </div>
                              {/* Footer */}
                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F0F1F3]">
                                <button onClick={(e) => handleUpvote(e, item._id)}
                                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition cursor-pointer ${hasUpvoted ? 'bg-[#00BFA6]/10 text-[#00BFA6]' : 'text-[#B0B7C3] hover:text-[#00BFA6]'}`}>
                                  <ChevronUp className="w-3 h-3" />{item.upvotes}
                                </button>
                                <span className="text-[9px] text-[#B0B7C3]">{timeAgo(item.submittedAt)}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {filtered.length === 0 && (
                      <div className="text-center py-16">
                        <p className="text-3xl mb-2">🔍</p>
                        <p className="text-sm text-[#7B8190]">No listings found. Try a different search or category.</p>
                      </div>
                    )}
                  </>
                )}
                <p className="text-center text-[10px] text-[#B0B7C3] mt-8">© 2026 RateMyStuff. All rights reserved.</p>
              </div>
            )
          )}
        </main>
      </div>

      <AnimatePresence>
        {showSubmit && <SubmitForm onClose={() => setShowSubmit(false)} onSubmitted={loadItems} />}
        {showProfile && <UserProfilePanel onClose={() => setShowProfile(false)} onNavigate={id => { setSelectedItemId(id); setPage('listings'); }} />}
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
