import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Store,
  ArrowRight,
  Shield,
  Zap,
  HeadphonesIcon
} from 'lucide-react';
import logo from '../assets/logo.png';

const AuthPage = ({ onClose, onSuccess, mode: initialMode = 'login' }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    storeName: ''
  });
  const [errors, setErrors] = useState({});

  // תמונות רקע מתחלפות - צבעים מתאימים לגרדיאנט
  const backgroundImages = [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'
  ];

  // החלפת תמונות אוטומטית
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }
    
    if (!formData.password) {
      newErrors.password = 'שדה חובה';
    } else if (formData.password.length < 6) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
    }
    
    if (mode === 'register') {
      if (!formData.firstName) newErrors.firstName = 'שדה חובה';
      if (!formData.lastName) newErrors.lastName = 'שדה חובה';
      if (!formData.storeName) newErrors.storeName = 'שדה חובה';
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (onSuccess) {
          onSuccess(data.user, data.token);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onClose();
        }
      } else {
        setErrors({ general: data.error || 'שגיאה בעיבוד הבקשה' });
      }
    } catch (error) {
      setErrors({ general: 'שגיאת רשת - נסה שוב מאוחר יותר' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      storeName: ''
    });
  };

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: 'Noto Sans Hebrew, sans-serif' }}>
      {/* אזור התמונה - 75% */}
      <div className="hidden lg:flex lg:w-3/4 relative overflow-hidden order-2 justify-center items-center">
        {/* תמונות רקע מתחלפות */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}
        
        {/* שכבת כיסוי מקצועית */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-purple-900/50 to-pink-900/60" />
        
        {/* תוכן על התמונה */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-8 lg:p-12 h-full">
          <div className="max-w-3xl text-center w-full mx-auto ">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                החנות הדיגיטלית שלך
                <span className="block text-3xl lg:text-4xl mt-2 bg-clip-text text-transparent" style={{background: 'linear-gradient(to right, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text'}}>
                  מוכנה תוך דקות
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto">
                פלטפורמה חדשנית מובילה המשלבת בינה מלאכותית ליצירת חנויות אונליין מקצועיות עם כל מה שצריך
              </p>
            </div>
            
            {/* סטטיסטיקות */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 w-full max-w-2xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl md:text-3xl font-bold mb-2 text-white">1000+</div>
                <div className="text-white/90 text-sm font-medium">חנויות פעילות</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl md:text-3xl font-bold mb-2 text-white">99.9%</div>
                <div className="text-white/90 text-sm font-medium">זמינות שרת</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl md:text-3xl font-bold mb-2 text-white">5 דק׳</div>
                <div className="text-white/90 text-sm font-medium">זמן הקמה</div>
              </div>
            </div>
            
            {/* יתרונות */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4 text-sm max-w-xl mx-auto">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                <span>אבטחה מתקדמת</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                <span>הקמה מהירה</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <HeadphonesIcon className="h-4 w-4 mr-2" />
                <span>תמיכה 24/7</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* אינדיקטורים לתמונות */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* אזור הטופס - 25% */}
      <div className="w-full lg:w-1/4 bg-white flex flex-col justify-center p-8 lg:p-12 relative order-1">
        {/* כפתור סגירה למובייל */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        )}
        
        <div className="w-full max-w-sm mx-auto">
          {/* לוגו וכותרת */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img src={logo} alt="QuickShop Logo" className="w-44 h-auto object-contain mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'ברוכים השבים' : 'הצטרפו אלינו'}
            </h2>
            <p className="text-gray-600">
              {mode === 'login' 
                ? 'התחברו לחשבון שלכם' 
                : 'צרו חנות דיגיטלית תוך דקות'
              }
            </p>
          </div>

          {/* טופס */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* שדות רישום */}
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שם פרטי
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="שם פרטי"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שם משפחה
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="שם משפחה"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם החנות
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                        errors.storeName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="שם החנות שלכם"
                    />
                  </div>
                  {errors.storeName && (
                    <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון (אופציונלי)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                      placeholder="מספר טלפון"
                    />
                  </div>
                </div>
              </>
            )}

            {/* אימייל */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כתובת אימייל
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* סיסמה */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="סיסמה"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* אישור סיסמה לרישום */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אישור סיסמה
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="אישור סיסמה"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* כפתור שליחה */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-xl"
              style={{
                background: loading ? '#9CA3AF' : 'linear-gradient(to right, rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)',
                color: loading ? 'white' : '#374151'
              }}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  טוען...
                </div>
              ) : (
                <>
                  {mode === 'login' ? 'התחברות' : 'יצירת חשבון'}
                  <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
                </>
              )}
            </button>

            {/* שכחתי סיסמה */}
            {mode === 'login' && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  שכחתי סיסמה
                </button>
              </div>
            )}

            {/* החלפת מצב */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                {mode === 'login' ? 'אין לכם חשבון?' : 'כבר יש לכם חשבון?'}
                {' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-gray-700 hover:text-gray-900 font-medium underline"
                >
                  {mode === 'login' ? 'הירשמו כאן' : 'התחברו כאן'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
