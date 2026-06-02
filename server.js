const express = require("express");
const next = require("next");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const morgan = require("morgan");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// 1. โหลด Config และ Database ก่อน
dotenv.config();
const pool = require("./config/db"); // ตรวจสอบ path ให้ตรงกับโครงสร้างใหม่

// 2. ตั้งค่าตัวแปรสำหรับ Next.js
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler(); // ตัวจัดการ Request ของ Next.js

const PORT = process.env.PORT || 3000; // ใช้ Port 3000 เป็นหลักทั้งหน้าบ้านหลังบ้าน

// 3. รอให้ Next.js เตรียมตัวเสร็จ ค่อยเปิด Express Server
app.prepare().then(() => {
  const server = express();

  // --- ส่วน Middleware ของ Backend เดิม ---
  const corsOptions = {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  };
  server.use(cors(corsOptions));

  if (dev) server.use(morgan("dev"));
  
  server.use(express.json());
  server.use(cookieParser());
  server.use(helmet());
  server.use(xss());
  server.use(hpp());

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
      res.status(429).json({ success: false, message: "Too Many Requests" });
    },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    handler: (req, res) => {
      res.status(429).json({ success: false, message: "Too Many Requests" });
    },
  });

  // --- Swagger ---
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Library API",
        version: "1.0.0",
        description: "API for managing dentist appointments, schedules, and user bookings",
      },
      servers: [{ url: "/api/v1" }],
    },
    apis: ["./routes/*.js"],
  };
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // --- API Routes (Backend) ---
  server.use("/api/v1/auth", authLimiter, require("./routes/auth"));
  server.use("/api/v1/users", require("./routes/users"));
  server.use("/api/v1/documents", require("./routes/documents"));
  server.use("/api/v1/tasks", require("./routes/tasks"));
  
  server.get("/api", (req, res) => {
    res.status(200).json({ success: true, message: "Project Police API is running securely." });
  });

  // --- สำคัญที่สุด: โยน Request ที่ไม่ใช่ API ให้ Next.js จัดการ ---
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  // 4. เริ่มรัน Server
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Server (Next.js + Express) running on http://localhost:${PORT}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});

// จัดการ Error ที่ไม่ได้ดักจับ
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});