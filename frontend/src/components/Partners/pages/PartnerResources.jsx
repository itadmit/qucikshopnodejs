import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  Download,
  ExternalLink,
  Search,
  Filter,
  FileText,
  Video,
  Image,
  Code,
  Users,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Star,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';

const PartnerResources = ({ partner }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'הכל', icon: BookOpen },
    { id: 'guides', label: 'מדריכים', icon: FileText },
    { id: 'videos', label: 'סרטונים', icon: Video },
    { id: 'marketing', label: 'שיווק', icon: Target },
    { id: 'technical', label: 'טכני', icon: Code },
    { id: 'tips', label: 'טיפים', icon: Lightbulb }
  ];

  const resources = [
    {
      id: 1,
      title: 'מדריך התחלה לשותפים',
      description: 'כל מה שצריך לדעת כדי להתחיל להרוויח עם QuickShop Partners',
      category: 'guides',
      type: 'pdf',
      duration: '15 דקות קריאה',
      rating: 4.8,
      downloadUrl: '#',
      featured: true
    },
    {
      id: 2,
      title: 'איך ליצור חנות מושלמת ללקוח',
      description: 'טיפים ושיטות עבודה ליצירת חנויות שמוכרות',
      category: 'guides',
      type: 'article',
      duration: '10 דקות קריאה',
      rating: 4.9,
      url: '#'
    },
    {
      id: 3,
      title: 'וובינר: אסטרטגיות שיווק לשותפים',
      description: 'הקלטה של וובינר על איך למצוא לקוחות ולהגדיל הכנסות',
      category: 'videos',
      type: 'video',
      duration: '45 דקות',
      rating: 4.7,
      url: '#',
      featured: true
    },
    {
      id: 4,
      title: 'תבניות מייל לפנייה ללקוחות',
      description: 'תבניות מוכנות לפנייה ללקוחות פוטנציאליים',
      category: 'marketing',
      type: 'template',
      duration: '5 דקות',
      rating: 4.6,
      downloadUrl: '#'
    },
    {
      id: 5,
      title: 'API למתקדמים',
      description: 'תיעוד מלא של ה-API לשותפים מתקדמים',
      category: 'technical',
      type: 'documentation',
      duration: '30 דקות קריאה',
      rating: 4.5,
      url: '#'
    },
    {
      id: 6,
      title: '10 טיפים להגדלת המרות',
      description: 'טיפים מוכחים להגדלת שיעור ההמרה של הלקוחות שלך',
      category: 'tips',
      type: 'article',
      duration: '8 דקות קריאה',
      rating: 4.8,
      url: '#'
    }
  ];

  const supportChannels = [
    {
      title: 'צ\'אט חי',
      description: 'קבל תמיכה מיידית מהצוות שלנו',
      icon: MessageCircle,
      availability: 'ב-24/7',
      action: 'פתח צ\'אט',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'מייל תמיכה',
      description: 'שלח לנו שאלה ונחזור אליך תוך 24 שעות',
      icon: Mail,
      availability: 'תגובה תוך 24 שעות',
      action: 'שלח מייל',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'שיחת טלפון',
      description: 'תיאום שיחה אישית עם מומחה שותפים',
      icon: Phone,
      availability: 'א\'-ה\' 9:00-18:00',
      action: 'תיאום שיחה',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'template':
        return <Image className="w-5 h-5" />;
      case 'documentation':
        return <Code className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter(resource => resource.featured);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">משאבים והדרכות</h1>
        <p className="text-gray-600 mt-2">כל מה שצריך כדי להצליח כשותף QuickShop</p>
      </div>

      {/* Featured Resources */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">משאבים מומלצים</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resource.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {resource.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    מומלץ
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <div className="flex gap-3">
                  {resource.downloadUrl && (
                    <button className="text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200 shadow font-medium flex items-center gap-2"
                            style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
                      <Download className="w-4 h-4" />
                      הורד
                    </button>
                  )}
                  {resource.url && (
                    <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition font-medium">
                      <ExternalLink className="w-4 h-4" />
                      צפה
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש במשאבים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{resource.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {resource.rating}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              <div className="flex gap-2">
                {resource.downloadUrl && (
                  <button className="flex-1 text-black px-3 py-2 rounded-lg hover:opacity-90 transition-all duration-200 shadow text-sm font-medium flex items-center justify-center gap-1"
                          style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
                    <Download className="w-3 h-3" />
                    הורד
                  </button>
                )}
                {resource.url && (
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                    <ExternalLink className="w-3 h-3" />
                    צפה
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Support Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">צריך עזרה?</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${channel.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{channel.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{channel.description}</p>
                    <p className="text-xs text-gray-500 mb-3">{channel.availability}</p>
                    <button className="text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200 shadow text-sm font-medium flex items-center gap-2"
                            style={{ background: 'linear-gradient(rgb(251, 236, 227) 0%, rgb(234, 206, 255) 100%)' }}>
                      {channel.action}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
            <div className="text-sm text-gray-600">משאבים זמינים</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">1,200+</div>
            <div className="text-sm text-gray-600">שותפים פעילים</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">4.8/5</div>
            <div className="text-sm text-gray-600">דירוג שביעות רצון</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerResources;