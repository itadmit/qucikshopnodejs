import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Grid, 
  List, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Copy,
  Image,
  Video,
  File,
  FolderOpen,
  Plus,
  X,
  Check
} from 'lucide-react';
import apiService from '../../../services/api.js';

const MediaLibraryPage = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [folderStats, setFolderStats] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    pages: 0
  });

  // Load media from server
  const loadMedia = async (page = 1) => {
    try {
      setLoading(true);
      
      // Get current store dynamically
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMedia([]);
        return;
      }
      
      apiService.setToken(token);
      const userStores = await apiService.getUserStores();
      if (!userStores || userStores.length === 0) {
        setMedia([]);
        return;
      }
      
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      const currentStore = selectedStoreId 
        ? userStores.find(store => store.id.toString() === selectedStoreId)
        : userStores[0];
      
      if (!currentStore) {
        setMedia([]);
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        folder: selectedFolder,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await apiService.get(`/media/store/${currentStore.id}?${params}`);
      
      if (response.success) {
        setMedia(response.data.media);
        setPagination(response.data.pagination);
        setFolderStats(response.data.folderStats);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [selectedFolder, searchTerm]);

  // Handle media selection
  const toggleMediaSelection = (mediaId) => {
    setSelectedMedia(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const selectAllMedia = () => {
    setSelectedMedia(media.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedMedia([]);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!selectedMedia.length) return;
    
    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedMedia.length} קבצים?`)) {
      try {
        // Delete each selected media item
        await Promise.all(
          selectedMedia.map(mediaId => 
            apiService.delete(`/media/${mediaId}`)
          )
        );
        
        // Reload media
        loadMedia(pagination.page);
        clearSelection();
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('שגיאה במחיקת הקבצים');
      }
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    toast.textContent = 'הקישור הועתק ללוח';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  // Get file type icon
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const folders = [
    { key: 'all', name: 'כל הקבצים', count: folderStats.all || 0 },
    { key: 'products', name: 'מוצרים', count: folderStats.products || 0 },
    { key: 'media', name: 'מדיה כללית', count: folderStats.media || 0 },
    { key: 'banners', name: 'באנרים', count: folderStats.banners || 0 },
    { key: 'logos', name: 'לוגואים', count: folderStats.logos || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ספריית מדיה</h1>
            <p className="text-gray-600 mt-1">נהל את כל הקבצים והתמונות של החנות</p>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            העלה קבצים
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חפש קבצים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedMedia.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-blue-700">{selectedMedia.length} נבחרו</span>
                <button
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={clearSelection}
                  className="text-gray-600 hover:text-gray-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Folders */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                תיקיות
              </h3>
            </div>
            <div className="p-2">
              {folders.map(folder => (
                <button
                  key={folder.key}
                  onClick={() => setSelectedFolder(folder.key)}
                  className={`w-full text-right px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedFolder === folder.key
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{folder.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {folder.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין קבצים</h3>
              <p className="text-gray-600 mb-4">התחל על ידי העלאת קבצים לספריית המדיה</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                העלה קבצים
              </button>
            </div>
          ) : (
            <>
              {/* Media Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {media.map(item => (
                    <div
                      key={item.id}
                      className={`group relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
                        selectedMedia.includes(item.id)
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleMediaSelection(item.id)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 right-2 z-10">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedMedia.includes(item.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {selectedMedia.includes(item.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Media Preview */}
                      <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100">
                        {item.mimeType.startsWith('image/') ? (
                          <img
                            src={item.url}
                            alt={item.altText || item.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : item.mimeType.startsWith('video/') ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(item.mimeType)}
                          </div>
                        )}
                      </div>

                      {/* Media Info */}
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.originalName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(item.size)}
                        </p>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.url, '_blank');
                            }}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.url);
                            }}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={item.url}
                            download={item.originalName}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="w-12 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedMedia.length === media.length}
                              onChange={() => selectedMedia.length === media.length ? clearSelection() : selectAllMedia()}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">תצוגה מקדימה</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">שם</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">סוג</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">גודל</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">תאריך</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-900">פעולות</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {media.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedMedia.includes(item.id)}
                                onChange={() => toggleMediaSelection(item.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                {item.mimeType.startsWith('image/') ? (
                                  <img
                                    src={item.url}
                                    alt={item.altText || item.originalName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    {getFileIcon(item.mimeType)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{item.originalName}</div>
                              {item.altText && (
                                <div className="text-xs text-gray-500">{item.altText}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getFileIcon(item.mimeType)}
                                <span className="text-sm text-gray-600">{item.mimeType.split('/')[1].toUpperCase()}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatFileSize(item.size)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(item.createdAt).toLocaleDateString('he-IL')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => window.open(item.url, '_blank')}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => copyToClipboard(item.url)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <a
                                  href={item.url}
                                  download={item.originalName}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    מציג {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} מתוך {pagination.total} קבצים
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadMedia(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      הקודם
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => loadMedia(page)}
                            className={`px-3 py-2 text-sm rounded-lg ${
                              pagination.page === page
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => loadMedia(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      הבא
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">העלה קבצים</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">גרור קבצים לכאן או לחץ לבחירה</p>
              <p className="text-sm text-gray-500">תמונות, וידאו - עד 10MB</p>
              
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                בחר קבצים
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryPage;

