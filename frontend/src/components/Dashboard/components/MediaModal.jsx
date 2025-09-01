import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Video, FileText, Search, Grid, List, Trash2, Eye, Download, Check } from 'lucide-react';
import apiService from '../../../services/api.js';
import { getApiUrl } from '../../../config/environment.js';

const MediaModal = ({ isOpen, onClose, onSelect, storeId, allowMultiple = false, selectedMedia = [] }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedItems, setSelectedItems] = useState(selectedMedia);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fixingFilenames, setFixingFilenames] = useState(false);

  // Fetch media from API
  const fetchMedia = async () => {
    setLoading(true);
    try {
      // Get current store dynamically
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No token found for fetching media');
        setLoading(false);
        return;
      }
      
      apiService.setToken(token);
      const userStores = await apiService.getUserStores();
      if (!userStores || userStores.length === 0) {
        console.error('No stores found for user');
        setLoading(false);
        return;
      }
      
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      const currentStore = selectedStoreId 
        ? userStores.find(store => store.id.toString() === selectedStoreId)
        : userStores[0];
      
      if (!currentStore) {
        console.error('No valid store found');
        setLoading(false);
        return;
      }
      
      const response = await apiService.get(`/media/store/${currentStore.id}`);
      setMedia(response.data?.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files.length) return;

    setUploading(true);
    const newProgress = {};

    try {
      // Get current store dynamically
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('שגיאה: לא נמצא טוקן אימות');
        setUploading(false);
        return;
      }
      
      apiService.setToken(token);
      const userStores = await apiService.getUserStores();
      if (!userStores || userStores.length === 0) {
        alert('שגיאה: לא נמצאו חנויות');
        setUploading(false);
        return;
      }
      
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      const currentStore = selectedStoreId 
        ? userStores.find(store => store.id.toString() === selectedStoreId)
        : userStores[0];
      
      if (!currentStore) {
        alert('שגיאה: לא נמצאה חנות תקינה');
        setUploading(false);
        return;
      }
      
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
        newProgress[file.name] = 0;
      });
      formData.append('storeId', currentStore.id.toString());
      formData.append('folder', 'media');

      setUploadProgress(newProgress);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(fileName => {
            if (updated[fileName] < 90) {
              updated[fileName] = Math.min(90, Math.round(updated[fileName] + Math.random() * 20));
            }
          });
          return updated;
        });
      }, 200);

      const baseUrl = getApiUrl('');
      
      const response = await fetch(`${baseUrl}/media/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Complete progress to 100%
      setUploadProgress(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(fileName => {
          updated[fileName] = 100;
        });
        return updated;
      });

      // Wait a moment to show completion
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);
      
      // Refresh media list
      await fetchMedia();
      
      // Show success message
      console.log(`✅ ${result.data.length} קבצים הועלו בהצלחה`);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('שגיאה בהעלאת הקבצים');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Handle media selection
  const handleMediaSelect = (mediaItem) => {
    if (allowMultiple) {
      const isSelected = selectedItems.some(item => item.id === mediaItem.id);
      if (isSelected) {
        setSelectedItems(selectedItems.filter(item => item.id !== mediaItem.id));
      } else {
        setSelectedItems([...selectedItems, mediaItem]);
      }
    } else {
      setSelectedItems([mediaItem]);
    }
  };

  // Fix Hebrew filenames
  const handleFixHebrewFilenames = async () => {
    if (!confirm('האם אתה בטוח שברצונך לתקן את שמות הקבצים בעברית? פעולה זו תעדכן את כל הקבצים במסד הנתונים.')) {
      return;
    }

    setFixingFilenames(true);
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = 'https://api.my-quickshop.com/api';
      
      const response = await fetch(`${baseUrl}/media/fix-hebrew-filenames`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fix filenames');
      }

      const result = await response.json();
      alert(`תוקנו ${result.fixedCount} שמות קבצים בהצלחה!`);
      
      // Refresh media list
      fetchMedia();
    } catch (error) {
      console.error('Fix filenames error:', error);
      alert('שגיאה בתיקון שמות הקבצים');
    } finally {
      setFixingFilenames(false);
    }
  };

  // Handle media deletion
  const handleDeleteMedia = async (mediaItem) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את התמונה הזו?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = 'https://api.my-quickshop.com/api';
      
      const response = await fetch(`${baseUrl}/media/${mediaItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Remove from local state
      setMedia(media.filter(item => item.id !== mediaItem.id));
      
      // Remove from selected items if it was selected
      setSelectedItems(selectedItems.filter(item => item.id !== mediaItem.id));
      
      console.log('✅ תמונה נמחקה בהצלחה');
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('שגיאה במחיקת התמונה');
    }
  };

  // Handle confirm selection
  const handleConfirm = () => {
    onSelect(allowMultiple ? selectedItems : selectedItems[0]);
    onClose();
  };

  // Filter media based on search
  const filteredMedia = media.filter(item => 
    item.originalFilename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.altText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get file type icon
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return ImageIcon;
    if (mimeType?.startsWith('video/')) return Video;
    return FileText;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">ספריית מדיה</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-white">
          {/* Top Row - Search and Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חיפוש קבצים"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <button 
                onClick={handleFixHebrewFilenames}
                disabled={fixingFilenames}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 space-x-reverse disabled:opacity-50"
              >
                {fixingFilenames ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>מתקן...</span>
                  </>
                ) : (
                  <span>תקן שמות עבריים</span>
                )}
              </button>
              
              <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1 space-x-reverse">
                <span>מיון</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>



          {/* Upload Area */}
          <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
            <div className="flex items-center justify-center">
              <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center space-x-2 space-x-reverse transition-colors text-sm font-medium">
                <span>הוסף מדיה</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-gray-500 text-sm mt-2">גרור ושחרר תמונות, וידאו ומודלים תלת מימדיים</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Upload Progress */}
          {uploading && Object.keys(uploadProgress).length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                <span className="text-blue-800 font-medium">מעלה קבצים...</span>
              </div>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="mb-2">
                  <div className="flex justify-between text-sm text-blue-700 mb-1">
                    <span className="truncate">{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">טוען מדיה...</p>
              </div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין קבצי מדיה</h3>
                <p className="text-gray-600">העלה קבצים כדי להתחיל</p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-6 gap-4' : 'space-y-2'}>
              {filteredMedia.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id);
                const FileIcon = getFileIcon(item.mimeType);
                const fileExtension = item.mimeType?.split('/')[1]?.toUpperCase() || 'FILE';

                return viewMode === 'grid' ? (
                  <div
                    key={item.id}
                    onClick={() => handleMediaSelect(item)}
                    className="relative group cursor-pointer"
                  >
                    {/* Image Container - Shopify Style */}
                    <div className={`relative bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : 'border border-gray-200 hover:shadow-md'
                    }`}>
                      {/* Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-white border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(item);
                          }}
                          className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                          title="מחק תמונה"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Image */}
                      <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                        {item.mimeType?.startsWith('image/') ? (
                          <img
                            src={item.s3Url}
                            alt={item.altText || item.originalFilename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileIcon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      
                      {/* File Info Footer - Clean White Background */}
                      <div className="p-3 bg-white border-t border-gray-100">
                        <div className="text-xs text-gray-900 font-medium truncate mb-1">
                          {item.originalFilename}
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between items-center">
                          <span>{fileExtension}</span>
                          <span>{formatFileSize(item.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    onClick={() => handleMediaSelect(item)}
                    className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.mimeType?.startsWith('image/') ? (
                        <img
                          src={item.s3Url}
                          alt={item.altText || item.originalFilename}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.originalFilename}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(item.fileSize)} • {new Date(item.createdAt).toLocaleDateString('he-IL')}</p>
                    </div>
                    
                    {isSelected && (
                      <div className="text-green-600">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 && (
              <span>{selectedItems.length} קבצים נבחרו</span>
            )}
          </div>
          
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              בחר ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
