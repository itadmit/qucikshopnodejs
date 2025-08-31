import { 
  Menu,
  Search,
  ArrowUpDown,
  Store,
  ExternalLink,
  Settings,
  ChevronDown,
  User,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown.jsx';
import StoreSwitcher from './StoreSwitcher.jsx';

const DashboardHeader = ({ 
  user, 
  userStore, 
  activeTab, 
  menuItems, 
  loading, 
  fetchDashboardData, 
  setSidebarOpen,
  onLogout,
  onStartTour,
  onStoreChange
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const userDropdownRef = useRef(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          document.getElementById('dashboard-search')?.focus();
        }, 100);
      }
      // Escape to close search
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown]);

  // Copy store URL to clipboard
  const copyStoreUrl = async () => {
    if (userStore) {
      const url = `https://${userStore.slug}.my-quickshop.com`;
      try {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  return (
    <header className="bg-gradient-to-r from-gray-50 to-white shadow-sm border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Mobile Menu + Greeting */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Greeting */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <span>שלום, {user?.firstName || 'יוגב'}!</span>
                <span>👋</span>
              </h1>
            </div>


          </div>
          
          {/* Center - Search Bar (Shopify Style) */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="dashboard-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש מוצרים, הזמנות, לקוחות..."
                className="w-full pr-12 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm placeholder-gray-500"
                onFocus={() => setShowSearch(true)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                  ⌘K
                </kbd>
              </div>

              {/* Search Results Dropdown */}
              {showSearch && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    תוצאות חיפוש
                  </div>
                  
                  {/* Search results will be implemented when search functionality is added */}
                  <div className="py-1">
                    <div className="px-4 py-2 text-center text-gray-500 text-sm">
                      הקלד כדי לחפש...
                    </div>
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      לחץ <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> לחיפוש מתקדם
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Store Icon - Direct Link */}
            {userStore && (
              <a
                href={`https://${userStore.slug}.my-quickshop.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="צפה בחנות"
                data-tour="store-preview"
              >
                <Store className="w-5 h-5 text-gray-900" />
              </a>
            )}

            {/* Help/Tour Button */}
            <button
              onClick={() => {
                console.log('🎯 Header: Help button clicked, onStartTour:', !!onStartTour);
                if (onStartTour) {
                  onStartTour();
                } else {
                  console.error('❌ onStartTour function not provided');
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="הדרכה - הפעל טור הכוונה"
            >
              <HelpCircle className="w-5 h-5 text-gray-900" />
            </button>

            {/* Mobile Search Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-900" />
            </button>

            {/* Refresh Button - Hidden for now */}
            {false && (
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors hover:bg-gray-100 rounded-lg"
              title="רענן נתונים"
            >
              <ArrowUpDown className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            )}

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Avatar + Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-900 font-semibold text-sm shadow-md" style={{background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)'}}>
                  {user?.firstName?.charAt(0) || 'י'}
                </div>
                
                {/* User Details - RTL aligned */}
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-medium text-gray-900 text-right">{user?.firstName || 'יוגב'} {user?.lastName || 'אביטן'}</p>
                  <p className="text-xs text-gray-500 text-right">מנהל חנות</p>
                </div>
                
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

                            {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-0 z-50">
                  {/* Store Switcher Section */}
                  {userStore && (
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">החנויות שלי</p>
                      <StoreSwitcher 
                        currentStore={userStore} 
                        onStoreChange={(store) => {
                          onStoreChange(store);
                          setShowUserDropdown(false);
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Store Actions */}
                  {userStore && (
                    <div className="py-1">
                      <a
                        href={`https://${userStore.slug}.my-quickshop.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        צפה בחנות
                      </a>
                      
                      <button
                        onClick={() => {
                          copyStoreUrl();
                          setShowUserDropdown(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-right"
                      >
                        {copiedUrl ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                        {copiedUrl ? 'הועתק!' : 'העתק כתובת חנות'}
                      </button>
                    </div>
                  )}
                  
                  {/* Personal Actions */}
                  <div className="py-1 border-t border-gray-100">
                    <button
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-right"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      הגדרות חשבון
                    </button>
                    
                    <button
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-right"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      פרופיל
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onLogout) {
                          onLogout();
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4 text-red-400" />
                      התנתק
                    </button>
                  </div>
            </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close search */}
      {showSearch && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowSearch(false);
            setSearchQuery('');
          }}
        />
      )}
    </header>
  );
};

export default DashboardHeader;
