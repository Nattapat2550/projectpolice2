const { Pool } = require("pg");

// ตรวจสอบว่ามีตัวแปรส่งมาถึงไฟล์นี้หรือไม่ (ถ้า undefined แสดงว่าอ่าน .env ไม่ติด)
if (!process.env.DB) {
  console.error("🔥 ERROR: DATABASE_URL is missing in .env file");
}

const pool = new Pool({
  // ใช้ Connection String บรรทัดเดียวง่ายที่สุด
  connectionString: process.env.DB,
  
  // 💡 FIX: เปิดใช้งาน SSL เสมอ เพื่อแก้ปัญหาเชื่อมต่อ Cloud Database แล้วโดนตัด (ECONNRESET)
  ssl: { 
    rejectUnauthorized: false 
  }
});

pool.on('error', (err, client) => {
  console.error('🔥 Unexpected error on idle client', err);
  // ลบ process.exit(-1) ออก หรือคอมเมนต์ไว้ เพื่อไม่ให้เซิร์ฟเวอร์ (Node.js) ดับไปทั้งหมดเมื่อเจอบัค Connection ขาดชั่วคราว
  // process.exit(-1); 
});

module.exports = pool;