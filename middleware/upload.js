const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ uploads อัตโนมัติหากยังไม่มี ป้องกัน Error
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ตั้งค่าโฟลเดอร์และชื่อไฟล์ตอนเซฟลงเครื่อง
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // 💡 แก้ปัญหา ENOENT: เซฟลงเครื่องด้วยชื่อสุ่มตัวเลข เพื่อหลีกเลี่ยงปัญหาภาษาไทยและอักขระแปลกๆ บน Windows
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  }
});

// ตรวจสอบประเภทไฟล์ และแปลงชื่อไฟล์ดั้งเดิม
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // 💡 แปลงชื่อไฟล์ภาษาไทยตรงนี้ แค่ "รอบเดียว" (ป้องกันปัญหาแปลงซ้อนจนอักขระพัง)
    // ชื่อนี้ (file.originalname) จะถูกส่งไปให้ Controller ใช้เซฟลง Database 
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    const allowed = ['.png', '.jpg', '.jpeg', '.pdf', '.tiff'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์ .png, .jpg, .jpeg, .pdf, .tiff เท่านั้น'), false);
    }
  }
});

module.exports = { upload };