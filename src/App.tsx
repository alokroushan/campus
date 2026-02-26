import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { Brain, Github, Twitter, Mail, Zap, TrendingUp, Filter } from 'lucide-react';

import { Project, User } from './types';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';

// Pages
import { Feed } from './pages/Feed';
import { Startups } from './pages/Startups';
import { Freelance } from './pages/Freelance';
import { Talent } from './pages/Talent';
import { Post } from './pages/Post';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    // Initial Data Fetch
    Promise.all([
      fetch('/api/projects').then(res => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      }),
      fetch('/api/users').then(res => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      }),
      fetch('/api/online-users').then(res => {
        if (!res.ok) throw new Error("Failed to fetch online users");
        return res.json();
      }),
      fetch('/api/auth/user').then(res => {
        if (!res.ok) throw new Error("Failed to fetch auth user");
        return res.json();
      })
    ]).then(([projectsData, usersData, onlineData, authUser]) => {
      setProjects(projectsData);
      setUsers(usersData);
      setOnlineUserIds(onlineData);
      setCurrentUser(authUser);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch data:", err);
      setError("The backend is not responding. If you are hosting on Vercel, ensure your API routes are correctly configured and you are using a remote database instead of SQLite.");
      setLoading(false);
    });

    const newSocket = io();
    setSocket(newSocket);
    newSocket.on('presence_update', (ids: number[]) => {
      setOnlineUserIds(ids);
    });
    return () => { newSocket.close(); };
  }, []);

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('join', currentUser.id);
      return () => { socket.emit('leave', currentUser.id); };
    }
  }, [socket, currentUser]);

  const handleSaveProfile = async (updated: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const newUserData = { ...currentUser, ...updated } as User;
        setCurrentUser(newUserData);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? newUserData : u));
        setIsProfileModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleConvert = async (id: number, equity: any) => {
    try {
      const res = await fetch(`/api/projects/${id}/convert`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equity_split: equity })
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, category: 'Startup' } as Project : p));
      }
    } catch (err) { console.error(err); }
  };

  const handleAiFeedback = async (project: Project) => {
    setIsAiLoading(true);
    setAiFeedback(null);
    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: project.title, description: project.description })
      });
      const data = await res.json();
      setAiFeedback(data);
    } catch (err) { console.error(err); }
    setIsAiLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
    } catch (err) { console.error(err); }
  };

  const handleLoginSuccess = async () => {
    try {
      const res = await fetch('/api/auth/user');
      const user = await res.json();
      setCurrentUser(user);
    } catch (err) { console.error(err); }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F0F0F0] font-sans text-black selection:bg-yellow-300">
        <Navbar 
          currentUser={currentUser} 
          onEditProfile={() => setIsProfileModalOpen(true)} 
          onLogout={handleLogout}
          onLoginSuccess={handleLoginSuccess}
        />

        {error && (
          <div className="max-w-7xl mx-auto px-4 mt-8">
            <div className="bg-red-50 border-2 border-red-500 p-6 text-red-700 font-bold">
              <h2 className="text-xl font-black uppercase mb-2">Connection Error</h2>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {isProfileModalOpen && currentUser && (
            <ProfileModal 
              user={currentUser} 
              onClose={() => setIsProfileModalOpen(false)} 
              onSave={handleSaveProfile} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isAiLoading || aiFeedback) && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-zinc-900 text-white border-4 border-white p-8 max-w-2xl w-full shadow-[20px_20px_0px_0px_rgba(255,255,255,0.2)]"
              >
                {isAiLoading ? (
                  <div className="py-12 text-center">
                    <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-emerald-400" />
                    <h3 className="text-xl font-black uppercase tracking-widest">Gemini is analyzing...</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">AI Idea Audit</h3>
                        <p className="text-zinc-400 text-xs font-bold uppercase">Powered by Gemini 3 Flash</p>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-emerald-400">{aiFeedback.score}/10</div>
                        <div className="text-[10px] font-black uppercase">Brutalist Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="text-xs font-black uppercase mb-4 text-emerald-400 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> The Pros
                        </h4>
                        <ul className="space-y-2">
                          {aiFeedback.pros.map((p: string, i: number) => (
                            <li key={i} className="text-xs font-bold flex gap-2">
                              <span className="text-emerald-400">+</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase mb-4 text-orange-400 flex items-center gap-2">
                          <Filter className="w-4 h-4" /> The Cons
                        </h4>
                        <ul className="space-y-2">
                          {aiFeedback.cons.map((c: string, i: number) => (
                            <li key={i} className="text-xs font-bold flex gap-2">
                              <span className="text-orange-400">-</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 mb-8">
                      <p className="text-sm font-medium italic text-zinc-300">"{aiFeedback.summary}"</p>
                    </div>

                    <button 
                      onClick={() => setAiFeedback(null)}
                      className="w-full bg-white text-black py-4 text-xs font-black uppercase hover:bg-zinc-200 transition-colors"
                    >
                      Dismiss Audit
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Routes>
          <Route path="/" element={
            <Feed 
              projects={projects} 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
              onConvert={handleConvert}
              onFeedback={handleAiFeedback}
            />
          } />
          <Route path="/startups" element={
            <Startups 
              projects={projects} 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
              onConvert={handleConvert}
              onFeedback={handleAiFeedback}
            />
          } />
          <Route path="/freelance" element={
            <Freelance 
              projects={projects} 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
              onConvert={handleConvert}
              onFeedback={handleAiFeedback}
            />
          } />
          <Route path="/talent" element={
            <Talent 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
            />
          } />
          <Route path="/post" element={
            <Post currentUser={currentUser} />
          } />
        </Routes>

        <footer className="border-t-2 border-black bg-white py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
                  <Zap className="text-white w-5 h-5 fill-white" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">Campus Catalyst</span>
              </div>
              <p className="text-sm font-bold text-zinc-500 max-w-sm mb-6">
                Empowering the next generation of founders and creators right where they are.
              </p>
              <div className="flex gap-4">
                <Github className="w-5 h-5 cursor-pointer hover:text-emerald-500" />
                <Twitter className="w-5 h-5 cursor-pointer hover:text-emerald-500" />
                <Mail className="w-5 h-5 cursor-pointer hover:text-emerald-500" />
              </div>
            </div>
            <div>
              <h5 className="font-black uppercase text-xs mb-6">Platform</h5>
              <ul className="space-y-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <li className="hover:text-black cursor-pointer">Browse Talent</li>
                <li className="hover:text-black cursor-pointer">Startup Grants</li>
                <li className="hover:text-black cursor-pointer">Campus Partners</li>
                <li className="hover:text-black cursor-pointer">Success Stories</li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase text-xs mb-6">Support</h5>
              <ul className="space-y-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <li className="hover:text-black cursor-pointer">Guidelines</li>
                <li className="hover:text-black cursor-pointer">Privacy Policy</li>
                <li className="hover:text-black cursor-pointer">Terms of Service</li>
                <li className="hover:text-black cursor-pointer">Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-mono text-zinc-400 uppercase">© 2024 Campus Catalyst. Built for the bold.</p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              System Operational
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
