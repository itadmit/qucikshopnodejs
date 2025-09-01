import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Download
} from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import { DashboardPageSkeleton } from '../components/Skeleton';

const PagesPage = ({ userStore }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    seoTitle: '',
    seoDescription: ''
  });

  // Define columns for DataTable
  const columns = [
    {
      key: 'title',
      header: 'כותרת',
      accessor: 'title',
      sortable: true,
      render: (page) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{page.title}</div>
          <div className="text-sm text-gray-500">/{page.slug}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'סטטוס',
      accessor: 'isPublished',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: true, label: 'מפורסם' },
        { value: false, label: 'טיוטה' }
      ],
      render: (page) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          page.isPublished 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {page.isPublished ? (
            <>
              <Eye className="w-3 h-3 ml-1" />
              מפורסם
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 ml-1" />
              טיוטה
            </>
          )}
        </span>
      )
    },
    {
      key: 'linkedInMenus',
      header: 'בתפריט',
      accessor: 'linkedInMenus',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: true, label: 'מקושר' },
        { value: false, label: 'לא מקושר' }
      ],
      render: (page) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          page.linkedInMenus 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {page.linkedInMenus ? 'מקושר' : 'לא מקושר'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'נוצר',
      accessor: 'createdAt',
      sortable: true,
      render: (page) => (
        <div className="text-sm text-gray-900">
          {new Date(page.createdAt).toLocaleDateString('he-IL')}
        </div>
      )
    },
    {
      key: 'updatedAt',
      header: 'עודכן',
      accessor: 'updatedAt',
      sortable: true,
      render: (page) => (
        <div className="text-sm text-gray-900">
          {new Date(page.updatedAt).toLocaleDateString('he-IL')}
        </div>
      )
    }
  ];

  useEffect(() => {
    if (userStore?.id) {
      fetchPages();
    }
  }, [userStore]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Use local development server if running on port 5173 (Vite dev server)
      const isDevelopment = false;
      const baseUrl = isDevelopment 
        ? 'https://api.my-quickshop.com/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      const response = await fetch(`${baseUrl}/pages/store/${userStore.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data);
      } else {
        console.error('נכשל בטעינת העמודים');
      }
    } catch (error) {
      console.error('שגיאה בטעינת העמודים:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (pageId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Use local development server if running on port 5173 (Vite dev server)
      const isDevelopment = false;
      const baseUrl = isDevelopment 
        ? 'https://api.my-quickshop.com/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      const response = await fetch(`${baseUrl}/pages/${pageId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchPages(); // רענון הרשימה
        alert('העמוד שוכפל בהצלחה!');
      } else {
        const error = await response.json();
        alert(`שגיאה בשכפול העמוד: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error('שגיאה בשכפול העמוד:', error);
      alert('שגיאה בשכפול העמוד');
    }
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      
      // Use local development server if running on port 5173 (Vite dev server)
      const isDevelopment = false;
      const baseUrl = isDevelopment 
        ? 'https://api.my-quickshop.com/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      const response = await fetch(`${baseUrl}/pages/${pageToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        await fetchPages(); // רענון הרשימה
        
        if (result.warning) {
          alert(`העמוד נמחק בהצלחה!\n\n⚠️ ${result.warning}`);
        } else {
          alert('העמוד נמחק בהצלחה!');
        }
      } else {
        const error = await response.json();
        alert(`שגיאה במחיקת העמוד: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error('שגיאה במחיקת העמוד:', error);
      alert('שגיאה במחיקת העמוד');
    } finally {
      setShowDeleteModal(false);
      setPageToDelete(null);
      setDeleteWarning('');
    }
  };

  const handleCreatePage = async () => {
    if (!newPageData.title.trim()) {
      alert('נא להזין כותרת לעמוד');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // Use local development server if running on port 5173 (Vite dev server)
      const isDevelopment = false;
      const baseUrl = isDevelopment 
        ? 'https://api.my-quickshop.com/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      const response = await fetch(`${baseUrl}/pages/store/${userStore.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newPageData.title,
          slug: newPageData.slug || newPageData.title.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u0590-\u05FF\-]/g, '')
            .replace(/^-+|-+$/g, ''),
          seoTitle: newPageData.seoTitle || newPageData.title,
          seoDescription: newPageData.seoDescription,
          content: { html: '<div><h1>' + newPageData.title + '</h1><p>תוכן העמוד יתווסף כאן...</p></div>' },
          isPublished: false
        })
      });

      if (response.ok) {
        const createdPage = await response.json();
        setShowCreateModal(false);
        setNewPageData({ title: '', slug: '', seoTitle: '', seoDescription: '' });
        
        // מעבר לבילדר עם העמוד החדש
        window.location.href = `/dashboard/builder?type=content&pageId=${createdPage.id}`;
      } else {
        const error = await response.json();
        alert(`שגיאה ביצירת העמוד: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error('שגיאה ביצירת העמוד:', error);
      alert('שגיאה ביצירת העמוד');
    }
  };

  const handleTogglePublish = async (page) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Use local development server if running on port 5173 (Vite dev server)
      const isDevelopment = false;
      const baseUrl = isDevelopment 
        ? 'https://api.my-quickshop.com/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      const response = await fetch(`${baseUrl}/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublished: !page.isPublished
        })
      });

      if (response.ok) {
        await fetchPages(); // רענון הרשימה
      } else {
        const error = await response.json();
        alert(`שגיאה בעדכון העמוד: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error('שגיאה בעדכון העמוד:', error);
      alert('שגיאה בעדכון העמוד');
    }
  };

  const openDeleteModal = (page) => {
    setPageToDelete(page);
    
    // בדיקה אם העמוד מקושר בתפריטים
    if (page.linkedInMenus && page.menuLinks?.length > 0) {
      const menuNames = page.menuLinks.map(menu => menu.name).join(', ');
      setDeleteWarning(`העמוד מקושר בתפריטים הבאים: ${menuNames}. מחיקת העמוד תשבור את הקישורים בתפריטים.`);
    } else {
      setDeleteWarning('');
    }
    
    setShowDeleteModal(true);
  };

  const handleEditInBuilder = (page) => {
    // ניווט לבילדר עם העמוד
    const builderUrl = `/dashboard/builder?page=${page.slug}&type=content`;
    window.location.href = builderUrl;
  };

  const handleViewPage = (page) => {
    // פתיחת העמוד בחלון חדש
    const pageUrl = `https://${userStore.slug}.my-quickshop.com/${page.slug}`;
    window.open(pageUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6">
        <DashboardPageSkeleton hasTable={true} tableRows={6} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">עמודים</h1>
          <p className="text-gray-600 mt-1">נהל את העמודים של החנות שלך</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
          עמוד חדש
        </button>
      </div>

      {/* Filters and Search - מוסר כי DataTable כולל את זה */}

      {/* Pages List */}
      <DataTable
        data={pages}
        columns={columns}
        title="רשימת עמודים"
        subtitle={`${pages.length} עמודים בסך הכל`}
        searchable={true}
        filterable={true}
        selectable={true}
        sortable={true}
        loading={loading}
        pagination={true}
        itemsPerPage={10}
        actions={[
          {
            label: 'ייצא עמודים',
            icon: Download,
            onClick: () => console.log('Export pages')
          },
          {
            label: 'עמוד חדש',
            icon: Plus,
            variant: 'primary',
            onClick: () => setShowCreateModal(true)
          }
        ]}
        bulkActions={[
          {
            label: 'פרסם עמודים',
            icon: Eye,
            onClick: (selectedIds) => console.log('Publish pages:', selectedIds)
          },
          {
            label: 'הסתר עמודים',
            icon: EyeOff,
            onClick: (selectedIds) => console.log('Hide pages:', selectedIds)
          },
          {
            label: 'מחק עמודים',
            icon: Trash2,
            onClick: (selectedIds) => {
              if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedIds.length} עמודים?`)) {
                console.log('Delete pages:', selectedIds);
              }
            }
          }
        ]}
        rowActions={[
          {
            label: 'ערוך עמוד',
            icon: Edit3,
            variant: 'primary',
            onClick: (page) => {
              window.location.href = `/dashboard/builder?type=content&pageId=${page.id}`;
            }
          },
          {
            label: 'צפה בעמוד',
            icon: ExternalLink,
            onClick: (page) => handleViewPage(page)
          },
          {
            label: 'שכפל עמוד',
            icon: Copy,
            onClick: (page) => handleDuplicate(page.id)
          },
          {
            label: 'מחק עמוד',
            icon: Trash2,
            variant: 'danger',
            onClick: (page) => {
              setPageToDelete(page);
              setShowDeleteModal(true);
            }
          }
        ]}
        onRowClick={(page) => {
          window.location.href = `/dashboard/builder?type=content&pageId=${page.id}`;
        }}
        emptyState={
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין עמודים עדיין</h3>
            <p className="text-gray-600 mb-4">צור את העמוד הראשון שלך</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              צור עמוד ראשון
            </button>
          </div>
        }
        className="shadow-sm"
      />

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">עמוד חדש</h3>
                             <button
                 onClick={() => {
                   setShowCreateModal(false);
                   setNewPageData({ title: '', slug: '', seoTitle: '', seoDescription: '' });
                 }}
                 className="text-gray-400 hover:text-gray-600"
               >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כותרת העמוד *
                </label>
                <input
                  type="text"
                  value={newPageData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                                         setNewPageData(prev => ({
                       ...prev,
                       title,
                       slug: prev.slug || title.toLowerCase()
                         .replace(/\s+/g, '-')
                         .replace(/[^\w\u0590-\u05FF\-]/g, '')
                         .replace(/^-+|-+$/g, ''),
                       seoTitle: prev.seoTitle || title
                     }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="הזן כותרת לעמוד"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (כתובת URL)
                </label>
                <input
                  type="text"
                  value={newPageData.slug}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="slug-of-page"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כותרת SEO
                </label>
                <input
                  type="text"
                  value={newPageData.seoTitle}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="כותרת לקידום באינטרנט"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור SEO
                </label>
                <textarea
                  value={newPageData.seoDescription}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="תיאור קצר לקידום באינטרנט"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
                             <button
                 onClick={() => {
                   setShowCreateModal(false);
                   setNewPageData({ title: '', slug: '', seoTitle: '', seoDescription: '' });
                 }}
                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
               >
                 ביטול
               </button>
              <button
                onClick={handleCreatePage}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                צור עמוד ועבור לעריכה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 ml-3 rtl:ml-0 rtl:mr-3" />
              <h3 className="text-lg font-medium text-gray-900">מחיקת עמוד</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              האם אתה בטוח שברצונך למחוק את העמוד "{pageToDelete?.title}"?
            </p>
            
            {deleteWarning && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-600 ml-2 rtl:ml-0 rtl:mr-2 mt-0.5" />
                  <p className="text-sm text-orange-800">{deleteWarning}</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ביטול
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                מחק עמוד
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesPage; 