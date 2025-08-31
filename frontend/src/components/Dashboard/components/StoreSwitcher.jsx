import { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Store, 
  Plus, 
  Check,
  Crown,
  Users,
  ExternalLink
} from 'lucide-react';
import apiService from '../../../services/api';

const StoreSwitcher = ({ currentStore, onStoreChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUserStores();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserStores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      apiService.setToken(token);
      const response = await apiService.getUserStores();
      setStores(response.data || []);
    } catch (error) {
      console.error('Failed to fetch user stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = async (store) => {
    try {
      // Fetch full store data with permissions
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      apiService.setToken(token);
      const response = await apiService.getStoreById(store.id);
      const fullStoreData = response.data;
      
      onStoreChange(fullStoreData);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch store:', error);
      // Fallback to basic store data
      onStoreChange(store);
      setIsOpen(false);
    }
  };

  const getStoreIcon = (store) => {
    if (store.role === 'OWNER') {
      return <Crown className="w-4 h-4 text-yellow-500" />;
    }
    return <Users className="w-4 h-4 text-blue-500" />;
  };

  const getStoreRoleText = (store) => {
    const roleMap = {
      'OWNER': 'בעלים',
      'ADMIN': 'מנהל',
      'STAFF': 'עובד',
      'VIEWER': 'צופה'
    };
    return roleMap[store.role] || store.role;
  };

  if (!currentStore) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <span className="text-gray-500 text-sm flex-1 text-right">טוען חנויות...</span>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="font-bold text-gray-400 text-sm">?</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 order-2">
            {currentStore.logoUrl ? (
              <img 
                src={currentStore.logoUrl} 
                alt={currentStore.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-blue-700 text-sm">
                  {currentStore.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 text-right order-1">
            <div className="font-medium text-gray-900 truncate">
              {currentStore.name}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
              <span>{getStoreRoleText(currentStore)}</span>
              {getStoreIcon(currentStore)}
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {/* Current Store Section */}
          <div className="p-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">
              החנות הנוכחית
            </div>
            <div className="px-2 py-2 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between">
                <Check className="w-4 h-4 text-blue-600" />
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 order-2">
                    {currentStore.logoUrl ? (
                      <img 
                        src={currentStore.logoUrl} 
                        alt={currentStore.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-700 text-sm">
                          {currentStore.name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-right order-1">
                    <div className="font-medium text-gray-900 truncate">
                      {currentStore.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      <span>{getStoreRoleText(currentStore)}</span>
                      {getStoreIcon(currentStore)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Stores */}
          {stores.length > 1 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">
                חנויות אחרות
              </div>
              {stores
                .filter(store => store.id !== currentStore.id)
                .map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreSelect(store)}
                    className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 order-2">
                        {store.logoUrl ? (
                          <img 
                            src={store.logoUrl} 
                            alt={store.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-gray-700 text-xs">
                              {store.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-right order-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {store.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                          <span>{getStoreRoleText(store)}</span>
                          {getStoreIcon(store)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => {
                // TODO: Navigate to create new store
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>צור חנות חדשה</span>
            </button>
            
            {currentStore.domain && (
              <button
                onClick={() => {
                  window.open(`https://${currentStore.domain}`, '_blank');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors mt-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>צפה בחנות</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSwitcher;
