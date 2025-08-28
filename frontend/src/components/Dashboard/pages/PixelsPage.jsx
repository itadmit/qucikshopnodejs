import { useState, useEffect } from 'react';
import { 
  Settings, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Save,
  TestTube,
  Info
} from 'lucide-react';
import api from '../../../services/api';

const PixelsPage = ({ userStore }) => {
  const [pixelSettings, setPixelSettings] = useState({
    facebookPixelId: '',
    facebookAccessToken: '',
    googleTagManagerId: '',
    googleAnalyticsId: '',
    pixelSettings: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState('facebook');
  const [showCodeExamples, setShowCodeExamples] = useState(false);
  const [codeExamples, setCodeExamples] = useState({});

  // קבלת הגדרות פיקסלים
  const fetchPixelSettings = async () => {
    try {
      setLoading(true);
      
      if (!userStore?.id) {
        throw new Error('Store not found');
      }

      const response = await api.get(`/pixels/${userStore.id}`);
      setPixelSettings(response.data.data || {
        facebookPixelId: '',
        facebookAccessToken: '',
        googleTagManagerId: '',
        googleAnalyticsId: '',
        pixelSettings: {}
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching pixel settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // שמירת הגדרות פיקסלים
  const savePixelSettings = async () => {
    try {
      setSaving(true);
      setValidationErrors({});
      
      if (!userStore?.id) {
        throw new Error('Store not found');
      }

      const response = await api.put(`/pixels/${userStore.id}`, pixelSettings);
      
      if (response.data.success) {
        alert('הגדרות הפיקסלים נשמרו בהצלחה!');
      }
      
    } catch (err) {
      console.error('Error saving pixel settings:', err);
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  // בדיקת תקינות הגדרות
  const validateSettings = async () => {
    try {
      const response = await api.post('/pixels/validate', {
        facebookPixelId: pixelSettings.facebookPixelId,
        googleAnalyticsId: pixelSettings.googleAnalyticsId,
        googleTagManagerId: pixelSettings.googleTagManagerId
      });

      return response.data.results;
    } catch (err) {
      console.error('Error validating settings:', err);
      return null;
    }
  };

  // קבלת דוגמאות קוד
  const fetchCodeExamples = async () => {
    try {
      if (!userStore?.id) return;
      
      const response = await api.get(`/pixels/code-examples/${userStore.id}`);
      setCodeExamples(response.data.data);
    } catch (err) {
      console.error('Error fetching code examples:', err);
    }
  };

  // בדיקת חיבור Facebook
  const testFacebookConnection = async () => {
    try {
      if (!userStore?.id) {
        alert('חנות לא נמצאה');
        return;
      }
      
      const response = await api.post(`/pixels/test-facebook/${userStore.id}`);
      
      if (response.data.success) {
        alert('החיבור ל-Facebook Pixel תקין!');
      }
    } catch (err) {
      console.error('Error testing Facebook connection:', err);
      alert('שגיאה בבדיקת החיבור: ' + (err.response?.data?.error || err.message));
    }
  };

  // העתקה ללוח
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('הקוד הועתק ללוח!');
  };

  useEffect(() => {
    if (userStore?.id) {
      fetchPixelSettings();
    }
  }, [userStore]);

  // רכיב כרטיס פיקסל
  const PixelCard = ({ title, description, icon: Icon, children, isActive, onClick }) => (
    <div 
      className={`bg-white rounded-lg border p-6 cursor-pointer transition-all ${
        isActive ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center ml-3">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {isActive && children}
    </div>
  );

  // רכיב שדה קלט
  const InputField = ({ label, value, onChange, placeholder, type = "text", error, help }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 ml-1" />
          {error}
        </p>
      )}
      {help && (
        <p className="mt-1 text-sm text-gray-500 flex items-center">
          <Info className="w-4 h-4 ml-1" />
          {help}
        </p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">הגדרות פיקסלים</h1>
            <p className="text-gray-600">ניהול פיקסלים ומעקב אנליטיקה</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">טוען הגדרות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">הגדרות פיקסלים</h1>
          <p className="text-gray-600">הגדר פיקסלים למעקב אנליטיקה מתקדם</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCodeExamples(!showCodeExamples)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Eye className="w-4 h-4 ml-2" />
            דוגמאות קוד
          </button>
          <button
            onClick={savePixelSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'שומר...' : 'שמור הגדרות'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* הודעת מידע */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 ml-2 mt-0.5" />
          <div className="text-blue-700">
            <p className="font-medium mb-1">מעקב אוטומטי מתקדם</p>
            <p className="text-sm">
              המערכת תטמיע אוטומטית את כל אירועי ה-ecommerce המתקדמים: צפיות במוצרים, הוספה לעגלה, תחילת תהליך רכישה והשלמת הזמנות.
              פשוט הזן את מזהי הפיקסלים והכל יעבוד אוטומטית!
            </p>
          </div>
        </div>
      </div>

      {/* כרטיסי פיקסלים */}
      <div className="grid grid-cols-1 gap-6">
        {/* Facebook Pixel */}
        <PixelCard
          title="Facebook Pixel"
          description="מעקב אחר המרות ואופטימיזציה של מודעות פייסבוק"
          icon={Settings}
          isActive={activeTab === 'facebook'}
          onClick={() => setActiveTab(activeTab === 'facebook' ? '' : 'facebook')}
        >
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
            <InputField
              label="Facebook Pixel ID"
              value={pixelSettings.facebookPixelId || ''}
              onChange={(e) => setPixelSettings(prev => ({ ...prev, facebookPixelId: e.target.value }))}
              placeholder="123456789012345"
              help="מזהה הפיקסל של פייסבוק (15-16 ספרות)"
              error={validationErrors.facebookPixel}
            />
            
            <InputField
              label="Facebook Access Token (אופציונלי)"
              value={pixelSettings.facebookAccessToken || ''}
              onChange={(e) => setPixelSettings(prev => ({ ...prev, facebookAccessToken: e.target.value }))}
              placeholder="EAABwz..."
              type="password"
              help="טוקן גישה לשליחת אירועים מהשרת (Conversions API)"
            />

            {pixelSettings.facebookPixelId && (
              <button
                onClick={testFacebookConnection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <TestTube className="w-4 h-4 ml-2" />
                בדוק חיבור
              </button>
            )}
          </div>
        </PixelCard>

        {/* Google Analytics */}
        <PixelCard
          title="Google Analytics 4"
          description="מעקב מפורט אחר התנהגות משתמשים ו-ecommerce"
          icon={Settings}
          isActive={activeTab === 'analytics'}
          onClick={() => setActiveTab(activeTab === 'analytics' ? '' : 'analytics')}
        >
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
            <InputField
              label="Google Analytics Measurement ID"
              value={pixelSettings.googleAnalyticsId || ''}
              onChange={(e) => setPixelSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
              placeholder="G-XXXXXXXXXX"
              help="מזהה המדידה של Google Analytics 4"
              error={validationErrors.googleAnalytics}
            />
          </div>
        </PixelCard>

        {/* Google Tag Manager */}
        <PixelCard
          title="Google Tag Manager"
          description="ניהול מרכזי של כל התגיות והפיקסלים"
          icon={Settings}
          isActive={activeTab === 'gtm'}
          onClick={() => setActiveTab(activeTab === 'gtm' ? '' : 'gtm')}
        >
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
            <InputField
              label="Google Tag Manager Container ID"
              value={pixelSettings.googleTagManagerId || ''}
              onChange={(e) => setPixelSettings(prev => ({ ...prev, googleTagManagerId: e.target.value }))}
              placeholder="GTM-XXXXXXX"
              help="מזהה הקונטיינר של Google Tag Manager"
              error={validationErrors.googleTagManager}
            />
          </div>
        </PixelCard>
      </div>

      {/* דוגמאות קוד */}
      {showCodeExamples && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">דוגמאות קוד להטמעה ידנית</h3>
            <button
              onClick={fetchCodeExamples}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <ExternalLink className="w-4 h-4 ml-1" />
              רענן
            </button>
          </div>

          {Object.entries(codeExamples).map(([platform, code]) => (
            <div key={platform} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {platform === 'facebookPixel' && 'Facebook Pixel'}
                  {platform === 'googleAnalytics' && 'Google Analytics'}
                  {platform === 'googleTagManager' && 'Google Tag Manager'}
                </h4>
                <button
                  onClick={() => copyToClipboard(code)}
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <Copy className="w-4 h-4 ml-1" />
                  העתק
                </button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                <code>{code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* אירועים נתמכים */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">אירועי ecommerce נתמכים</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'PageView', description: 'צפייה בדף' },
            { name: 'ViewContent', description: 'צפייה במוצר' },
            { name: 'AddToCart', description: 'הוספה לעגלה' },
            { name: 'RemoveFromCart', description: 'הסרה מהעגלה' },
            { name: 'InitiateCheckout', description: 'תחילת תהליך רכישה' },
            { name: 'Purchase', description: 'השלמת רכישה' },
            { name: 'Search', description: 'חיפוש באתר' },
            { name: 'Custom Events', description: 'אירועים מותאמים אישית' }
          ].map((event, index) => (
            <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
              <div>
                <p className="font-medium text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PixelsPage;
