import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, AlertCircle, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import type { VisitorLog, ErrorLog } from '../../types/database';

type LogType = 'visitor' | 'error';

const LogManagement: React.FC = () => {
  const [logType, setLogType] = useState<LogType>('visitor');
  const [visitorLogs, setVisitorLogs] = useState<(VisitorLog & { staff_name: string | null })[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  useEffect(() => {
    if (logType === 'visitor') {
      fetchVisitorLogs();
    } else {
      fetchErrorLogs();
    }
  }, [logType]);

  const fetchVisitorLogs = async () => {
    const { data, error } = await supabase
      .from('visitor_logs')
      .select(`
        *,
        staff_members (
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('来訪履歴の取得に失敗しました');
      return;
    }

    setVisitorLogs(data.map(log => ({
      ...log,
      staff_name: log.staff_members?.name || null
    })));
  };

  const fetchErrorLogs = async () => {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('エラーログの取得に失敗しました');
      return;
    }

    setErrorLogs(data);
  };

  const exportToCsv = () => {
    if (logType === 'visitor') {
      const headers = ['来訪者名', '来訪者会社', '担当者', '来訪日時'];
      const csvData = visitorLogs.map(log => [
        log.visitor_name,
        log.visitor_company,
        log.staff_name || '-',
        format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss')
      ]);

      const csv = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `visitor_logs_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.click();
    } else {
      const headers = ['エラーメッセージ', 'スタックトレース', '発生日時'];
      const csvData = errorLogs.map(log => [
        log.error_message,
        log.error_stack || '-',
        format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss')
      ]);

      const csv = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `error_logs_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">ログ管理</h2>
        <div className="space-x-4">
          <button
            onClick={exportToCsv}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4 inline-block mr-2" />
            CSVエクスポート
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setLogType('visitor')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                logType === 'visitor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCheck className="w-4 h-4 inline-block mr-2" />
              来訪履歴
            </button>
            <button
              onClick={() => setLogType('error')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                logType === 'error'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 inline-block mr-2" />
              エラーログ
            </button>
          </nav>
        </div>

        {logType === 'visitor' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  来訪者名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  来訪者会社
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  来訪日時
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visitorLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.visitor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.visitor_company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.staff_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  エラーメッセージ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スタックトレース
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発生日時
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {errorLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.error_message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {log.error_stack || '-'}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LogManagement;