const pool = require('../config/db');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public/Private
exports.getUsers = async (req, res, next) => {
    try {
        // ดึงข้อมูลรายชื่อจาก PostgreSQL แทน MongoDB
        const { rows } = await pool.query('SELECT id, name, role FROM users ORDER BY id ASC');
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
exports.getUser = async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: `User not found` });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ปิดการใช้งานชั่วคราว หรือปรับให้ใช้ SQL ได้หากต้องการในอนาคต
exports.updateUser = async (req, res, next) => { res.status(501).json({ success: false, message: "Not Implemented" }); };
exports.deleteUser = async (req, res, next) => { res.status(501).json({ success: false, message: "Not Implemented" }); };
exports.getMyProfile = async (req, res, next) => { res.status(501).json({ success: false, message: "Not Implemented" }); };
exports.updateMyProfile = async (req, res, next) => { res.status(501).json({ success: false, message: "Not Implemented" }); };
exports.changePassword = async (req, res, next) => { res.status(501).json({ success: false, message: "Not Implemented" }); };