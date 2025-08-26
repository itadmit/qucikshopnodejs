import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const MediaUploader = ({ onUpload, onDelete, media = [], maxFiles = 10 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (files.length + media.length > maxFiles) {
      alert(`ניתן להעלות עד ${maxFiles} קבצים`);
      return;
    }

    setUploading(true);
    const newProgress = {};

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
        newProgress[file.name] = 0;
      });
      formData.append('folder', 'products');

      setUploadProgress(newProgress);

      const response = await fetch('/api/media/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      const newMediaItems = result.data.map(uploadResult => ({
        id: Date.now() + Math.random(),
        url: uploadResult.url,
        key: uploadResult.key,
        type: uploadResult.mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        isPrimary: media.length === 0,
        altText: '',
        colorOptionValueId: null,
        originalName: uploadResult.originalName,
        size: uploadResult.size
      }));

      onUpload(newMediaItems);
      
      // Update progress to 100%
      Object.keys(newProgress).forEach(fileName => {
        newProgress[fileName] = 100;
      });
      setUploadProgress(newProgress);

    } catch (error) {
      console.error('Upload error:', error);
      alert('שגיאה בהעלאת הקבצים');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 2000);
    }
  };

  const handleDelete = async (mediaItem) => {
    try {
      if (mediaItem.key) {
        const response = await fetch(`/api/media/delete/${encodeURIComponent(mediaItem.key)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Delete failed');
        }
      }
      onDelete(mediaItem.id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('שגיאה במחיקת הקובץ');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              העלה תמונות ווידאו
            </h3>
            <p className="text-gray-500 mb-4">
              גרור קבצים לכאן או לחץ לבחירה
            </p>
            <p className="text-sm text-gray-400">
              תמונות: JPG, PNG, GIF • וידאו: MP4, MOV • מקסימום 10 קבצים
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                מעלה...
              </div>
            ) : (
              'בחר קבצים'
            )}
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {fileName}
                </span>
                <span className="text-sm text-gray-500">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            מדיה ({media.length}/{maxFiles})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item, index) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {item.type === 'IMAGE' ? (
                    <img 
                      src={item.url} 
                      alt={item.altText || item.originalName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors"
                      title="מחק"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Primary Badge */}
                {item.isPrimary && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    ראשית
                  </div>
                )}
                
                {/* Type Badge */}
                {item.type === 'VIDEO' && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    וידאו
                  </div>
                )}
                
                {/* File Info */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatFileSize(item.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader; 