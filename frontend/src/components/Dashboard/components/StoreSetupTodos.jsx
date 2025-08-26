import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Package, 
  Palette, 
  CreditCard, 
  Settings,
  Users,
  Globe,
  Camera,
  ShoppingCart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import apiService from '../../../services/api.js';

const StoreSetupTodos = ({ storeId }) => {
  const [todos, setTodos] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Define setup tasks
  const setupTasks = [
    {
      id: 'add_product',
      title: 'הוסף את המוצר הראשון שלך',
      description: 'צור מוצר ראשון כדי להתחיל למכור',
      icon: Package,
      color: '#3B82F6',
      actionText: 'הוסף מוצר',
      actionUrl: '/products/new',
      checkFunction: 'hasProducts'
    },
    {
      id: 'customize_theme',
      title: 'התאם את עיצוב החנות',
      description: 'שנה צבעים, לוגו ועיצוב כללי',
      icon: Palette,
      color: '#8B5CF6',
      actionText: 'התאם עיצוב',
      actionUrl: '/customize',
      checkFunction: 'hasCustomization'
    },
    {
      id: 'add_logo',
      title: 'העלה לוגו לחנות',
      description: 'הוסף לוגו מקצועי לחנות שלך',
      icon: Camera,
      color: '#F59E0B',
      actionText: 'העלה לוגו',
      actionUrl: '/settings/branding',
      checkFunction: 'hasLogo'
    },
    {
      id: 'setup_payment',
      title: 'הגדר אמצעי תשלום',
      description: 'חבר חשבון בנק או אמצעי תשלום',
      icon: CreditCard,
      color: '#10B981',
      actionText: 'הגדר תשלומים',
      actionUrl: '/settings/payments',
      checkFunction: 'hasPaymentMethod'
    },
    {
      id: 'add_domain',
      title: 'חבר דומיין מותאם אישית',
      description: 'הוסף דומיין משלך במקום הסאבדומיין',
      icon: Globe,
      color: '#EF4444',
      actionText: 'הוסף דומיין',
      actionUrl: '/settings/domain',
      checkFunction: 'hasCustomDomain'
    },
    {
      id: 'invite_team',
      title: 'הזמן חברי צוות',
      description: 'הוסף עובדים או שותפים לניהול החנות',
      icon: Users,
      color: '#6366F1',
      actionText: 'הזמן צוות',
      actionUrl: '/team',
      checkFunction: 'hasTeamMembers'
    },
    {
      id: 'first_order',
      title: 'קבל את ההזמנה הראשונה',
      description: 'בצע הזמנת בדיקה או חכה ללקוח ראשון',
      icon: ShoppingCart,
      color: '#EC4899',
      actionText: 'בדוק חנות',
      actionUrl: '/preview',
      checkFunction: 'hasOrders'
    }
  ];

  // Check completion status for each task
  const checkTaskCompletion = async () => {
    if (!storeId) {
      setTodos(setupTasks.map(task => ({ ...task, completed: false })));
      return;
    }

    try {
      const progress = await apiService.getStoreSetupProgress(storeId);
      
      const taskCompletionMap = {
        'add_product': progress.hasProducts,
        'customize_theme': progress.hasCustomization,
        'add_logo': progress.hasLogo,
        'setup_payment': progress.hasPaymentMethod,
        'add_domain': progress.hasCustomDomain,
        'invite_team': progress.hasTeamMembers,
        'first_order': progress.hasOrders
      };
      
      const updatedTodos = setupTasks.map(task => ({
        ...task,
        completed: taskCompletionMap[task.id] || false,
        completedAt: taskCompletionMap[task.id] ? new Date() : null
      }));
      
      const completed = updatedTodos.filter(task => task.completed).length;
      
      setTodos(updatedTodos);
      setCompletedCount(completed);
    } catch (error) {
      console.error('Error checking task completion:', error);
      setTodos(setupTasks.map(task => ({ ...task, completed: false })));
    }
  };

  useEffect(() => {
    checkTaskCompletion();
  }, [storeId]);

  const progressPercentage = Math.round((completedCount / setupTasks.length) * 100);

  const handleTaskClick = (task) => {
    if (!task.completed) {
      // Navigate to task action URL
      console.log(`Navigate to: ${task.actionUrl}`);
    }
  };

  const markAsCompleted = (taskId) => {
    setTodos(prev => prev.map(todo => 
      todo.id === taskId 
        ? { ...todo, completed: true, completedAt: new Date() }
        : todo
    ));
    setCompletedCount(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              {completedCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{completedCount}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">הגדרת החנות שלך</h3>
              <p className="text-sm text-gray-600">
                השלם {setupTasks.length - completedCount} משימות נוספות כדי להשיק את החנות
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{completedCount}/{setupTasks.length}</div>
              <div className="text-sm text-gray-500">הושלמו</div>
            </div>
            <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">התקדמות</span>
            <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-6 space-y-4">
            {todos.map((task, index) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 fade-in-up ${
                    task.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => handleTaskClick(task)}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      
                      {/* Task Icon */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${task.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: task.color }} />
                      </div>
                      
                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        <p className={`text-sm ${task.completed ? 'text-green-600' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                        {task.completed && task.completedAt && (
                          <p className="text-xs text-green-500 mt-1">
                            הושלם ב-{new Date(task.completedAt).toLocaleDateString('he-IL')}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      {!task.completed && (
                        <button
                          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:scale-105"
                          style={{ backgroundColor: task.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(task);
                          }}
                        >
                          {task.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Completion Animation Overlay */}
                  {task.completed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Completion Celebration */}
          {completedCount === setupTasks.length && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-t border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 כל הכבוד!</h3>
                <p className="text-gray-700 mb-4">השלמת את כל המשימות! החנות שלך מוכנה להשקה</p>
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200">
                  השק את החנות 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StoreSetupTodos;
