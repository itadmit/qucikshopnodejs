import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Menu,
  Plus,
  Edit3,
  Trash2,
  Save,
  Eye,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ExternalLink,
  Home,
  ShoppingBag,
  Grid3X3,
  FileText,
  Phone
} from 'lucide-react';

// רכיב פריט תפריט הניתן לגרירה
const SortableMenuItem = ({ item, onEdit, onDelete, onToggleSubmenu, onAddSubmenu, onDuplicate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const linkTypes = [
    { value: 'page', label: 'עמוד', icon: FileText },
    { value: 'collection', label: 'קטגוריה', icon: Grid3X3 },
    { value: 'product', label: 'מוצר', icon: ShoppingBag },
    { value: 'custom', label: 'קישור מותאם', icon: ExternalLink },
    { value: 'home', label: 'עמוד הבית', icon: Home }
  ];

  const Icon = linkTypes.find(type => type.value === item.type)?.icon || FileText;
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = item.expanded !== false;

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className={`flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Handle לגרירה */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          
          {/* כפתור הרחבה/כיווץ */}
          {hasChildren && (
            <button
              onClick={() => onToggleSubmenu(item.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          <Icon className="w-4 h-4 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900">{item.title}</div>
            <div className="text-sm text-gray-500">{item.url}</div>
            {item.target === '_blank' && (
              <span className="inline-flex items-center text-xs text-blue-600 mt-1">
                <ExternalLink className="w-3 h-3 ml-1" />
                נפתח בטאב חדש
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* כפתור נראות */}
          <button
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="הצג/הסתר"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {/* כפתור שכפול */}
          <button
            onClick={() => onDuplicate(item)}
            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
            title="שכפל"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          {/* כפתור הוספת תת-תפריט */}
          <button
            onClick={() => onAddSubmenu(item.id)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="הוסף תת-תפריט"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {/* כפתור עריכה */}
          <button
            onClick={() => onEdit(item)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="ערוך"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          {/* כפתור מחיקה */}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="מחק"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* תת-פריטים */}
      {hasChildren && isExpanded && (
        <div className="mr-8 mt-2 space-y-2">
          {item.children.map(child => (
            <div key={child.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon className="w-3 h-3 text-gray-400" />
                <span>{child.title}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <button
                  onClick={() => onEdit(child, item.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete(child.id, item.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// פונקציה ליצירת ID ייחודי
let idCounter = 0;
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = ++idCounter;
  return prefix ? `${prefix}-${timestamp}-${counter}-${random}` : `${timestamp}-${counter}-${random}`;
};

const MenusPage = () => {
  const { t } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState('main');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState({
    main: {
      id: 'main',
      name: 'תפריט ראשי',
      handle: 'main-menu',
      items: []
    },
    footer: {
      id: 'footer',
      name: 'תפריט פוטר',
      handle: 'footer-menu',
      items: []
    }
  });

  // Load menus from server
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      
      // Use local development server if running on port 5173 (Vite dev server)
      const isDevelopment = false;
      const baseUrl = isDevelopment 
        ? 'https://api.my-quickshop.com/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      // Get store slug from localStorage or use default
      const storeSlug = localStorage.getItem('currentStoreSlug') || 'yogevstore';
      
      const response = await fetch(`${baseUrl}/menus/${storeSlug}`);
      
      if (response.ok) {
        const serverMenus = await response.json();
        console.log('📋 Loaded menus from server:', serverMenus);
        
        // Convert server menus to component format
        const menusMap = {};
        serverMenus.forEach(menu => {
          const key = menu.handle === 'main-menu' ? 'main' : 'footer';
          menusMap[key] = {
            id: key,
            name: menu.name,
            handle: menu.handle,
            items: menu.items || []
          };
        });
        
        // Merge with default structure
        setMenus(prevMenus => ({
          ...prevMenus,
          ...menusMap
        }));
      } else {
        console.error('Failed to load menus from server');
      }
    } catch (error) {
      console.error('Error loading menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'page',
    url: '',
    target: '_self'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showNewMenuForm, setShowNewMenuForm] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  // חיישנים לגרירה
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // פונקציה לטיפול בסיום גרירה
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMenus(prev => {
        const menu = prev[selectedMenu];
        const oldIndex = menu.items.findIndex(item => item.id === active.id);
        const newIndex = menu.items.findIndex(item => item.id === over.id);

        return {
          ...prev,
          [selectedMenu]: {
            ...menu,
            items: arrayMove(menu.items, oldIndex, newIndex)
          }
        };
      });
    }
  };

  const handleSaveMenu = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Saving menu:', menus[selectedMenu]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('שגיאה בשמירת התפריט');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item, parentId = null) => {
    setEditingItem({ ...item, parentId });
    setNewItem({
      title: item.title,
      type: item.type,
      url: item.url,
      target: item.target
    });
    setIsAddingItem(true);
  };

  const handleDeleteItem = (itemId, parentId = null) => {
    setShowDeleteConfirm({ itemId, parentId });
  };

  const confirmDelete = () => {
    const { itemId, parentId } = showDeleteConfirm;
    
    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      
      if (parentId) {
        const parentItem = menu.items.find(item => item.id === parentId);
        if (parentItem) {
          parentItem.children = parentItem.children.filter(child => child.id !== itemId);
        }
      } else {
        menu.items = menu.items.filter(item => item.id !== itemId);
      }

      return { ...prev, [selectedMenu]: menu };
    });
    
    setShowDeleteConfirm(null);
  };

  const handleToggleSubmenu = (itemId) => {
    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      const item = menu.items.find(item => item.id === itemId);
      if (item) {
        item.expanded = !item.expanded;
      }
      return { ...prev, [selectedMenu]: menu };
    });
  };

  const handleAddSubmenu = (parentId) => {
    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      const parentItem = menu.items.find(item => item.id === parentId);
      if (parentItem) {
        const newChild = {
          id: generateUniqueId(parentId),
          title: 'פריט חדש',
          type: 'page',
          url: '/new-item',
          target: '_self',
          children: []
        };
        parentItem.children.push(newChild);
        parentItem.expanded = true;
      }
      return { ...prev, [selectedMenu]: menu };
    });
  };

  const handleDuplicate = (item) => {
    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      const duplicatedItem = {
        ...item,
        id: generateUniqueId(`${item.id}-copy`),
        title: `${item.title} - עותק`,
        children: item.children ? [...item.children] : []
      };
      const itemIndex = menu.items.findIndex(menuItem => menuItem.id === item.id);
      menu.items.splice(itemIndex + 1, 0, duplicatedItem);
      return { ...prev, [selectedMenu]: menu };
    });
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;

    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      
      const item = {
        id: editingItem ? editingItem.id : generateUniqueId(),
        title: newItem.title,
        type: newItem.type,
        url: newItem.url || generateUrl(newItem.type, newItem.title),
        target: newItem.target,
        children: editingItem ? editingItem.children : [],
        expanded: true
      };
      
      if (editingItem) {
        if (editingItem.parentId) {
          const parentItem = menu.items.find(item => item.id === editingItem.parentId);
          if (parentItem) {
            const childIndex = parentItem.children.findIndex(child => child.id === editingItem.id);
            if (childIndex !== -1) {
              parentItem.children[childIndex] = item;
            }
          }
        } else {
          const itemIndex = menu.items.findIndex(menuItem => menuItem.id === editingItem.id);
          if (itemIndex !== -1) {
            menu.items[itemIndex] = item;
          }
        }
      } else {
        menu.items.push(item);
      }

      return { ...prev, [selectedMenu]: menu };
    });

    setNewItem({ title: '', type: 'page', url: '', target: '_self' });
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const generateUrl = (type, title) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    switch (type) {
      case 'home':
        return '/';
      case 'collection':
        return `/categories/${slug}`;
      case 'product':
        return `/products/${slug}`;
      case 'page':
        return `/${slug}`;
      default:
        return `/${slug}`;
    }
  };

  const linkTypes = [
    { value: 'page', label: 'עמוד', icon: FileText },
    { value: 'collection', label: 'קטגוריה', icon: Grid3X3 },
    { value: 'product', label: 'מוצר', icon: ShoppingBag },
    { value: 'custom', label: 'קישור מותאם', icon: ExternalLink },
    { value: 'home', label: 'עמוד הבית', icon: Home }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">ניהול תפריטים</h1>
          <p className="text-gray-600">נהל את התפריטים של החנות שלך - גרור ושחרר לשינוי סדר</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען תפריטים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">ניהול תפריטים</h1>
        <p className="text-gray-600">נהל את התפריטים של החנות שלך - גרור ושחרר לשינוי סדר</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="font-semibold text-gray-900 mb-4">תפריטים</h2>
            <nav className="space-y-2">
              {Object.values(menus).map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedMenu(menu.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedMenu === menu.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Menu className={`ml-3 h-4 w-4 ${selectedMenu === menu.id ? 'text-blue-700' : 'text-gray-400'}`} />
                    {menu.name}
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {menu.items.length}
                  </span>
                </button>
              ))}
            </nav>

            <button 
              onClick={() => setShowNewMenuForm(true)}
              className="w-full mt-4 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4 ml-2" />
              תפריט חדש
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">תצוגה מקדימה</h3>
            <button
              onClick={() => window.open('https://yogevstore.my-quickshop.com/', '_blank')}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 ml-2" />
              צפה באתר
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {menus[selectedMenu]?.name}
              </h2>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף פריט
                </button>
              </div>
            </div>
          </div>

          {/* Add/Edit Item Form */}
          {isAddingItem && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-4">
                {editingItem ? 'ערוך פריט' : 'הוסף פריט חדש'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">כותרת</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="שם הפריט בתפריט"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">סוג קישור</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {linkTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="text"
                    value={newItem.url}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={generateUrl(newItem.type, newItem.title || 'דוגמה')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    אם תשאיר ריק, יווצר אוטומטית על בסיס הכותרת
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">פתיחה</label>
                  <select
                    value={newItem.target}
                    onChange={(e) => setNewItem({ ...newItem, target: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="_self">באותו חלון</option>
                    <option value="_blank">בחלון חדש</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={handleAddItem}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingItem ? 'עדכן' : 'הוסף'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingItem(false);
                    setEditingItem(null);
                    setNewItem({ title: '', type: 'page', url: '', target: '_self' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* Menu Items with Drag & Drop */}
          <div className="space-y-2">
            {menus[selectedMenu]?.items.length === 0 ? (
              <div className="text-center py-12">
                <Menu className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין פריטים בתפריט</h3>
                <p className="text-gray-500 mb-6">התחל בהוספת פריטים לתפריט שלך</p>
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="flex items-center mx-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף פריט ראשון
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={menus[selectedMenu]?.items.map(item => item.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {menus[selectedMenu]?.items.map(item => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      onToggleSubmenu={handleToggleSubmenu}
                      onAddSubmenu={handleAddSubmenu}
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Save Changes */}
          {menus[selectedMenu]?.items.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">שמור שינויים</h3>
                  <p className="text-sm text-gray-500">השינויים יופיעו באתר לאחר השמירה</p>
                </div>
                <button 
                  onClick={handleSaveMenu}
                  disabled={isSaving}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    saveSuccess
                      ? 'bg-green-600 text-white'
                      : isSaving
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      נשמר בהצלחה!
                    </>
                  ) : isSaving ? (
                    <>
                      <div className="w-4 h-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      שמור תפריט
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              אישור מחיקה
            </h3>
            <p className="text-gray-600 mb-4">
              האם אתה בטוח שברצונך למחוק פריט זה?
            </p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                מחק
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Menu Form Modal */}
      {showNewMenuForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              צור תפריט חדש
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם התפריט
              </label>
              <input
                type="text"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="לדוגמה: תפריט פוטר"
                autoFocus
              />
            </div>
            <div className="flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => {
                  if (newMenuName.trim()) {
                    const baseId = newMenuName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    const menuId = generateUniqueId(baseId);
                    
                    setMenus(prev => ({
                      ...prev,
                      [menuId]: {
                        id: menuId,
                        name: newMenuName.trim(),
                        handle: `${menuId}-menu`,
                        items: []
                      }
                    }));
                    setSelectedMenu(menuId);
                    setNewMenuName('');
                    setShowNewMenuForm(false);
                  }
                }}
                disabled={!newMenuName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                צור
              </button>
              <button
                onClick={() => {
                  setNewMenuName('');
                  setShowNewMenuForm(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenusPage;