import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl } from '../../config/environment.js';
import {
  LayoutDashboard,
  Store,
  DollarSign,
  BarChart3,
  Settings,
  BookOpen,
  LogOut,
  Menu,
  X,
  Plus,
  TrendingUp,
  Users,
  Building2,
  ChevronRight,
  Download,
  Eye,
  Sparkles,
  Crown,
  Medal
} from 'lucide-react';
import api from '../../services/api';
import logo from '../../assets/logo.png';

// Import pages
import PartnerOverview from './pages/PartnerOverview.jsx';
import PartnerStores from './pages/PartnerStores.jsx';
import PartnerCommissions from './pages/PartnerCommissions.jsx';
import PayoutRequests from './pages/PayoutRequests.jsx';
import PartnerAnalytics from './pages/PartnerAnalytics.jsx';
import PartnerSettings from './pages/PartnerSettings.jsx';
import PartnerResources from './pages/PartnerResources.jsx';

const PartnersDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('partnerToken');
    if (!token) {
      navigate('/partners/login');
      return;
    }

    // Fetch partner data
    fetchPartnerData();
  }, [navigate]);

  const fetchPartnerData = async () => {
    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(getApiUrl('/partners/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('partnerToken');
          navigate('/partners/login');
          return;
        }
        throw new Error('Failed to fetch partner data');
      }
      
      const data = await response.json();
      setPartner(data);
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerData');
    navigate('/partners/login');
  };

  const menuItems = [
    { path: '/partners/dashboard', icon: LayoutDashboard, label: 'סקירה כללית' },
    { path: '/partners/dashboard/stores', icon: Store, label: 'חנויות' },
    { path: '/partners/dashboard/commissions', icon: DollarSign, label: 'עמלות' },
    { path: '/partners/dashboard/payouts', icon: CreditCard, label: 'משיכות' },
    { path: '/partners/dashboard/analytics', icon: BarChart3, label: 'אנליטיקה' },
    { path: '/partners/dashboard/resources', icon: BookOpen, label: 'משאבים' },
    { path: '/partners/dashboard/settings', icon: Settings, label: 'הגדרות' }
  ];

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'GOLD':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'SILVER':
        return <Medal className="w-5 h-5 text-gray-400" />;
      default:
        return <Medal className="w-5 h-5 text-orange-600" />;
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case 'GOLD':
        return 'זהב';
      case 'SILVER':
        return 'כסף';
      default:
        return 'ברונזה';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-64 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-200 ease-in-out z-50 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center relative">
              <Link to="/partners/dashboard" className="flex flex-col items-center">
                <img src={logo} alt="QuickShop" className="h-8 w-auto" />
                <span className="text-sm font-semibold text-gray-600 mt-1">Partners</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 absolute left-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* User Info */}
          {partner && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {partner.firstName?.[0]}{partner.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {partner.firstName} {partner.lastName}
                  </p>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {getTierIcon(partner.tier)}
                    <span className="text-sm text-gray-600">{getTierName(partner.tier)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                קוד הפניה: <span className="font-mono font-bold">{partner.referralCode}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/partners/dashboard' && location.pathname.startsWith(item.path));
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">התנתק</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:mr-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-900 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-4 space-x-reverse mr-auto lg:mr-0">
                <Link
                  to="/partners/dashboard/stores/new"
                  className="text-black px-6 py-3 rounded-xl flex items-center space-x-2 space-x-reverse hover:opacity-90 transition-all duration-200 shadow-lg font-medium"
                  style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}
                >
                  <Plus className="w-5 h-5" />
                  <span>חנות חדשה</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<PartnerOverview partner={partner} />} />
            <Route path="/stores/*" element={<PartnerStores partner={partner} />} />
            <Route path="/commissions" element={<PartnerCommissions partner={partner} />} />
            <Route path="/payouts" element={<PayoutRequests partner={partner} />} />
            <Route path="/analytics" element={<PartnerAnalytics partner={partner} />} />
            <Route path="/resources" element={<PartnerResources partner={partner} />} />
            <Route path="/settings" element={<PartnerSettings partner={partner} onUpdate={fetchPartnerData} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default PartnersDashboard;
