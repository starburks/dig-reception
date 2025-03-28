/*
  # Create test data

  1. Test Data
    - Companies
      - 株式会社A
      - 株式会社B
      - 株式会社C
    - Staff Members for each company
      - 各会社に2-3名の担当者を追加
*/

-- Companies
INSERT INTO companies (name, chatwork_room_id)
VALUES 
  ('株式会社A', '123456'),
  ('株式会社B', '234567'),
  ('株式会社C', '345678');

-- Get the company IDs
WITH company_ids AS (
  SELECT id FROM companies WHERE name IN ('株式会社A', '株式会社B', '株式会社C')
)
-- Staff Members
INSERT INTO staff_members (company_id, name, department, chatwork_id)
SELECT
  id as company_id,
  name,
  department,
  chatwork_id
FROM
  company_ids,
  (VALUES
    ('山田 太郎', '営業部', 'yamada'),
    ('佐藤 花子', '総務部', 'sato'),
    ('鈴木 一郎', '開発部', 'suzuki')
  ) as staff(name, department, chatwork_id);