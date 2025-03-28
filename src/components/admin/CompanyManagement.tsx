import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { companies } from '../../types/database';

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<companies[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partial<companies>>({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('会社情報の取得に失敗しました');
      return;
    }

    setCompanies(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCompany.name) {
      toast.error('会社名は必須です');
      return;
    }

    const toastId = toast.loading('保存中...');
    
    try {
      if (editingCompany.id) {
        const { error } = await supabase
          .from('companies')
          .update({
            name: editingCompany.name,
            chatwork_room_id: editingCompany.chatwork_room_id
          })
          .eq('id', editingCompany.id);

        if (error) throw error;
        toast.success('会社情報を更新しました', { id: toastId });
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([{
            name: editingCompany.name,
            chatwork_room_id: editingCompany.chatwork_room_id
          }]);

        if (error) throw error;
        toast.success('会社を登録しました', { id: toastId });
      }

      setIsEditing(false);
      setEditingCompany({});
      fetchCompanies();
    } catch (error) {
      toast.error('保存に失敗しました', { id: toastId });
    }
  };

  const handleDelete = async (company: companies) => {
    if (!window.confirm(`${company.name}を削除してもよろしいですか？`)) {
      return;
    }

    const toastId = toast.loading('削除中...');

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', company.id);

    if (error) {
      toast.error('削除に失敗しました', { id: toastId });
      return;
    }

    toast.success('会社を削除しました', { id: toastId });
    fetchCompanies();
  };

  const exportToCsv = () => {
    const headers = ['会社名', 'Chatwork Room ID', '作成日'];
    const csvData = companies.map(company => [
      company.name,
      company.chatwork_room_id || '',
      new Date(company.created_at).toLocaleString('ja-JP')
    ]);

    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `companies_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">会社情報管理</h2>
        <div className="space-x-4">
          <button
            onClick={exportToCsv}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4 inline-block mr-2" />
            CSVエクスポート
          </button>
          <button
            onClick={() => {
              setIsEditing(true);
              setEditingCompany({});
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            新規登録
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingCompany.id ? '会社情報編集' : '新規会社登録'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名 *
                </label>
                <input
                  type="text"
                  value={editingCompany.name || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chatwork Room ID
                </label>
                <input
                  type="text"
                  value={editingCompany.chatwork_room_id || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, chatwork_room_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingCompany({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chatwork Room ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.chatwork_room_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(company.created_at).toLocaleString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingCompany(company);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyManagement;