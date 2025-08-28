import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

const PartnersRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    acceptTerms: false
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

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (!formData.acceptTerms) {
      setError('יש לאשר את תנאי השימוש');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/partners/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        phone: formData.phone
      });

      // Save token
      localStorage.setItem('partnerToken', response.data.token);
      localStorage.setItem('partnerData', JSON.stringify(response.data.partner));

      // Redirect to partner dashboard
      navigate('/partners/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'אירעה שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'עמלות גבוהות על כל חנות פעילה',
    'כלי פיתוח מתקדמים וגישה ל-API',
    'תמיכה טכנית ומקצועית 24/7',
    'הכשרות ומשאבים בלעדיים'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Side - Form */}
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
              <h1 className="text-3xl font-bold text-white mb-2">הצטרף כשותף</h1>
              <p className="text-gray-400">מלא את הפרטים והתחל להרוויח היום</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">שם פרטי</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ישראל"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">שם משפחה</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ישראלי"
                  />
                </div>
              </div>

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
                <label className="block text-gray-300 mb-2">חברה (אופציונלי)</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="שם החברה"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">טלפון (אופציונלי)</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="050-1234567"
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
                    minLength="6"
                    className="w-full bg-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">אימות סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full bg-slate-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 ml-2"
                />
                <label htmlFor="acceptTerms" className="text-gray-300 text-sm">
                  אני מסכים ל<a href="#" className="text-blue-500 hover:text-blue-400">תנאי השימוש</a> ול<a href="#" className="text-blue-500 hover:text-blue-400">מדיניות הפרטיות</a>
                </label>
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
                    הרשם כשותף
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                כבר רשום?{' '}
                <Link to="/partners/login" className="text-blue-500 hover:text-blue-400 transition">
                  התחבר
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-white mb-6">
            הצטרף לתוכנית השותפים המובילה בישראל
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            עזור לעסקים להצליח אונליין והרווח עמלות גבוהות על כל חנות שתביא
          </p>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">עמלות מדורגות</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">0-9 חנויות</span>
                <span className="text-2xl font-bold text-white">₪85</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">10-49 חנויות</span>
                <span className="text-2xl font-bold text-white">₪100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">50+ חנויות</span>
                <span className="text-2xl font-bold text-white">₪150</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersRegister;
