import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares for parsing request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", smtp_configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS) });
  });

  // API Routes - Send Email via SMTP
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      res.status(400).json({ error: "Missing required fields: to, subject, and either text or html." });
      return;
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `"THE SOFTWARE DEVELOPMENT COMPANY" <noreply@thesoftwaredevelopmentcompany.com>`;

    if (!user || !pass) {
      console.warn("SMTP credentials not configured in environment variables. Simulating email send.");
      console.log(`[SMTP SIMULATION] To: ${to}\nSubject: ${subject}\nFrom: ${from}\nContent:\n${text || html}\n`);
      res.json({ 
        success: true, 
        simulated: true, 
        message: "No SMTP credentials configured. Email was logged to server console successfully. Please configure SMTP_USER and SMTP_PASS in secrets / .env to send real emails." 
      });
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

      console.log("Email dispatched successfully via SMTP:", info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error("Error sending email via Nodemailer:", err);
      
      const isAuthError = err.message && (
        err.message.includes("535") || 
        err.message.toLowerCase().includes("login") || 
        err.message.toLowerCase().includes("auth") ||
        err.message.toLowerCase().includes("username and password not accepted")
      );

      console.warn("[SMTP FALLBACK] Falling back to simulation mode due to SMTP error:", err.message);
      console.log(`[SMTP SIMULATION] To: ${to}\nSubject: ${subject}\nFrom: ${from}\nContent:\n${text || html}\n`);

      res.json({
        success: true,
        simulated: true,
        smtp_error: err.message,
        is_auth_error: !!isAuthError,
        message: `SMTP delivery failed (${err.message}). Safe simulated backup was logged to server console successfully.`
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
