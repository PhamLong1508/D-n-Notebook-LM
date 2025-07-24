import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Tooltip, Dropdown, Input, message, Upload } from 'antd';
import { useHotkeys } from 'react-hotkeys-hook';
import MDEditor, { commands } from '@uiw/react-md-editor';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  FontSizeOutlined,
  FontColorsOutlined,
  HighlightOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CheckSquareOutlined,
  LinkOutlined,
  PictureOutlined,
  TableOutlined,
  CodeOutlined,
  SearchOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SaveOutlined,
  SyncOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import '../styles/notebooklm-editor.css';

const { Dragger } = Upload;

const NotebookLMEditor = ({ 
  value = '', 
  onChange, 
  placeholder = '',
  height = 600,
  autoSave = true,
  onSave,
  showToolbar = true,
  showStatusBar = true,
  collaborative = false,
  title = ''
}) => {
  const [content, setContent] = useState(value);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [findReplace, setFindReplace] = useState({ show: false, find: '', replace: '' });
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, name: 'You', avatar: '👤', color: '#1a73e8' },
    ...(collaborative ? [
      { id: 2, name: 'John', avatar: '👨', color: '#34a853' },
      { id: 3, name: 'Sarah', avatar: '👩', color: '#ea4335' }
    ] : [])
  ]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const editorRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && content !== value) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          if (onSave) {
            await onSave(content);
          }
          if (onChange) {
            onChange(content);
          }
          setLastSaved(new Date());
        } catch (error) {
          message.error('Không thể tự động lưu');
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, autoSave, onSave, onChange, value]);

  // Update statistics
  useEffect(() => {
    const text = content || '';
    const words = text.replace(/[#*`>\-+]/g, '').split(/\s+/).filter(word => word.length > 0).length;
    const chars = text.length;
    const reading = Math.ceil(words / 200); // 200 words per minute

    setWordCount(words);
    setCharCount(chars);
    setReadingTime(reading);
  }, [content]);

  // Keyboard shortcuts
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    handleManualSave();
  });

  useHotkeys('ctrl+f, cmd+f', (e) => {
    e.preventDefault();
    setFindReplace(prev => ({ ...prev, show: !prev.show }));
  });

  useHotkeys('f11', (e) => {
    e.preventDefault();
    setIsFullscreen(!isFullscreen);
  });

  useHotkeys('ctrl+b, cmd+b', (e) => {
    e.preventDefault();
    insertMarkdown('**', '**');
  });

  useHotkeys('ctrl+i, cmd+i', (e) => {
    e.preventDefault();
    insertMarkdown('*', '*');
  });

  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    insertMarkdown('[', '](url)');
  });

  const handleContentChange = useCallback((val) => {
    setContent(val || '');
  }, []);

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(content);
      }
      if (onChange) {
        onChange(content);
      }
      setLastSaved(new Date());
      message.success('Đã lưu thành công');
    } catch (error) {
      message.error('Không thể lưu');
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = (before, after = '') => {
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector('textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
        setContent(newText);
        
        // Restore cursor position
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + before.length, end + before.length);
        }, 10);
      }
    }
  };

  const insertAtCursor = (text) => {
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector('textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const newText = content.substring(0, start) + text + content.substring(start);
        setContent(newText);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 10);
      }
    }
  };

  const handleImageUpload = (info) => {
    const { status, response } = info.file;
    if (status === 'done') {
      const imageUrl = response?.url || URL.createObjectURL(info.file.originFileObj);
      insertAtCursor(`![${info.file.name}](${imageUrl})\n\n`);
      message.success('Đã thêm hình ảnh');
    } else if (status === 'error') {
      message.error('Không thể tải lên hình ảnh');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        insertAtCursor(`![${file.name}](${imageUrl})\n\n`);
        message.success(`Đã thêm hình ảnh: ${file.name}`);
      } else {
        message.warning(`Không hỗ trợ định dạng file: ${file.name}`);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const findAndReplace = () => {
    if (findReplace.find) {
      const newContent = content.replace(new RegExp(findReplace.find, 'g'), findReplace.replace);
      setContent(newContent);
      message.success(`Đã thay thế "${findReplace.find}" bằng "${findReplace.replace}"`);
      setFindReplace({ show: false, find: '', replace: '' });
    }
  };

  const customCommands = [
    // Basic formatting
    {
      name: 'bold',
      keyCommand: 'bold',
      buttonProps: { 'aria-label': 'Bold (Ctrl+B)' },
      icon: <BoldOutlined />,
      execute: () => insertMarkdown('**', '**'),
    },
    {
      name: 'italic',
      keyCommand: 'italic',
      buttonProps: { 'aria-label': 'Italic (Ctrl+I)' },
      icon: <ItalicOutlined />,
      execute: () => insertMarkdown('*', '*'),
    },
    {
      name: 'strikethrough',
      keyCommand: 'strikethrough',
      buttonProps: { 'aria-label': 'Strikethrough' },
      icon: <StrikethroughOutlined />,
      execute: () => insertMarkdown('~~', '~~'),
    },
    commands.divider,
    
    // Headers
    {
      name: 'heading1',
      keyCommand: 'heading1',
      buttonProps: { 'aria-label': 'Header 1' },
      icon: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>H1</span>,
      execute: () => insertMarkdown('# ', ''),
    },
    {
      name: 'heading2',
      keyCommand: 'heading2',
      buttonProps: { 'aria-label': 'Header 2' },
      icon: <span style={{ fontWeight: 'bold', fontSize: '14px' }}>H2</span>,
      execute: () => insertMarkdown('## ', ''),
    },
    {
      name: 'heading3',
      keyCommand: 'heading3',
      buttonProps: { 'aria-label': 'Header 3' },
      icon: <span style={{ fontWeight: 'bold', fontSize: '12px' }}>H3</span>,
      execute: () => insertMarkdown('### ', ''),
    },
    commands.divider,
    
    // Lists
    {
      name: 'unorderedList',
      keyCommand: 'unorderedList',
      buttonProps: { 'aria-label': 'Bullet List' },
      icon: <UnorderedListOutlined />,
      execute: () => insertMarkdown('- ', ''),
    },
    {
      name: 'orderedList',
      keyCommand: 'orderedList',
      buttonProps: { 'aria-label': 'Numbered List' },
      icon: <OrderedListOutlined />,
      execute: () => insertMarkdown('1. ', ''),
    },
    {
      name: 'checklist',
      keyCommand: 'checklist',
      buttonProps: { 'aria-label': 'Checklist' },
      icon: <CheckSquareOutlined />,
      execute: () => insertMarkdown('- [ ] ', ''),
    },
    commands.divider,
    
    // Media & Links
    {
      name: 'link',
      keyCommand: 'link',
      buttonProps: { 'aria-label': 'Link (Ctrl+K)' },
      icon: <LinkOutlined />,
      execute: () => insertMarkdown('[', '](url)'),
    },
    {
      name: 'image',
      keyCommand: 'image',
      buttonProps: { 'aria-label': 'Image' },
      icon: <PictureOutlined />,
      execute: () => insertMarkdown('![alt text](', ')'),
    },
    {
      name: 'table',
      keyCommand: 'table',
      buttonProps: { 'aria-label': 'Table' },
      icon: <TableOutlined />,
      execute: () => insertAtCursor('\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n'),
    },
    commands.divider,
    
    // Code
    {
      name: 'inlineCode',
      keyCommand: 'inlineCode',
      buttonProps: { 'aria-label': 'Inline Code' },
      icon: <CodeOutlined />,
      execute: () => insertMarkdown('`', '`'),
    },
    {
      name: 'codeBlock',
      keyCommand: 'codeBlock',
      buttonProps: { 'aria-label': 'Code Block' },
      icon: <span style={{ fontFamily: 'monospace' }}>{ '{}' }</span>,
      execute: () => insertMarkdown('```\n', '\n```'),
    },
    commands.divider,
    
    // Utilities
    {
      name: 'findReplace',
      keyCommand: 'findReplace',
      buttonProps: { 'aria-label': 'Find & Replace (Ctrl+F)' },
      icon: <SearchOutlined />,
      execute: () => setFindReplace(prev => ({ ...prev, show: !prev.show })),
    },
    {
      name: 'save',
      keyCommand: 'save',
      buttonProps: { 'aria-label': 'Save (Ctrl+S)' },
      icon: isSaving ? <SyncOutlined spin /> : <SaveOutlined />,
      execute: handleManualSave,
    },
    {
      name: 'fullscreen',
      keyCommand: 'fullscreen',
      buttonProps: { 'aria-label': 'Fullscreen (F11)' },
      icon: isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />,
      execute: () => setIsFullscreen(!isFullscreen),
    },
  ];

  return (
    <div className={`notebooklm-editor ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Collaborative Users */}
      {collaborative && (
        <div className="collaborative-bar">
          <div className="active-users">
            {activeUsers.map(user => (
              <Tooltip key={user.id} title={user.name}>
                <div className="user-avatar" style={{ backgroundColor: user.color }}>
                  {user.avatar}
                </div>
              </Tooltip>
            ))}
          </div>
          <div className="collaboration-status">
            <span className="online-indicator"></span>
            Đang cộng tác với {activeUsers.length - 1} người
          </div>
        </div>
      )}

      {/* Find & Replace Bar */}
      {findReplace.show && (
        <div className="find-replace-bar">
          <Input
            placeholder="Tìm kiếm..."
            value={findReplace.find}
            onChange={e => setFindReplace(prev => ({ ...prev, find: e.target.value }))}
            style={{ width: 200, marginRight: 8 }}
          />
          <Input
            placeholder="Thay thế..."
            value={findReplace.replace}
            onChange={e => setFindReplace(prev => ({ ...prev, replace: e.target.value }))}
            style={{ width: 200, marginRight: 8 }}
          />
          <Button onClick={findAndReplace} type="primary" size="small">
            Thay thế tất cả
          </Button>
          <Button 
            onClick={() => setFindReplace({ show: false, find: '', replace: '' })}
            size="small"
            style={{ marginLeft: 8 }}
          >
            Đóng
          </Button>
        </div>
      )}

      {/* Main Editor */}
      <div 
        className="editor-container"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        ref={editorRef}
      >
        <MDEditor
          value={content}
          onChange={handleContentChange}
          preview="live"
          height={isFullscreen ? '100vh' : height}
          visibleDragBar={true}
          textareaProps={{
            placeholder: placeholder || `✨ Bắt đầu viết ${title ? `"${title}"` : 'ghi chú của bạn'}...\n\n💡 Mẹo:\n• Kéo thả hình ảnh trực tiếp vào đây\n• Ctrl/Cmd + S để lưu\n• Ctrl/Cmd + F để tìm kiếm\n• F11 để toàn màn hình\n\n📝 Hỗ trợ Markdown:\n• **in đậm** hoặc *in nghiêng*\n• # Tiêu đề\n• - Danh sách\n• [Link](url)\n• \`code\` hoặc \`\`\`code block\`\`\``,
            style: { 
              fontSize: 16, 
              lineHeight: 1.7, 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '0.01em'
            }
          }}
          data-color-mode="light"
          toolbarHeight={showToolbar ? 56 : 0}
          hideToolbar={!showToolbar}
          commands={customCommands}
        />

        {/* Drag & Drop Overlay */}
        <div className="drop-overlay">
          <div className="drop-content">
            <PictureOutlined style={{ fontSize: 48, color: '#1a73e8' }} />
            <div>Thả hình ảnh vào đây</div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {showStatusBar && (
        <div className="status-bar">
          <div className="status-left">
            <span className="word-count">📝 {wordCount} từ</span>
            <span className="char-count">🔤 {charCount} ký tự</span>
            <span className="reading-time">⏱️ {readingTime} phút đọc</span>
          </div>
          <div className="status-right">
            {lastSaved && (
              <span className="last-saved">
                💾 Lưu lần cuối: {lastSaved.toLocaleTimeString('vi-VN')}
              </span>
            )}
            {isSaving && (
              <span className="saving-status">
                <SyncOutlined spin /> Đang lưu...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookLMEditor;
