import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Unlink,
  Type,
  Palette,
  Minus
} from 'lucide-react';

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'התחל להקליד...', 
  className = '',
  minHeight = '120px',
  maxHeight = '400px',
  disabled = false,
  showToolbar = true,
  dir = 'rtl',
  onPlainTextChange = null // Optional callback for plain text version
}) => {
  const editorRef = useRef(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // Helper function to convert HTML to plain text
  const htmlToPlainText = useCallback((html) => {
    if (!html) return '';
    
    // First, replace block elements with spaces to preserve word separation
    let cleanHtml = html
      .replace(/<\/?(div|p|br|h[1-6]|li|ul|ol)[^>]*>/gi, ' ')
      .replace(/<[^>]*>/g, ''); // Remove all other HTML tags
    
    // Decode HTML entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up whitespace - replace multiple spaces/newlines with single space
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }, []);

  // Font sizes available
  const fontSizes = [
    { value: '12px', label: '12' },
    { value: '14px', label: '14' },
    { value: '16px', label: '16' },
    { value: '18px', label: '18' },
    { value: '20px', label: '20' },
    { value: '24px', label: '24' },
    { value: '28px', label: '28' },
    { value: '32px', label: '32' }
  ];

  // Colors available
  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF0066', '#FF3366', '#FF6699', '#66FF00', '#0099FF', '#9900FF'
  ];

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content change
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      const htmlContent = editorRef.current.innerHTML;
      onChange(htmlContent);
      
      // Also call plain text callback if provided
      if (onPlainTextChange) {
        const plainText = htmlToPlainText(htmlContent);
        onPlainTextChange(plainText);
      }
    }
  }, [onChange, onPlainTextChange, htmlToPlainText]);

  // Execute command
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // Format text
  const formatText = useCallback((command, value = null) => {
    execCommand(command, value);
  }, [execCommand]);

  // Handle link creation
  const handleCreateLink = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setSelectedText(selection.toString());
      setIsLinkModalOpen(true);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setIsLinkModalOpen(false);
      setLinkUrl('');
      setSelectedText('');
    }
  };

  // Toolbar button component
  const ToolbarButton = ({ onClick, isActive = false, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  // Dropdown component
  const Dropdown = ({ options, onSelect, placeholder, icon: Icon }) => (
    <div className="relative inline-block">
      <select
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        defaultValue=""
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );

  // Color picker component
  const ColorPicker = ({ onColorSelect }) => (
    <div className="relative inline-block">
      <button
        type="button"
        className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
        onClick={() => document.getElementById('color-picker').click()}
        title="צבע טקסט"
      >
        <Palette className="w-4 h-4" />
      </button>
      <input
        id="color-picker"
        type="color"
        className="absolute opacity-0 w-0 h-0"
        onChange={(e) => onColorSelect(e.target.value)}
      />
    </div>
  );

  return (
    <div className={`rich-text-editor border border-gray-300 rounded-lg overflow-hidden ${className}`} dir={dir}>
      {showToolbar && (
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap items-center gap-1">
          {/* Text formatting */}
          <ToolbarButton onClick={() => formatText('bold')} title="מודגש">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => formatText('italic')} title="נטוי">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => formatText('underline')} title="קו תחתון">
            <Underline className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Font size */}
          <Dropdown
            options={fontSizes}
            onSelect={(size) => formatText('fontSize', size)}
            placeholder="גודל"
            icon={Type}
          />

          {/* Text color */}
          <ColorPicker onColorSelect={(color) => formatText('foreColor', color)} />

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Text alignment */}
          <ToolbarButton onClick={() => formatText('justifyRight')} title="יישור לימין">
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => formatText('justifyCenter')} title="יישור למרכז">
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => formatText('justifyLeft')} title="יישור לשמאל">
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => formatText('justifyFull')} title="יישור מלא">
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Lists */}
          <ToolbarButton onClick={() => formatText('insertUnorderedList')} title="רשימה">
            <List className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => formatText('insertOrderedList')} title="רשימה ממוספרת">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Links */}
          <ToolbarButton onClick={handleCreateLink} title="הוסף קישור">
            <Link className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton onClick={() => formatText('unlink')} title="הסר קישור">
            <Unlink className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Horizontal rule */}
          <ToolbarButton onClick={() => formatText('insertHorizontalRule')} title="קו מפריד">
            <Minus className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        className={`p-4 focus:outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        style={{ 
          minHeight, 
          maxHeight,
          direction: dir,
          overflowY: 'auto',
          height: 'auto'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">הוסף קישור</h3>
            
            {selectedText && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">טקסט נבחר:</label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">"{selectedText}"</div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">כתובת הקישור:</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                  setSelectedText('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!linkUrl}
              >
                הוסף קישור
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor [contenteditable="true"]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
          
          .rich-text-editor [contenteditable="true"] {
            outline: none;
            overflow-y: auto !important;
            max-height: inherit !important;
            box-sizing: border-box !important;
            max-height: 300px !important;
          }
          
          .rich-text-editor [contenteditable="true"]:focus {
            box-shadow: inset 0 0 0 2px #3b82f6;
            border-radius: 0 0 8px 8px;
          }
          
          .rich-text-editor [contenteditable="true"] a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .rich-text-editor [contenteditable="true"] ul, 
          .rich-text-editor [contenteditable="true"] ol {
            padding-right: 20px;
            margin: 10px 0;
          }
          
          .rich-text-editor [contenteditable="true"] li {
            margin: 5px 0;
          }
          
          .rich-text-editor [contenteditable="true"] hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 15px 0;
          }
          
          .rich-text-editor [contenteditable="true"] h1,
          .rich-text-editor [contenteditable="true"] h2,
          .rich-text-editor [contenteditable="true"] h3,
          .rich-text-editor [contenteditable="true"] h4,
          .rich-text-editor [contenteditable="true"] h5,
          .rich-text-editor [contenteditable="true"] h6 {
            font-weight: bold;
            margin: 10px 0;
          }
          
          .rich-text-editor [contenteditable="true"] h1 { font-size: 2em; }
          .rich-text-editor [contenteditable="true"] h2 { font-size: 1.5em; }
          .rich-text-editor [contenteditable="true"] h3 { font-size: 1.17em; }
          
          .rich-text-editor [contenteditable="true"] p {
            margin: 8px 0;
          }
          
          .rich-text-editor [contenteditable="true"] blockquote {
            border-right: 4px solid #e5e7eb;
            padding-right: 16px;
            margin: 16px 0;
            font-style: italic;
            color: #6b7280;
          }
        `
      }} />
    </div>
  );
};

export default RichTextEditor;
