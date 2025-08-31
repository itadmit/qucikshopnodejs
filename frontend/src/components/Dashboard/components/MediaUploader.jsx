import { useState, useRef, memo } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../../../services/api.js';
import MediaModal from './MediaModal.jsx';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component  
const SortableMediaItem = memo(({ item, index, isPrimary, onDelete, onSetPrimary, formatFileSize }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.uniqueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isLarge = isPrimary;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-move ${
        isLarge ? 'w-48 h-48' : 'w-20 h-20'
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div className={`w-full h-full bg-white border-2 ${
        isPrimary ? 'border-blue-200' : 'border-gray-200'
      } rounded-lg overflow-hidden hover:shadow-md transition-shadow`}>
        {item.type === 'IMAGE' ? (
          <img
            src={item.url}
            alt={item.altText || item.originalName}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Video className={`${isLarge ? 'w-12 h-12' : 'w-4 h-4'} text-gray-400`} />
          </div>
        )}
      </div>
      
      {/* Primary Badge */}
      {isPrimary && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          ראשית
        </div>
      )}
      
      {/* Position Number */}
      <div className={`absolute top-1 ${isPrimary ? 'left-2' : 'right-1'} bg-gray-900 bg-opacity-75 text-white text-xs ${
        isLarge ? 'w-6 h-6' : 'w-4 h-4'
      } rounded-full flex items-center justify-center font-medium`}>
        {index + 1}
      </div>
      
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        className={`absolute top-1 left-1 bg-red-600 text-white rounded-full ${
          isLarge ? 'p-1' : 'p-0.5'
        } opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700`}
      >
        <X className={`${isLarge ? 'w-3 h-3' : 'w-2.5 h-2.5'}`} />
      </button>
      
      {/* Make Primary Button */}
      {!isPrimary && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetPrimary(item);
          }}
          className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
          title="הגדר כראשית"
        >
          ⭐
        </button>
      )}
      
      {/* File Info for small items */}
      {!isLarge && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="truncate">{item.originalName}</div>
          <div className="flex justify-between">
            <span>{item.type}</span>
            <span>{formatFileSize(item.size)}</span>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.index === nextProps.index &&
    prevProps.isPrimary === nextProps.isPrimary
  );
});

