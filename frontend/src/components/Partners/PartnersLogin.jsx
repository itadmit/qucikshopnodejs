import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight,
  Sparkles,
  Building2,
  BarChart3,
  Users
} from 'lucide-react';
import api from '../../services/api';

const PartnersLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/partners/login', {
        email: formData.email,
        password: formData.password
      });

      // Save token and partner data
      console.log('Login response data:', data);
      
      // Check if we got the expected data
      if (!data || !data.token) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('partnerToken', data.token);
      localStorage.setItem('partnerData', JSON.stringify(data.partner));

      // Save email if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('partnerEmail', formData.email);
      } else {
        localStorage.removeItem('partnerEmail');
      }

      // Redirect to partner dashboard
      console.log('Navigating to dashboard...');
      navigate('/partners/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'אירעה שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  // Load saved email on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('partnerEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const features = [
    {
      icon: Building2,
      title: 'חנויות פיתוח',
      description: 'צור חנויות פיתוח ללא הגבלה'
    },
    {
      icon: BarChart3,
      title: 'דשבורד אנליטיקס',
      description: 'עקוב אחר הביצועים שלך בזמן אמת'
    },
    {
      icon: Users,
      title: 'ניהול לקוחות',
      description: 'נהל את כל הלקוחות שלך במקום אחד'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-white mb-6">
            ברוך הבא חזרה!
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            התחבר לפאנל השותפים שלך וגש לכל הכלים והנתונים שלך
          </p>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-800/50 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">₪</span>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">₪2,450,000</div>
                <div className="text-gray-400">סה"כ עמלות ששולמו החודש</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/partners" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowRight className="w-4 h-4 ml-2 rotate-180" />
            חזרה
          </Link>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">התחברות לשותפים</h1>
              <p className="text-gray-400">היכנס לחשבון השותפים שלך</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">אימייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="partner@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="ml-2"
                  />
                  <span className="text-gray-300">זכור אותי</span>
                </label>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition text-sm">
                  שכחת סיסמה?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    התחבר
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-center text-gray-400 mb-4">עדיין לא שותף?</p>
              <Link
                to="/partners/register"
                className="block w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition text-center"
              >
                הצטרף עכשיו בחינם
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              בהתחברות אתה מסכים ל
              <a href="#" className="text-blue-500 hover:text-blue-400 mx-1">תנאי השימוש</a>
              ול
              <a href="#" className="text-blue-500 hover:text-blue-400 mx-1">מדיניות הפרטיות</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersLogin;
