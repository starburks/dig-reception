/*
  # Insert test data

  1. Test Data Overview
    - Companies: 3 sample companies
    - Staff Members: Multiple staff members per company
    - Chatwork Settings: Initial configuration
    - Visitor Logs: Sample visitor records
    - Error Logs: Sample error records

  2. Data Relationships
    - Staff members are linked to companies
    - Visitor logs are linked to staff members
*/

-- Insert test companies
INSERT INTO companies (id, name, chatwork_room_id, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '株式会社テクノロジー', '123456789', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'イノベーション株式会社', '987654321', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'フューチャー工業', '456789123', NOW(), NOW());

-- Insert test staff members
INSERT INTO staff_members (id, company_id, department, name, chatwork_id, photo_url, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '開発部', '山田 太郎', 'yamada_taro', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '営業部', '佐藤 花子', 'sato_hanako', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '企画部', '鈴木 一郎', 'suzuki_ichiro', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'マーケティング部', '田中 美咲', 'tanaka_misaki', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', '総務部', '高橋 健一', 'takahashi_kenichi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', NOW(), NOW());

-- Insert test Chatwork settings
INSERT INTO chatwork_settings (id, api_key, message_template, created_at, updated_at)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'YOUR_API_KEY_HERE', 
  '[info][title]来客のお知らせ[/title]
{visitor_name}様（{visitor_company}）が来社されました。

応対をお願いいたします。[/info]', NOW(), NOW());

-- Insert test visitor logs
INSERT INTO visitor_logs (id, visitor_name, visitor_company, staff_member_id, created_at)
VALUES
  ('11111111-2222-3333-4444-555555555555', '中村 次郎', 'ABC商事', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 days'),
  ('22222222-3333-4444-5555-666666666666', '小林 真理', 'XYZ産業', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '1 day'),
  ('33333333-4444-5555-6666-777777777777', '伊藤 健太', '未来技研', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '3 hours');

-- Insert test error logs
INSERT INTO error_logs (id, error_message, error_stack, created_at)
VALUES
  ('44444444-5555-6666-7777-888888888888', 'Chatwork API connection failed', 'Error: Failed to connect to Chatwork API\n    at sendNotification (/app/services/chatwork.ts:25)\n    at async notifyStaff (/app/controllers/visitor.ts:42)', NOW() - INTERVAL '1 day'),
  ('55555555-6666-7777-8888-999999999999', 'Database query failed', 'Error: relation "unknown_table" does not exist\n    at Query.handleError (/app/db/query.ts:127)\n    at processQuery (/app/controllers/staff.ts:89)', NOW() - INTERVAL '2 hours');