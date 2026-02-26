import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import { GoogleGenAI } from "@google/genai";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("campus_catalyst.db");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar TEXT,
    skills TEXT, -- JSON array
    portfolio_url TEXT,
    availability TEXT DEFAULT 'Open to Work', -- 'Open to Work', 'Open to Startup', 'Busy'
    google_id TEXT UNIQUE,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add google_id if it doesn't exist
try {
  db.prepare("SELECT google_id FROM users LIMIT 1").get();
} catch (e) {
  try {
    db.prepare("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE").run();
  } catch (err) {
    console.log("Migration: google_id column already exists or failed to add.");
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Startup', 'Collaboration', 'Freelance'
    owner_id INTEGER,
    tags TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS collaborations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    user_id INTEGER,
    role TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  // Session configuration for iframe context
  app.use(session({
    secret: process.env.SESSION_SECRET || "campus-catalyst-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "dummy",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    callbackURL: `${process.env.APP_URL}/api/auth/google/callback`,
    proxy: true
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0].value;
    const name = profile.displayName;
    const avatar = profile.photos?.[0].value;
    const googleId = profile.id;

    let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId) as any;
    
    if (!user) {
      const result = db.prepare(
        "INSERT INTO users (name, email, avatar, google_id, skills) VALUES (?, ?, ?, ?, ?)"
      ).run(name, email, avatar, googleId, JSON.stringify([]));
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    }
    
    return done(null, user);
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    done(null, user);
  });

  // Auth Routes
  app.get("/api/auth/google", (req, res, next) => {
    const redirectUri = `${process.env.APP_URL}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile email',
      prompt: 'select_account'
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    }
  );

  app.get("/api/auth/user", (req, res) => {
    res.json(req.user || null);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Presence Tracking
  const onlineUsers = new Set<number>();

  io.on("connection", (socket) => {
    socket.on("join", (userId: number) => {
      onlineUsers.add(userId);
      io.emit("presence_update", Array.from(onlineUsers));
    });

    socket.on("disconnect", () => {
      // In a real app, we'd map socket.id to userId
      // For this demo, we'll just broadcast updates periodically or on explicit leave
    });

    socket.on("leave", (userId: number) => {
      onlineUsers.delete(userId);
      io.emit("presence_update", Array.from(onlineUsers));
    });
  });

  // API Routes
  app.get("/api/online-users", (req, res) => {
    res.json(Array.from(onlineUsers));
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users.map(u => ({
      ...u,
      skills: JSON.parse(u.skills || '[]')
    })));
  });

  app.put("/api/users/:id", (req, res) => {
    const { bio, skills, portfolio_url, availability } = req.body;
    db.prepare(
      "UPDATE users SET bio = ?, skills = ?, portfolio_url = ?, availability = ? WHERE id = ?"
    ).run(bio, JSON.stringify(skills), portfolio_url, availability, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/ai-feedback", async (req, res) => {
    const { title, description } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this startup idea for a campus environment. Provide 3 pros, 3 cons, and a "Brutalist Score" from 1-10. 
        Title: ${title}
        Description: ${description}
        Return as JSON: { "pros": [], "cons": [], "score": 0, "summary": "" }`
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "AI Feedback failed" });
    }
  });

  app.post("/api/projects/:id/convert", (req, res) => {
    const { equity_split } = req.body; // Expecting { owner: 60, squad: 40 }
    db.prepare(
      "UPDATE projects SET category = 'Startup' WHERE id = ?"
    ).run(req.params.id);
    
    // In a real app, we'd save the equity split to a new table
    console.log(`Project ${req.params.id} converted with equity:`, equity_split);
    
    res.json({ success: true });
  });

  app.post("/api/projects", (req, res) => {
    const { title, description, category, owner_id, tags } = req.body;
    const result = db.prepare(
      "INSERT INTO projects (title, description, category, owner_id, tags) VALUES (?, ?, ?, ?, ?)"
    ).run(title, description, category, owner_id, JSON.stringify(tags));
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/projects", (req, res) => {
    const projects = db.prepare(`
      SELECT p.*, u.name as owner_name, u.avatar as owner_avatar 
      FROM projects p 
      JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(projects.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]')
    })));
  });

  app.post("/api/projects", (req, res) => {
    const { title, description, category, owner_id, tags } = req.body;
    const info = db.prepare(
      "INSERT INTO projects (title, description, category, owner_id, tags) VALUES (?, ?, ?, ?, ?)"
    ).run(title, description, category, owner_id, JSON.stringify(tags));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (user) {
      user.skills = JSON.parse(user.skills || '[]');
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Seed data if empty
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare("INSERT INTO users (name, email, bio, avatar, skills, portfolio_url, availability) VALUES (?, ?, ?, ?, ?, ?, ?)");
    insertUser.run("Alex Chen", "alex@campus.edu", "Full-stack dev & UI enthusiast", "https://picsum.photos/seed/alex/100/100", JSON.stringify(["React", "Node.js", "Design"]), "https://github.com/alex", "Open to Startup");
    insertUser.run("Sarah Miller", "sarah@campus.edu", "Marketing major looking for tech partners", "https://picsum.photos/seed/sarah/100/100", JSON.stringify(["Marketing", "Strategy", "Copywriting"]), "https://sarah.design", "Open to Work");
    
    const insertProject = db.prepare("INSERT INTO projects (title, description, category, owner_id, tags) VALUES (?, ?, ?, ?, ?)");
    insertProject.run("EcoTrack App", "Building a smart campus recycling tracker.", "Startup", 1, JSON.stringify(["Sustainability", "Mobile"]));
    insertProject.run("Logo Design for Club", "Need a fresh logo for the Robotics club.", "Freelance", 2, JSON.stringify(["Graphic Design", "Branding"]));
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
