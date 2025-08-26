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
    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 border-l border-gray-100`}>
      
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

      {/* User Info */}
      <div className="px-6 py-4">
        <div className="flex items-center p-3 rounded-xl" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
          <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg ml-3">
            {user?.firstName?.charAt(0) || 'י'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{user?.firstName || 'יוגב'} {user?.lastName || 'אביטן'}</p>
            <p className="text-xs text-gray-600 font-medium">מנהל חנות</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 pb-4">
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
      <div className="absolute bottom-6 left-4 right-4">
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