const MediaUploader = ({ onUpload, onDelete, media = [], maxFiles = 10, storeId, folder = 'media' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Generate truly unique ID
  const generateUniqueId = () => {
    return `product-media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}`;
  };

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = async (files) => {
    if (files.length + media.length > maxFiles) {
      alert(`ניתן להעלות עד ${maxFiles} קבצים`);
      return;
    }

    setUploading(true);
    const newProgress = {};

    try {
      if (!storeId) {
        throw new Error('Store ID is required for media upload');
      }

      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
        newProgress[file.name] = 0;
      });
      formData.append('storeId', storeId.toString());
      formData.append('folder', folder);

      setUploadProgress(newProgress);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use direct fetch for better control over the upload
      const isDevelopment = window.location.port === '5173';
      const baseUrl = isDevelopment 
        ? 'http://3.64.187.151:3001/api'
        : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
      
      const response = await fetch(`${baseUrl}/media/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Handle both single and multiple upload responses
      const uploadResults = Array.isArray(result.data) ? result.data : [result.data];
      
      const newMediaItems = uploadResults.map((uploadResult, index) => {
        const uniqueId = generateUniqueId();
        return {
          id: uploadResult.id || uniqueId,
          uniqueId: uniqueId,
          url: uploadResult.url,
          key: uploadResult.key,
          type: uploadResult.mimeType?.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          isPrimary: media.length === 0 && index === 0, // Only first item when no existing media
          altText: '',
          colorOptionValueId: null,
          originalName: uploadResult.originalName || uploadResult.originalFilename,
          size: uploadResult.size,
          convertedToWebP: uploadResult.convertedToWebP || false
        };
      });

      // Show conversion info if files were converted to WebP
      const convertedCount = uploadResults.filter(r => r.convertedToWebP).length;
      if (convertedCount > 0) {

      }

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
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Use direct fetch for better control
        const isDevelopment = window.location.port === '5173';
        const baseUrl = isDevelopment 
          ? 'http://3.64.187.151:3001/api'
          : (import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api');
        
        const response = await fetch(`${baseUrl}/media/delete/${encodeURIComponent(mediaItem.key)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Delete failed');
        }


      }
      onDelete(mediaItem.uniqueId);
    } catch (error) {
      console.error('Delete error:', error);
      alert('שגיאה במחיקת הקובץ');
    }
  };

  // Handle media selection from modal
  const handleMediaSelect = (selectedMedia) => {
    if (Array.isArray(selectedMedia)) {
      // Multiple selection
      const newMediaItems = selectedMedia.map((item, index) => {
        const uniqueId = generateUniqueId();
        return {
          id: item.id,
          uniqueId: uniqueId,
          url: item.s3Url,
          key: item.s3Key,
          type: item.mimeType?.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          isPrimary: media.length === 0 && index === 0, // Only first item when no existing media
          altText: item.altText || '',
          colorOptionValueId: null,
          originalName: item.originalFilename,
          size: item.fileSize,
          convertedToWebP: item.mimeType === 'image/webp'
        };
      });
      onUpload(newMediaItems);
    } else if (selectedMedia) {
      // Single selection
      const uniqueId = generateUniqueId();
      const newMediaItem = {
        id: selectedMedia.id,
        uniqueId: uniqueId,
        url: selectedMedia.s3Url,
        key: selectedMedia.s3Key,
        type: selectedMedia.mimeType?.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        isPrimary: media.length === 0,
        altText: selectedMedia.altText || '',
        colorOptionValueId: null,
        originalName: selectedMedia.originalFilename,
        size: selectedMedia.fileSize,
        convertedToWebP: selectedMedia.mimeType === 'image/webp'
      };
      onUpload([newMediaItem]);
    }
  };

  // Handle drag end with DnD Kit
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    const oldIndex = media.findIndex(item => item.uniqueId === active.id);
    const newIndex = media.findIndex(item => item.uniqueId === over.id);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    // Create new array with moved items
    const newMedia = arrayMove([...media], oldIndex, newIndex);
    
    // Update primary status - first item is always primary
    const updatedMedia = newMedia.map((item, index) => ({
      ...item,
      isPrimary: index === 0
    }));

    // Use setTimeout to ensure state update happens after drag animation
    setTimeout(() => {
      onUpload(updatedMedia, true); // true indicates this is a reorder operation
    }, 0);
  };

  const setPrimary = (selectedItem) => {
    const updatedMedia = media.map(item => ({
      ...item,
      isPrimary: item.uniqueId === selectedItem.uniqueId
    }));
    onUpload(updatedMedia, true); // true indicates this is a reorder operation
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
      {/* Upload Area - Only show when no media exists */}
      {media.length === 0 && (
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
              תמונות: JPG, PNG, GIF (יומרו ל-WebP) • וידאו: MP4, MOV • מקסימום {maxFiles} קבצים
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                מעלה...
              </div>
            ) : (
              'בחר מדיה'
            )}
          </button>
        </div>
        </div>
      )}

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

      {/* Media Display - Professional Drag & Drop */}
      {media.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            מדיה ({media.length}/{maxFiles})
          </h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={media.map(item => item.uniqueId)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-4 items-start flex-wrap" dir="rtl">
                {media.map((item, index) => (
                  <SortableMediaItem
                    key={item.uniqueId}
                    item={item}
                    index={index}
                    isPrimary={item.isPrimary}
                    onDelete={handleDelete}
                    onSetPrimary={setPrimary}
                    formatFileSize={formatFileSize}
                  />
                ))}
                
                {/* Add More Button */}
                {media.length < maxFiles && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors group"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-gray-600 mx-auto mb-1" />
                      <span className="text-xs text-gray-500">הוסף</span>
                    </div>
                  </button>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleMediaSelect}
        storeId={storeId}
        allowMultiple={true}
        selectedMedia={media}
      />
    </div>
  );
};

export default MediaUploader; 