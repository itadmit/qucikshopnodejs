import { 
  Menu,
  Search,
  ArrowUpDown,
  Store,
  ExternalLink
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown.jsx';

const DashboardHeader = ({ 
  user, 
  userStore, 
  activeTab, 
  menuItems, 
  loading, 
  fetchDashboardData, 
  setSidebarOpen 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || 'דשבורד'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {userStore && (
              <a
                href={`http://${userStore.slug}.localhost:5173`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Store className="w-4 h-4" />
                <span className="font-medium">החנות שלי</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
              title="רענן נתונים"
            >
              <ArrowUpDown className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש..."
                className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-64"
              />
            </div>
            <NotificationDropdown />
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.charAt(0) || 'ח'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
