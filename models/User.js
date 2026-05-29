const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class User {
  // สร้างผู้ใช้งานใหม่
  static async create(userData) {
    const { name, email, phone, password, role, yearsOfExperience, areaOfExpertise } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, email, phone, password, role, years_of_experience, area_of_expertise) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, name, email, phone, role, years_of_experience, area_of_expertise, created_at
    `;
    const values = [name, email, phone, hashedPassword, role || "user", yearsOfExperience || null, areaOfExpertise || null];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // หาข้อมูลผู้ใช้งานด้วย ID
  static async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return rows[0];
  }

  // หาผู้ใช้งานสำหรับ Login (เช็ค email)
  static async findOne(criteria) {
    if (criteria.email) {
      const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [criteria.email]);
      return rows[0];
    }
    return null;
  }

  // ดึงผู้ใช้งานทั้งหมด
  static async find() {
    const { rows } = await pool.query(`
      SELECT id, name, email, phone, role, years_of_experience, area_of_expertise, created_at, updated_at 
      FROM users
    `);
    return rows;
  }

  // อัปเดตผู้ใช้งานแบบยืดหยุ่น (Dynamic Update)
  static async findByIdAndUpdate(id, data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.findById(id);

    const values = Object.values(data);
    const setString = keys.map((key, index) => {
      // Mapping camelCase ไป snake_case สำหรับบางฟิลด์
      const dbKey = key === 'yearsOfExperience' ? 'years_of_experience' : 
                    key === 'areaOfExpertise' ? 'area_of_expertise' : key;
      return `${dbKey} = $${index + 2}`;
    }).join(", ");

    const query = `
      UPDATE users 
      SET ${setString}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, name, email, phone, role, years_of_experience, area_of_expertise, created_at, updated_at
    `;
    
    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0];
  }

  // ลบผู้ใช้งาน
  static async findByIdAndDelete(id) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  }

  // อัปเดตรหัสผ่าน
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query(`UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`, [hashedPassword, id]);
  }

  // เทียบรหัสผ่าน
  static async matchPassword(enteredPassword, userPassword) {
    return await bcrypt.compare(enteredPassword, userPassword);
  }

  // สร้าง Token
  static getSignedJwtToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }
}

module.exports = User;