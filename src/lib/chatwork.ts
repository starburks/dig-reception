import { supabase } from './supabase';
import type { ChatworkSettings, WalkinSettings } from '../types/database';

export async function sendChatworkNotification(
  visitorName: string,
  visitorCompany: string | null,
  staffMemberId: string | null,
  hasAppointment: boolean = true
) {
  try {
    if (!visitorName) {
      throw new Error('来訪者名は必須です');
    }

    // Get Chatwork settings
    const { data: settings, error: settingsError } = await supabase
      .from('chatwork_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Chatwork settings error:', settingsError);
      throw new Error('Chatwork設定の取得に失敗しました');
    }

    if (!settings?.api_key) {
      throw new Error('ChatworkのAPIキーが設定されていません');
    }

    let roomId: string;
    let message: string;

    if (hasAppointment && staffMemberId) {
      // Get staff member details with company info for appointments
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .select(`
          id,
          name,
          department,
          chatwork_id,
          companies!inner (
            id,
            name,
            chatwork_room_id
          )
        `)
        .eq('id', staffMemberId)
        .single();

      if (staffError) {
        console.error('Staff member fetch error:', staffError);
        throw new Error('担当者情報の取得に失敗しました');
      }

      if (!staffData) {
        throw new Error('担当者が見つかりません');
      }

      if (!staffData.companies?.chatwork_room_id) {
        throw new Error(`${staffData.companies.name}のChatworkルームIDが設定されていません`);
      }

      roomId = staffData.companies.chatwork_room_id;

      // Format visitor company info
      const visitorCompanyInfo = visitorCompany ? `（${visitorCompany}）` : '';

      // Prepare message from template for appointments
      const defaultTemplate = '[info][title]来客のお知らせ[/title]{visitor_name}様{visitor_company_info}が来社されました。\n\n担当: {staff_name}\nChatwork: [To:{staff_chatwork_id}]\n\n応対をお願いいたします。[/info]';
      const template = settings.message_template || defaultTemplate;

      message = template
        .replace('{visitor_name}', visitorName)
        .replace('{visitor_company_info}', visitorCompanyInfo)
        .replace('{visitor_company}', visitorCompany || '')
        .replace('{staff_name}', staffData.name)
        .replace('{staff_chatwork_id}', staffData.chatwork_id || '')
        .replace('{staff_department}', staffData.department || '');
    } else {
      // Get walk-in settings for visitors without appointments
      const { data: walkinSettings, error: walkinError } = await supabase
        .from('walkin_settings')
        .select('*')
        .single();

      if (walkinError) {
        console.error('Walk-in settings error:', walkinError);
        throw new Error('予約なしのお客様の通知設定の取得に失敗しました');
      }

      if (!walkinSettings?.chatwork_room_id) {
        throw new Error('予約なしのお客様の通知先ルームIDが設定されていません');
      }

      roomId = walkinSettings.chatwork_room_id;

      // Format visitor company info
      const visitorCompanyInfo = visitorCompany ? `（${visitorCompany}）` : '';

      // Prepare message from template for walk-ins
      message = walkinSettings.message_template
        .replace('{visitor_name}', visitorName)
        .replace('{visitor_company_info}', visitorCompanyInfo)
        .replace('{visitor_company}', visitorCompany || '');
    }

    // Validate room ID before making the API call
    if (!roomId || roomId.trim() === '') {
      throw new Error('Chatworkルームが設定されていません');
    }

    // Log the request details for debugging
    console.log('Chatwork API Request:', {
      roomId,
      messageLength: message.length,
      hasAppointment,
      staffMemberId
    });

    try {
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // First verify room access
      const roomResponse = await fetch(`/api/chatwork/v2/rooms/${roomId}`, {
        headers: {
          'X-ChatWorkToken': settings.api_key
        },
        signal: controller.signal
      });

      if (!roomResponse.ok) {
        throw new Error('指定されたルームへのアクセス権限がありません');
      }

      // Send the message
      const response = await fetch(`/api/chatwork/v2/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'X-ChatWorkToken': settings.api_key,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          body: message,
        }).toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chatwork API error:', {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          roomId
        });

        let errorMessage = 'Chatworkへの送信に失敗しました';
        switch (response.status) {
          case 401:
            errorMessage = 'ChatworkのAPIキーが無効です';
            break;
          case 403:
            errorMessage = 'Chatworkルームへのアクセス権限がありません';
            break;
          case 404:
            errorMessage = 'Chatworkルームが見つかりません';
            break;
          case 429:
            errorMessage = 'APIリクエスト制限を超えました。しばらく待ってから再試行してください';
            break;
          case 503:
            errorMessage = 'Chatworkサービスが一時的に利用できません';
            break;
          default:
            errorMessage = `Chatworkへの送信に失敗しました (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Log the visitor
      const { error: logError } = await supabase
        .from('visitor_logs')
        .insert([{
          visitor_name: visitorName,
          visitor_company: visitorCompany || '',
          staff_member_id: staffMemberId,
          has_appointment: hasAppointment
        }]);

      if (logError) {
        console.error('Visitor log error:', logError);
        throw new Error('来訪ログの保存に失敗しました');
      }

      return true;
    } catch (apiError) {
      if (apiError.name === 'AbortError') {
        throw new Error('接続がタイムアウトしました。ネットワーク状態を確認して再試行してください');
      }
      throw apiError;
    }
  } catch (error) {
    // Log the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;
    
    console.error('Chatwork notification error:', {
      error: errorMessage,
      stack: errorStack,
      context: {
        visitorName,
        visitorCompany,
        staffMemberId,
        hasAppointment
      },
    });

    await supabase
      .from('error_logs')
      .insert([{
        error_message: errorMessage,
        error_stack: errorStack,
      }]);

    throw error;
  }
}