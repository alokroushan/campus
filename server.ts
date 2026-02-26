import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";

const db = new Database("campus_catalyst.db");

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
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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
