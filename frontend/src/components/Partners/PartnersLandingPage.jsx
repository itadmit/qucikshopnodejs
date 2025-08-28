import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  DollarSign, 
  Users,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  Globe,
  Code2,
  PresentationIcon
} from 'lucide-react';

const PartnersLandingPage = () => {

  const tiers = [
    {
      name: 'ברונזה',
      stores: '0-9 חנויות',
      commission: '₪85',
      features: [
        'גישה לפאנל שותפים',
        'יצירת חנויות פיתוח',
        'תמיכה בסיסית',
        'חומרי שיווק'
      ],
      color: 'from-amber-600 to-amber-700'
    },
    {
      name: 'כסף',
      stores: '10-49 חנויות',
      commission: '₪100',
      features: [
        'כל הכלול בברונזה',
        'תמיכה מועדפת',
        'הכשרות מתקדמות',
        'מנהל חשבון אישי'
      ],
      color: 'from-gray-400 to-gray-500',
      popular: true
    },
    {
      name: 'זהב',
      stores: '50+ חנויות',
      commission: '₪150',
      features: [
        'כל הכלול בכסף',
        'תמיכת VIP',
        'ייעוץ אסטרטגי',
        'אירועים בלעדיים'
      ],
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'עמלות גבוהות',
      description: 'הרווח עד ₪150 על כל חנות פעילה שתביא'
    },
    {
      icon: Code2,
      title: 'כלי פיתוח מתקדמים',
      description: 'גישה ל-API, חנויות פיתוח וכלים מקצועיים'
    },
    {
      icon: GraduationCap,
      title: 'הכשרות והדרכות',
      description: 'קורסים, וובינרים ותמיכה טכנית מקצועית'
    },
    {
      icon: BarChart3,
      title: 'דשבורד אנליטיקס',
      description: 'מעקב בזמן אמת אחר ביצועים והכנסות'
    },
    {
      icon: Users,
      title: 'קהילת שותפים',
      description: 'גישה לקהילה בלעדית של מפתחים ומשווקים'
    },
    {
      icon: ShieldCheck,
      title: 'תמיכה מלאה',
      description: 'צוות תמיכה ייעודי לשותפים 24/7'
    }
  ];

  const stats = [
    { value: '500+', label: 'שותפים פעילים' },
    { value: '₪2M+', label: 'עמלות ששולמו' },
    { value: '10K+', label: 'חנויות פעילות' },
    { value: '99.9%', label: 'זמינות המערכת' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8 space-x-reverse">
              <Link to="/" className="text-2xl font-bold text-white">
                QuickShop <span className="text-blue-500">Partners</span>
              </Link>
              <nav className="hidden md:flex space-x-6 space-x-reverse">
                <a href="#benefits" className="text-gray-300 hover:text-white transition">יתרונות</a>
                <a href="#tiers" className="text-gray-300 hover:text-white transition">דרגות</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition">איך זה עובד</a>
                <a href="#resources" className="text-gray-300 hover:text-white transition">משאבים</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                to="/partners/login"
                className="text-gray-300 hover:text-white transition"
              >
                התחברות
              </Link>
              <Link
                to="/partners/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                הצטרף עכשיו
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-blue-300 text-sm">תוכנית השותפים של QuickShop</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              צור. פתח. הרווח.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              הצטרף לתוכנית השותפים שלנו והרווח עמלות גבוהות
              <br />
              על כל חנות שתביא לפלטפורמה המובילה בישראל
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/partners/register"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2"
              >
                התחל להרוויח היום
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="bg-slate-700/50 backdrop-blur text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700/70 transition"
              >
                למד עוד
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              למה להצטרף ל-QuickShop Partners?
            </h2>
            <p className="text-xl text-gray-300">הרווח כסף תוך כדי שאתה עוזר לעסקים לצמוח</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition"
              >
                <benefit.icon className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section id="tiers" className="py-24 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              דרגות שותפים ועמלות
            </h2>
            <p className="text-xl text-gray-300">ככל שתביא יותר חנויות, כך תרוויח יותר</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-slate-800/50 backdrop-blur border ${
                  tier.popular ? 'border-blue-500' : 'border-slate-700'
                } rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      הכי פופולרי
                    </span>
                  </div>
                )}
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-xl mb-6 flex items-center justify-center`}
                >
                  <span className="text-2xl font-bold text-white">
                    {tier.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 mb-4">{tier.stores}</p>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-white">{tier.commission}</span>
                  <span className="text-gray-400 text-lg"> / לחנות</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition">
                  בחר תוכנית זו
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              איך זה עובד?
            </h2>
            <p className="text-xl text-gray-300">תהליך פשוט ומהיר להתחיל להרוויח</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '1',
                title: 'הרשמה',
                description: 'הירשם לתוכנית השותפים בחינם ומלא את הפרטים שלך'
              },
              {
                step: '2',
                title: 'צור חנויות',
                description: 'צור חנויות פיתוח ללקוחות שלך והתאם אותן לצרכים שלהם'
              },
              {
                step: '3',
                title: 'העבר בעלות',
                description: 'העבר את הבעלות על החנות ללקוח שלך בקלות'
              },
              {
                step: '4',
                title: 'הרווח עמלות',
                description: 'קבל עמלה על כל חנות שעוברת מתקופת ניסיון לתשלום'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-24 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              משאבים ותמיכה
            </h2>
            <p className="text-xl text-gray-300">כל מה שאתה צריך כדי להצליח</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <GraduationCap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">מרכז הדרכה</h3>
              <p className="text-gray-400 mb-4">
                גישה לקורסים, מדריכים ווובינרים בלעדיים לשותפים
              </p>
              <button className="text-blue-500 hover:text-blue-400 transition">
                למד עוד ←
              </button>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <Globe className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">קהילת שותפים</h3>
              <p className="text-gray-400 mb-4">
                הצטרף לקהילה של מפתחים ומשווקים מובילים
              </p>
              <button className="text-purple-500 hover:text-purple-400 transition">
                הצטרף לקהילה ←
              </button>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <PresentationIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">כלי שיווק</h3>
              <p className="text-gray-400 mb-4">
                חומרי שיווק, תבניות ומשאבים לקידום השירותים שלך
              </p>
              <button className="text-green-500 hover:text-green-400 transition">
                גישה לכלים ←
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              מוכן להתחיל להרוויח?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              הצטרף לתוכנית השותפים של QuickShop עוד היום והתחל לבנות עסק משלך
            </p>
            <Link
              to="/partners/register"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              הרשם בחינם
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">QuickShop Partners</h4>
              <p className="text-gray-400">
                הפלטפורמה המובילה לבניית חנויות אונליין בישראל
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">קישורים</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">אודות</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">תנאי שימוש</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">מדיניות פרטיות</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">משאבים</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">מרכז עזרה</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">בלוג</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">צור קשר</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">partners@quickshop.co.il</li>
                <li className="text-gray-400">03-1234567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QuickShop Partners. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default PartnersLandingPage;
