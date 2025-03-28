import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { StaffMember, Company } from '../../types/database';

const StaffManagement: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<(StaffMember & { company_name: string })[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember>>({});

  useEffect(() => {
    fetchStaffMembers();
    fetchCompanies();
  }, []);

  const fetchStaffMembers = async () => {
    const { data, error } = await supabase
      .from('staff_members')
      .select(`
        *,
        companies (
          name
        )
      `)
      .order('name');
    
    if (error) {
      toast.error('担当者情報の取得に失敗しました');
      return;
    }

    setStaffMembers(data.map(staff => ({
      ...staff,
      company_name: staff.companies?.name || ''
    })));
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('会社情報の取得に失敗しました');
      return;
    }

    setCompanies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStaff.name || !editingStaff.company_id) {
      toast.error('名前と会社は必須です');
      return;
    }

    const toastId = toast.loading('保存中...');
    
    try {
      if (editingStaff.id) {
        const { error } = await supabase
          .from('staff_members')
          .update({
            name: editingStaff.name,
            company_id: editingStaff.company_id,
            department: editingStaff.department,
            chatwork_id: editingStaff.chatwork_id,
            photo_url: editingStaff.photo_url
          })
          .eq('id', editingStaff.id);

        if (error) throw error;
        toast.success('担当者情報を更新しました', { id: toastId });
      } else {
        const { error } = await supabase
          .from('staff_members')
          .insert([{
            name: editingStaff.name,
            company_id: editingStaff.company_id,
            department: editingStaff.department,
            chatwork_id: editingStaff.chatwork_id,
            photo_url: editingStaff.photo_url
          }]);

        if (error) throw error;
        toast.success('担当者を登録しました', { id: toastId });
      }

      setIsEditing(false);
      setEditingStaff({});
      fetchStaffMembers();
    } catch (error) {
      toast.error('保存に失敗しました', { id: toastId });
    }
  };

  const handleDelete = async (staff: StaffMember) => {
    if (!window.confirm(`${staff.name}を削除してもよろしいですか？`)) {
      return;
    }

    const toastId = toast.loading('削除中...');

    const { error } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', staff.id);

    if (error) {
      toast.error('削除に失敗しました', { id: toastId });
      return;
    }

    toast.success('担当者を削除しました', { id: toastId });
    fetchStaffMembers();
  };

  const exportToCsv = () => {
    const headers = ['名前', '会社名', '部署', 'Chatwork ID', '写真URL', '作成日'];
    const csvData = staffMembers.map(staff => [
      staff.name,
      staff.company_name,
      staff.department || '',
      staff.chatwork_id || '',
      staff.photo_url || '',
      new Date(staff.created_at).toLocaleString('ja-JP')
    ]);

    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `staff_members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">担当者情報管理</h2>
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
              setEditingStaff({});
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
              {editingStaff.id ? '担当者情報編集' : '新規担当者登録'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名前 *
                </label>
                <input
                  type="text"
                  value={editingStaff.name || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社 *
                </label>
                <select
                  value={editingStaff.company_id || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, company_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">選択してください</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  部署
                </label>
                <input
                  type="text"
                  value={editingStaff.department || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chatwork ID
                </label>
                <input
                  type="text"
                  value={editingStaff.chatwork_id || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, chatwork_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  写真URL
                </label>
                <input
                  type="url"
                  value={editingStaff.photo_url || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, photo_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingStaff({});
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
                名前
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                部署
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chatwork ID
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffMembers.map((staff) => (
              <tr key={staff.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {staff.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {staff.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {staff.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {staff.chatwork_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingStaff(staff);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(staff)}
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

export default StaffManagement;