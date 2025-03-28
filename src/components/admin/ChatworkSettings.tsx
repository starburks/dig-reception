import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ChatworkSettings as ChatworkSettingsType } from '../../types/database';

const ChatworkSettings: React.FC = () => {
  const [settings, setSettings] = useState<ChatworkSettingsType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSettings, setEditingSettings] = useState<Partial<ChatworkSettingsType>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('chatwork_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      toast.error('設定の取得に失敗しました');
      return;
    }

    setSettings(data);
    setEditingSettings(data || {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSettings.api_key || !editingSettings.message_template) {
      toast.error('APIキーとメッセージテンプレートは必須です');
      return;
    }

    const toastId = toast.loading('保存中...');
    
    try {
      if (settings?.id) {
        const { error } = await supabase
          .from('chatwork_settings')
          .update({
            api_key: editingSettings.api_key,
            message_template: editingSettings.message_template
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chatwork_settings')
          .insert([{
            api_key: editingSettings.api_key,
            message_template: editingSettings.message_template
          }]);

        if (error) throw error;
      }

      toast.success('設定を保存しました', { id: toastId });
      setIsEditing(false);
      fetchSettings();
    } catch (error) {
      toast.error('保存に失敗しました', { id: toastId });
    }
  };

  const testConnection = async () => {
    if (!settings?.api_key) {
      toast.error('APIキーが設定されていません');
      return;
    }

    const toastId = toast.loading('接続テスト中...');

    try {
      const response = await fetch('/api/chatwork/v2/me', {
        headers: {
          'X-ChatWorkToken': settings.api_key
        }
      });

      if (!response.ok) throw new Error('API接続に失敗しました');

      const data = await response.json();
      toast.success(`接続成功: ${data.name}さんとして認証されました`, { id: toastId });
    } catch (error) {
      toast.error('接続テストに失敗しました', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Chatwork設定</h2>
        <div className="space-x-4">
          <button
            onClick={testConnection}
            disabled={!settings?.api_key}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-300"
          >
            <Send className="w-4 h-4 inline-block mr-2" />
            接続テスト
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            編集
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                APIキー *
              </label>
              <input
                type="text"
                value={editingSettings.api_key || ''}
                onChange={(e) => setEditingSettings({ ...editingSettings, api_key: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メッセージテンプレート *
              </label>
              <textarea
                value={editingSettings.message_template || ''}
                onChange={(e) => setEditingSettings({ ...editingSettings, message_template: e.target.value })}
                className="w-full px-3 py-2 border rounded-md h-32"
                placeholder="[info][title]来客のお知らせ[/title]
{visitor_name}様（{visitor_company}）が来社されました。

担当: {staff_name}
Chatwork: [To:{staff_chatwork_id}]

応対をお願いいたします。[/info]"
                required
              />
              <div className="mt-2 text-sm text-gray-500">
                <div className="font-medium mb-2">利用可能な変数:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>{'{visitor_name}'} - 来訪者名</li>
                  <li>{'{visitor_company}'} - 来訪者の会社名</li>
                  <li>{'{staff_name}'} - 担当者名</li>
                  <li>{'{staff_chatwork_id}'} - 担当者のChatwork ID</li>
                  <li>{'{staff_department}'} - 担当者の部署名</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingSettings(settings || {});
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
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <dl className="space-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">APIキー</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.api_key ? '********' : '未設定'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">メッセージテンプレート</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {settings?.message_template || '未設定'}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default ChatworkSettings;