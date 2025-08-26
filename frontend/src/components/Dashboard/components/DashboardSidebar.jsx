import { X, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DashboardSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  menuItems, 
  activeTab, 
  setActiveTab,
  user,
  onLogout
}) => {
  const { t } = useTranslation();
  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform ${
      sidebarOpen ? 'translate-x-0' : 'translate-x-full'
    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 border-l border-gray-100 h-full flex flex-col overflow-hidden`}>
      
      {/* Sidebar Header */}
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex justify-center w-full">
            <img 
              src="/src/assets/logo.png" 
              alt="QuickShop Logo" 
              className="h-12 w-auto"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-6 pb-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                  // Update URL based on tab
                  let newPath;
                  if (item.id === 'products') {
                    newPath = '/dashboard/products';
                  } else if (item.id === 'overview') {
                    newPath = '/dashboard';
                  } else {
                    newPath = `/dashboard/${item.id}`;
                  }
                  window.history.pushState({}, '', newPath);
                  window.dispatchEvent(new CustomEvent('urlchange', { detail: { path: newPath } }));
                }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-gray-900 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive ? {background: 'linear-gradient(270deg, #fbece3 0%, #eaceff 100%)'} : {}}
              >
                <Icon className={`ml-3 h-5 w-5 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="flex-shrink-0 p-4">
        {/* Trial Plan Notice */}
        <div className="rounded-xl p-4 mb-4" style={{background: 'linear-gradient(180deg, #fbece3 0%, #eaceff 100%)'}}>
          <h3 className="font-semibold text-gray-900 mb-1">שדרג את התוכנית שלך</h3>
          <p className="text-sm text-gray-700 mb-3">
            תקופת הניסיון שלך מסתיימת בעוד 12 ימים. שדרג את התוכנית שלך ופתח את מלוא הפוטנציאל.
          </p>
          <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center">
            <Settings className="w-4 h-4 mr-2" />
            צפה בתוכניות
          </button>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="ml-3 h-5 w-5" />
            {t('nav.logout') || 'התנתק'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
