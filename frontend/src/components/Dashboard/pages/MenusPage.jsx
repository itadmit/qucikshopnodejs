import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

const MenusPage = () => {
  const { t } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState('main');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [menus, setMenus] = useState({
    main: {
      id: 'main',
      name: 'תפריט ראשי',
      handle: 'main-menu',
      items: [
        {
          id: '1',
          title: 'בית',
          type: 'page',
          url: '/',
          target: '_self',
          children: []
        },
        {
          id: '2',
          title: 'מוצרים',
          type: 'collection',
          url: '/products',
          target: '_self',
          children: [
            {
              id: '2-1',
              title: 'אלקטרוניקה',
              type: 'collection',
              url: '/categories/electronics',
              target: '_self',
              children: []
            },
            {
              id: '2-2',
              title: 'ביגוד',
              type: 'collection',
              url: '/categories/clothing',
              target: '_self',
              children: []
            }
          ]
        },
        {
          id: '3',
          title: 'אודות',
          type: 'page',
          url: '/about',
          target: '_self',
          children: []
        },
        {
          id: '4',
          title: 'צור קשר',
          type: 'page',
          url: '/contact',
          target: '_self',
          children: []
        }
      ]
    },
    footer: {
      id: 'footer',
      name: 'תפריט פוטר',
      handle: 'footer-menu',
      items: [
        {
          id: 'f1',
          title: 'מדיניות פרטיות',
          type: 'page',
          url: '/privacy',
          target: '_self',
          children: []
        },
        {
          id: 'f2',
          title: 'תנאי שימוש',
          type: 'page',
          url: '/terms',
          target: '_self',
          children: []
        }
      ]
    }
  });

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'page',
    url: '',
    target: '_self'
  });
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [showNewMenuForm, setShowNewMenuForm] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  const handleSaveMenu = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Save menu to backend
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

  const linkTypes = [
    { value: 'page', label: t('menus.linkTypes.page') || 'עמוד', icon: FileText },
    { value: 'collection', label: t('menus.linkTypes.collection') || 'קטגוריה', icon: Grid3X3 },
    { value: 'product', label: t('menus.linkTypes.product') || 'מוצר', icon: ShoppingBag },
    { value: 'custom', label: t('menus.linkTypes.custom') || 'קישור מותאם', icon: ExternalLink },
    { value: 'home', label: t('menus.linkTypes.home') || 'עמוד הבית', icon: Home }
  ];

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;

    const item = {
      id: Date.now().toString(),
      title: newItem.title,
      type: newItem.type,
      url: newItem.url || generateUrl(newItem.type, newItem.title),
      target: newItem.target,
      children: []
    };

    setMenus(prev => ({
      ...prev,
      [selectedMenu]: {
        ...prev[selectedMenu],
        items: [...prev[selectedMenu].items, item]
      }
    }));

    setNewItem({ title: '', type: 'page', url: '', target: '_self' });
    setIsAddingItem(false);
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

  const handleDeleteItem = (itemId, parentId = null) => {
    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      
      if (parentId) {
        // Delete from submenu
        const parentItem = menu.items.find(item => item.id === parentId);
        if (parentItem) {
          parentItem.children = parentItem.children.filter(child => child.id !== itemId);
        }
      } else {
        // Delete from main menu
        menu.items = menu.items.filter(item => item.id !== itemId);
      }

      return { ...prev, [selectedMenu]: menu };
    });
  };

  const handleEditItem = (item, parentId = null) => {
    setEditingItem({ ...item, parentId });
    setNewItem({
      title: item.title,
      type: item.type,
      url: item.url,
      target: item.target
    });
  };

  const handleUpdateItem = () => {
    if (!newItem.title.trim()) return;

    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      
      if (editingItem.parentId) {
        // Update submenu item
        const parentItem = menu.items.find(item => item.id === editingItem.parentId);
        if (parentItem) {
          const childIndex = parentItem.children.findIndex(child => child.id === editingItem.id);
          if (childIndex !== -1) {
            parentItem.children[childIndex] = {
              ...parentItem.children[childIndex],
              title: newItem.title,
              type: newItem.type,
              url: newItem.url || generateUrl(newItem.type, newItem.title),
              target: newItem.target
            };
          }
        }
      } else {
        // Update main menu item
        const itemIndex = menu.items.findIndex(item => item.id === editingItem.id);
        if (itemIndex !== -1) {
          menu.items[itemIndex] = {
            ...menu.items[itemIndex],
            title: newItem.title,
            type: newItem.type,
            url: newItem.url || generateUrl(newItem.type, newItem.title),
            target: newItem.target
          };
        }
      }

      return { ...prev, [selectedMenu]: menu };
    });

    setEditingItem(null);
    setNewItem({ title: '', type: 'page', url: '', target: '_self' });
  };

  const handleAddSubmenuItem = (parentId) => {
    const item = {
      id: `${parentId}-${Date.now()}`,
      title: t('menus.newItem') || 'פריט חדש',
      type: 'page',
      url: '/new-item',
      target: '_self',
      children: []
    };

    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      const parentItem = menu.items.find(item => item.id === parentId);
      if (parentItem) {
        parentItem.children.push(item);
      }
      return { ...prev, [selectedMenu]: menu };
    });
  };

  // Drag & Drop Functions
  const handleDragStart = (e, item, parentId = null) => {
    setDraggedItem({ item, parentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem, targetParentId = null) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.item.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      
      // Remove item from original position
      if (draggedItem.parentId) {
        const originalParent = menu.items.find(item => item.id === draggedItem.parentId);
        if (originalParent) {
          originalParent.children = originalParent.children.filter(child => child.id !== draggedItem.item.id);
        }
      } else {
        menu.items = menu.items.filter(item => item.id !== draggedItem.item.id);
      }

      // Add item to new position
      if (targetParentId) {
        const targetParent = menu.items.find(item => item.id === targetParentId);
        if (targetParent) {
          const targetIndex = targetParent.children.findIndex(child => child.id === targetItem.id);
          targetParent.children.splice(targetIndex, 0, draggedItem.item);
        }
      } else {
        const targetIndex = menu.items.findIndex(item => item.id === targetItem.id);
        menu.items.splice(targetIndex, 0, draggedItem.item);
      }

      return { ...prev, [selectedMenu]: menu };
    });

    setDraggedItem(null);
  };

  // Toggle submenu expansion
  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Duplicate menu item
  const handleDuplicateItem = (item, parentId = null) => {
    const duplicatedItem = {
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      title: `${item.title} - ${t('menus.copy') || 'עותק'}`,
      children: item.children ? [...item.children] : []
    };

    setMenus(prev => {
      const menu = { ...prev[selectedMenu] };
      
      if (parentId) {
        const parentItem = menu.items.find(item => item.id === parentId);
        if (parentItem) {
          const itemIndex = parentItem.children.findIndex(child => child.id === item.id);
          parentItem.children.splice(itemIndex + 1, 0, duplicatedItem);
        }
      } else {
        const itemIndex = menu.items.findIndex(menuItem => menuItem.id === item.id);
        menu.items.splice(itemIndex + 1, 0, duplicatedItem);
      }

      return { ...prev, [selectedMenu]: menu };
    });
  };

  const renderMenuItem = (item, level = 0, parentId = null) => {
    const Icon = linkTypes.find(type => type.value === item.type)?.icon || FileText;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id] !== false; // Default to expanded
    
    return (
      <div key={item.id} className={`${level > 0 ? 'mr-6' : ''}`}>
        <div 
          className={`flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-2 hover:shadow-sm transition-all cursor-move ${
            draggedItem?.item.id === item.id ? 'opacity-50 scale-95' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, item, parentId)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item, parentId)}
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            
            {/* Expand/Collapse for items with children */}
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(item.id)}
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
                  {t('menus.opensInNewTab') || 'נפתח בטאב חדש'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Visibility toggle */}
            <button
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title={t('menus.toggleVisibility') || 'הצג/הסתר'}
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {/* Duplicate */}
            <button
              onClick={() => handleDuplicateItem(item, parentId)}
              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              title={t('menus.duplicate') || 'שכפל'}
            >
              <Plus className="w-4 h-4" />
            </button>
            
            {/* Add submenu (only for level 0) */}
            {level === 0 && (
              <button
                onClick={() => handleAddSubmenuItem(item.id)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title={t('menus.addSubmenu') || 'הוסף תת-תפריט'}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            
            {/* Edit */}
            <button
              onClick={() => handleEditItem(item, parentId)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title={t('menus.edit') || 'ערוך'}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            {/* Delete with confirmation */}
            <button
              onClick={() => setShowDeleteConfirm(item.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title={t('menus.delete') || 'מחק'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm === item.id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('menus.confirmDelete') || 'אישור מחיקה'}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('menus.deleteWarning') || 'האם אתה בטוח שברצונך למחוק את הפריט'} "{item.title}"?
                {hasChildren && (
                  <span className="block text-red-600 mt-2">
                    {t('menus.deleteChildrenWarning') || 'פעולה זו תמחק גם את כל תת-הפריטים.'}
                  </span>
                )}
              </p>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => {
                    handleDeleteItem(item.id, parentId);
                    setShowDeleteConfirm(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('menus.confirmDeleteButton') || 'מחק'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('menus.cancel') || 'ביטול'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Children (submenu items) */}
        {hasChildren && isExpanded && (
          <div className="mr-4 mt-2 border-r-2 border-gray-100 pr-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">
              {t('menus.submenuItems') || 'פריטי תת-תפריט'}
            </div>
            {item.children.map(child => renderMenuItem(child, level + 1, item.id))}
          </div>
        )}
      </div>
    );
  };

  const renderAddItemForm = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-gray-900 mb-4">
        {editingItem ? t('menus.editItem') || 'ערוך פריט' : t('menus.addNewItem') || 'הוסף פריט חדש'}
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
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingLeft: '2.5rem'
            }}
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
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingLeft: '2.5rem'
            }}
          >
            <option value="_self">באותו חלון</option>
            <option value="_blank">בחלון חדש</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-3 rtl:space-x-reverse mt-6">
        <button
          onClick={editingItem ? handleUpdateItem : handleAddItem}
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
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('menus.title') || 'ניהול תפריטים'}</h1>
        <p className="text-gray-600">{t('menus.subtitle') || 'נהל את התפריטים של החנות שלך'}</p>
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
              {t('menus.newMenu') || 'תפריט חדש'}
            </button>

            {/* New Menu Form Modal */}
            {showNewMenuForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('menus.createNewMenu') || 'צור תפריט חדש'}
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('menus.menuName') || 'שם התפריט'}
                    </label>
                    <input
                      type="text"
                      value={newMenuName}
                      onChange={(e) => setNewMenuName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('menus.menuNamePlaceholder') || 'לדוגמה: תפריט פוטר'}
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-3 rtl:space-x-reverse">
                    <button
                      onClick={() => {
                        if (newMenuName.trim()) {
                          const menuId = newMenuName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
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
                      {t('menus.create') || 'צור'}
                    </button>
                    <button
                      onClick={() => {
                        setNewMenuName('');
                        setShowNewMenuForm(false);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {t('menus.cancel') || 'ביטול'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">תצוגה מקדימה</h3>
            <button
              onClick={() => window.open('http://yogevstore.localhost:5173/', '_blank')}
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
          {(isAddingItem || editingItem) && renderAddItemForm()}

          {/* Menu Items */}
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
              menus[selectedMenu]?.items.map(item => renderMenuItem(item))
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
    </div>
  );
};

export default MenusPage; 