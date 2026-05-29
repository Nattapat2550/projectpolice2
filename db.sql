-- สร้างตาราง Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  years_of_experience INT CHECK (years_of_experience >= 0 AND years_of_experience <= 100),
  area_of_expertise VARCHAR(50),
  reset_password_token VARCHAR(255),
  reset_password_expire TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1. เก็บไฟล์ต้นฉบับ
CREATE TABLE documents (
  id                  SERIAL PRIMARY KEY,
  filename            VARCHAR(255),
  content             TEXT,
  content_hash        VARCHAR(64) UNIQUE,
  keywords_found      JSONB,
  drive_file_id       VARCHAR(255),
  drive_web_view_link TEXT,
  status              VARCHAR(20) DEFAULT 'pending',
  created_at          TIMESTAMP DEFAULT NOW()
);

-- 2. ผลการวิเคราะห์แต่ละเอกสาร
CREATE TABLE document_analysis (
  id             SERIAL PRIMARY KEY,
  document_id    INT REFERENCES documents(id) ON DELETE CASCADE,
  has_report     BOOLEAN DEFAULT FALSE,
  keywords_found JSONB,                  
  dates_raw      JSONB,   
  dates_parsed   JSONB,   
  analyzed_at    TIMESTAMP DEFAULT NOW()
);

-- 3. deadlineที่แยกออกมาชัดเจน
CREATE TABLE document_deadlines (
  id           SERIAL PRIMARY KEY,
  document_id  INT REFERENCES documents(id) ON DELETE CASCADE,
  deadline_date DATE,
  date_raw      VARCHAR(100),  
  context       TEXT,          
  confidence    FLOAT,         
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 4. keywords ที่ใช้ตรวจจับ
CREATE TABLE keywords (
  id          SERIAL PRIMARY KEY,
  word        VARCHAR(100) UNIQUE,
  category    VARCHAR(50),   
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 5. ตารางเก็บงานติดตาม (Tasks) -- [ส่วนที่เพิ่มใหม่]
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE CASCADE,
  title VARCHAR(255),       -- ชื่อเรื่อง
  memo_no VARCHAR(100),     -- เลขที่เอกสาร
  memo_date VARCHAR(100),   -- วันที่บนเอกสาร
  main_text TEXT,           -- เนื้อหารวมของงาน
  status VARCHAR(50) DEFAULT 'following',
  notes TEXT, 
  is_urgent BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. ตาราง "ผู้รับผิดชอบ" (เชื่อมกับ Users)
CREATE TABLE task_assignments (
  id SERIAL PRIMARY KEY,
  task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL, -- เชื่อมโยงดึงข้อมูลมาจากตารางผู้ใช้งาน
  role_or_name VARCHAR(100), -- เก็บชื่อดิบที่แสกนได้ (เผื่อกรณีระบบหาตัว User ในตารางไม่เจอ)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. ตาราง "รายละเอียดย่อย" (งานที่ผู้รับผิดชอบต้องทำ)
CREATE TABLE task_topics (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES task_assignments(id) ON DELETE CASCADE,
  detail TEXT NOT NULL,     -- ข้อความงานย่อย
  status VARCHAR(50) DEFAULT 'pending',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ลอง Insert ข้อมูลจำลองลงไปใน Database (เพื่อทดสอบ API)
INSERT INTO tasks (name, person_in_charge, due_date, status, is_urgent) 
VALUES 
('ชื่องานติดตาม 1', 'ชื่อชั่วคราว', '2026-05-22', 'following', false),
('งานใหม่ที่ต้องแก้', 'สมชาย', '2026-05-25', 'problem', false),
('งานด่วนมาก', 'สมหญิง', '2026-05-21', 'following', true);