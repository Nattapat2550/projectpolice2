const express = require("express");
const next = require("next");
const dotenv = require("dotenv");

// 1. โหลด config.env ก่อน require ไฟล์อื่น
dotenv.config({ path: "./config/config.env" });

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 5003;

// นำเข้าไฟล์เชื่อมต่อฐานข้อมูล (เมื่อ require จะทำข้อต่อทันที)
const pool = require("./config/db");

// โหลด express app ดั้งเดิมของคุณเข้ามาเพื่อใช้มิดเดิลแวร์ความปลอดภัยทั้งหมด
const app = require("./app"); 

nextApp.prepare().then(() => {
  // บังคับให้ Requests อื่นๆ ที่ไม่ใช่ของ Express API วิ่งเข้า Next.js
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  const server = app.listen(PORT, () => {
    console.log(
      `🚀 Unified Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
});