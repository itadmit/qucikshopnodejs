import { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  CreditCard, 
  Truck, 
  Calculator, 
  MapPin, 
  FileText, 
  Bell, 
  Users, 
  ShoppingCart,
  Globe,
  Shield,
  Zap,
  Code,
  Target,
  Search,
  ChevronRight,
  Save,
  AlertCircle,
  CheckCircle,
  Mail,
  Type
} from 'lucide-react';
import PixelsPage from './PixelsPage';
import EmailTemplatesPage from './EmailTemplatesPage';

const SettingsPage = ({ userStore }) => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const settingsCategories = [
    {
      id: 'general',
      name: 'הגדרות כלליות',
      description: 'נהל את הגדרות החנות הבסיסיות שלך',
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'payments',
      name: 'תשלומים',
      description: 'הגדר שיטות תשלום וספקי סליקה',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'shipping',
      name: 'משלוחים והובלה',
      description: 'נהל אזורי משלוח ותעריפים',
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'taxes',
      name: 'מיסים',
      description: 'הגדר חישובי מס ותעריפים',
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'locations',
      name: 'מיקומים',
      description: 'נהל מחסנים וחנויות פיזיות',
      icon: MapPin,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'checkout',
      name: 'קופה',
      description: 'התאם את חוויית הקופה ללקוחות',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'notifications',
      name: 'התראות',
      description: 'נהל התראות אוטומטיות ללקוחות',
      icon: Bell,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'users',
      name: 'משתמשים והרשאות',
      description: 'נהל צוות החנות והרשאות',
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'policies',
      name: 'מדיניות החנות',
      description: 'הגדר מדיניות פרטיות, החזרות ותנאי שימוש',
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      id: 'domains',
      name: 'דומיין ו-SSL',
      description: 'נהל את הדומיין ותעודת האבטחה',
      icon: Globe,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      id: 'security',
      name: 'אבטחה',
      description: 'הגדרות אבטחה ואימות דו-שלבי',
      icon: Shield,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'integrations',
      name: 'אינטגרציות',
      description: 'חבר שירותים חיצוניים ו-APIs',
      icon: Zap,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      id: 'developer',
      name: 'כלי מפתחים',
      description: 'API keys, webhooks וכלי פיתוח',
      icon: Code,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    },
    {
      id: 'pixels',
      name: 'פיקסלים ומעקב',
      description: 'הגדר Facebook Pixel, Google Analytics ו-Tag Manager',
      icon: Target,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      id: 'custom-fields',
      name: 'שדות מותאמים אישית',
      description: 'הוסף שדות נוספים למוצרים שלך',
      icon: Type,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  const filteredCategories = settingsCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSettings = settingsCategories.find(cat => cat.id === activeCategory);

  const handleSaveChanges = () => {
    // Save logic here
    setHasUnsavedChanges(false);
    // Show success message
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'general':
        return <GeneralSettings />;
      case 'payments':
        return <PaymentSettings />;
      case 'shipping':
        return <ShippingSettings />;
      case 'taxes':
        return <TaxSettings />;
      case 'locations':
        return <LocationSettings />;
      case 'checkout':
        return <CheckoutSettings />;
      case 'notifications':
        return <NotificationSettings userStore={userStore} />;
      case 'users':
        return <UserSettings />;
      case 'policies':
        return <PolicySettings />;
      case 'domains':
        return <DomainSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'developer':
        return <DeveloperSettings />;
      case 'pixels':
        return <PixelsSettings userStore={userStore} />;
      case 'custom-fields':
        // Navigate to custom fields page
        window.history.pushState({}, '', '/dashboard/settings/custom-fields');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return <GeneralSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">הגדרות</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="חפש הגדרות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="p-4 space-y-1">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-right p-3 rounded-lg transition-colors flex items-center justify-between group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ml-3 ${
                    isActive ? category.bgColor : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? category.color : 'text-gray-500'}`} />
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{category.description}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ml-4 ${activeSettings?.bgColor}`}>
                {activeSettings && <activeSettings.icon className={`w-5 h-5 ${activeSettings.color}`} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeSettings?.name}</h2>
                <p className="text-gray-600">{activeSettings?.description}</p>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4 ml-2" />
                  יש שינויים שלא נשמרו
                </div>
                <button
                  onClick={handleSaveChanges}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 ml-2" />
                  שמור שינויים
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200">
            {renderCategoryContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for each settings category
const GeneralSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">הגדרות כלליות</h3>
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">שם החנות</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="הכנס שם החנות"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">אימייל יצירת קשר</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contact@store.com"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">תיאור החנות</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="תאר את החנות שלך..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">אזור זמן</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Asia/Jerusalem">ישראל (UTC+2/+3)</option>
            <option value="Europe/London">לונדון (UTC+0/+1)</option>
            <option value="America/New_York">ניו יורק (UTC-5/-4)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">מטבע</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="ILS">שקל ישראלי (₪)</option>
            <option value="USD">דולר אמריקאי ($)</option>
            <option value="EUR">יורו (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">יחידת משקל</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="kg">קילוגרם</option>
            <option value="g">גרם</option>
            <option value="lb">פאונד</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

const PaymentSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">הגדרות תשלום</h3>
    <p className="text-gray-600">הגדר שיטות תשלום וספקי סליקה עבור החנות שלך</p>
    {/* Payment settings content */}
  </div>
);

const ShippingSettings = () => {
  // Import the shipping logic from ShippingPage
  const [shippingZones, setShippingZones] = useState([]);
  const [showAddZone, setShowAddZone] = useState(false);
  const [expandedZone, setExpandedZone] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [generalSettings, setGeneralSettings] = useState({
    freeShippingThreshold: 200,
    defaultShippingRate: 15,
    weightUnit: 'kg',
    dimensionUnit: 'cm'
  });

  useEffect(() => {
    loadShippingSettings();
  }, []);

  const loadShippingSettings = () => {
    // Load from localStorage or API
    const savedSettings = localStorage.getItem('shippingSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setShippingZones(settings.zones || []);
      setGeneralSettings(settings.general || generalSettings);
    } else {
      // Default zones
      setShippingZones([
        {
          id: 'israel',
          name: 'ישראל',
          countries: ['IL'],
          rates: [
            {
              id: 'standard',
              name: 'משלוח רגיל',
              price: 15,
              freeAbove: 200,
              conditions: {
                minWeight: 0,
                maxWeight: 30,
                minPrice: 0,
                maxPrice: null
              },
              deliveryTime: '3-5 ימי עסקים'
            }
          ]
        }
      ]);
    }
  };

  const saveShippingSettings = () => {
    const settings = {
      zones: shippingZones,
      general: generalSettings
    };
    localStorage.setItem('shippingSettings', JSON.stringify(settings));
    alert('הגדרות המשלוח נשמרו בהצלחה!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* General Shipping Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">הגדרות משלוח כלליות</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סכום למשלוח חינם
            </label>
            <div className="relative">
              <input
                type="number"
                value={generalSettings.freeShippingThreshold}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  freeShippingThreshold: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="200"
              />
              <span className="absolute left-3 top-2 text-gray-500">₪</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תעריף משלוח ברירת מחדל
            </label>
            <div className="relative">
              <input
                type="number"
                value={generalSettings.defaultShippingRate}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  defaultShippingRate: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15"
              />
              <span className="absolute left-3 top-2 text-gray-500">₪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Zones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">אזורי משלוח</h3>
          <button
            onClick={saveShippingSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 ml-2" />
            שמור הגדרות
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-4">
            נהל אזורי משלוח ותעריפים. כל אזור יכול לכלול מספר מדינות ושיטות משלוח שונות.
          </p>
          
          {shippingZones.length > 0 ? (
            <div className="space-y-3">
              {shippingZones.map((zone) => (
                <div key={zone.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{zone.name}</h4>
                      <p className="text-sm text-gray-500">
                        {zone.countries.join(', ')} • {zone.rates.length} שיטות משלוח
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {zone.rates.length > 0 && (
                        <span>החל מ-{Math.min(...zone.rates.map(r => r.price))}₪</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">אין אזורי משלוח מוגדרים</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaxSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">הגדרות מיסים</h3>
    <p className="text-gray-600">הגדר חישובי מס ותעריפים לפי מיקום</p>
    {/* Tax settings content */}
  </div>
);

const LocationSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">מיקומים</h3>
    <p className="text-gray-600">נהל מחסנים, חנויות פיזיות ומרכזי הפצה</p>
    {/* Location settings content */}
  </div>
);

const CheckoutSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">הגדרות קופה</h3>
    <p className="text-gray-600">התאם את חוויית הקופה והתשלום ללקוחות</p>
    {/* Checkout settings content */}
  </div>
);

const NotificationSettings = ({ userStore }) => {
  const [activeSubTab, setActiveSubTab] = useState('templates');

  const subTabs = [
    {
      id: 'templates',
      name: 'תבניות מייל',
      icon: Mail,
      description: 'עריכת תבניות מיילים ללקוחות'
    },
    {
      id: 'settings',
      name: 'הגדרות התראות',
      icon: Bell,
      description: 'הגדרות כלליות להתראות'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">התראות ומיילים</h3>
        <p className="text-gray-600">נהל התראות אוטומטיות ותבניות מיילים ללקוחות</p>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSubTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`ml-2 h-5 w-5 ${
                  activeSubTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeSubTab === 'templates' && (
        <EmailTemplatesPage storeId={userStore?.id} />
      )}
      
      {activeSubTab === 'settings' && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">הגדרות התראות כלליות</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">התראות הזמנות חדשות</h5>
                <p className="text-sm text-gray-600">קבל התראה כשמתקבלת הזמנה חדשה</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">התראות מלאי נמוך</h5>
                <p className="text-sm text-gray-600">קבל התראה כשמלאי מוצר מתחת לסף המינימום</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">מיילי עגלה נטושה</h5>
                <p className="text-sm text-gray-600">שלח מייל אוטומטי ללקוחות שעזבו פריטים בעגלה</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">משתמשים והרשאות</h3>
    <p className="text-gray-600">נהל את צוות החנות וההרשאות שלהם</p>
    {/* User settings content */}
  </div>
);

const PolicySettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">מדיניות החנות</h3>
    <p className="text-gray-600">הגדר מדיניות פרטיות, החזרות ותנאי שימוש</p>
    {/* Policy settings content */}
  </div>
);

const DomainSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">דומיין ו-SSL</h3>
    <p className="text-gray-600">נהל את הדומיין של החנות ותעודת האבטחה</p>
    {/* Domain settings content */}
  </div>
);

const SecuritySettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">הגדרות אבטחה</h3>
    <p className="text-gray-600">נהל הגדרות אבטחה ואימות דו-שלבי</p>
    {/* Security settings content */}
  </div>
);

const IntegrationSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">אינטגרציות</h3>
    <p className="text-gray-600">חבר שירותים חיצוניים ו-APIs לחנות</p>
    {/* Integration settings content */}
  </div>
);

const DeveloperSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">כלי מפתחים</h3>
    <p className="text-gray-600">API keys, webhooks וכלי פיתוח מתקדמים</p>
    {/* Developer settings content */}
  </div>
);

const PixelsSettings = ({ userStore }) => (
  <div className="h-full">
    <PixelsPage userStore={userStore} />
  </div>
);

export default SettingsPage;
