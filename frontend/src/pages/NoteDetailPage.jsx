import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Switch, message, Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Text } = Typography;

const NoteDetailPage = () => {
    const { notebookId, noteId } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNote = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/notebooks/${notebookId}/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNote(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi tải ghi chú');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNote();
    }, [notebookId, noteId]);

    const handleTogglePublic = async (checked) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `/api/notebooks/${notebookId}/notes/${noteId}/toggle-public`,
                { isPublic: checked },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNote(response.data);
            message.success(`Ghi chú đã được chuyển sang chế độ ${checked ? 'công khai' : 'riêng tư'}`);
        } catch (err) {
            message.error(err.response?.data?.error || 'Không thể thay đổi trạng thái ghi chú');
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;
    if (!note) return <p>Không tìm thấy ghi chú.</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">{note.title}</h1>
                <div className="flex items-center space-x-2">
                    <Text>{note.isPublic ? 'Công khai' : 'Riêng tư'}</Text>
                    <Switch
                        checked={note.isPublic}
                        onChange={handleTogglePublic}
                        checkedChildren="Công khai"
                        unCheckedChildren="Riêng tư"
                    />
                </div>
            </div>
            <div className="prose max-w-none text-left">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {note.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default NoteDetailPage;