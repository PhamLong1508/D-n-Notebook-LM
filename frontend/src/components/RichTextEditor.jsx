
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  CodeOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  BlockOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { Button, Divider, Space } from 'antd';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-menu">
      <Space split={<Divider type="vertical" />}>
        <Space>
          <Button
            type={editor.isActive('bold') ? 'primary' : 'text'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Button
            type={editor.isActive('italic') ? 'primary' : 'text'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Button
            type={editor.isActive('strike') ? 'primary' : 'text'}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <Button
            type={editor.isActive('code') ? 'primary' : 'text'}
            icon={<CodeOutlined />}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />
        </Space>
        <Space>
          <Button
            type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'text'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </Button>
          <Button
            type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'text'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
          <Button
            type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'text'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>
        </Space>
        <Space>
          <Button
            type={editor.isActive('bulletList') ? 'primary' : 'text'}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <Button
            type={editor.isActive('orderedList') ? 'primary' : 'text'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <Button
            type={editor.isActive('blockquote') ? 'primary' : 'text'}
            icon={<BlockOutlined />}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </Space>
        <Space>
          <Button
            icon={<UndoOutlined />}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <Button
            icon={<RedoOutlined />}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </Space>
      </Space>
    </div>
  );
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="rich-text-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
