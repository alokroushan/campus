import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { Brain, Github, Twitter, Mail, Zap, TrendingUp, Filter } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

import { Project, User, AiFeedback } from './types';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';

// Pages
import { Feed } from './pages/Feed';
import { Startups } from './pages/Startups';
import { Freelance } from './pages/Freelance';
import { Talent } from './pages/Talent';
import { Post } from './pages/Post';
import { SkillForge } from './pages/SkillForge';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    // Initial Data Fetch with Mock Fallback for Vercel/Hackathon
    const fetchInitialData = async () => {
      try {
        const [projectsRes, usersRes, onlineRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/users'),
          fetch('/api/online-users')
        ]);

        if (!projectsRes.ok || !usersRes.ok || !onlineRes.ok) {
          throw new Error('Backend not available');
        }

        const projectsData = await projectsRes.json();
        const usersData = await usersRes.json();
        const onlineData = await onlineRes.json();

        setProjects(projectsData);
        setUsers(usersData);
        setOnlineUserIds(onlineData);
        setCurrentUser(usersData[0]);
      } catch (err) {
        console.warn("Backend fetch failed, using mock data for demo:", err);
        
        // Mock Users from PDF data
        const mockUsers: User[] = [
          { id: 1, name: "Nivedita Shikarwar", email: "nivedita@campus.edu", bio: "Full-stack dev & UI enthusiast. Building the future of campus tech.", avatar: "https://picsum.photos/seed/nivedita/200/200", skills: ["React", "Node.js", "Design"], availability: "Open to Startup" },
          { id: 2, name: "Aashi Bhalla", email: "aashi@campus.edu", bio: "Marketing major looking for tech partners to build sustainable startups.", avatar: "https://picsum.photos/seed/aashi/200/200", skills: ["Marketing", "Strategy", "Copywriting"], availability: "Open to Work" },
          { id: 3, name: "Aman Nath Singh", email: "aman.singh@campus.edu", bio: "ML & AI research. JEE: 13716146.", avatar: "https://picsum.photos/seed/aman/200/200", skills: ["TensorFlow", "PyTorch", "Python"], availability: "Open to Startup" },
          { id: 4, name: "Amanat Sharma", email: "amanat.sharma@campus.edu", bio: "Creative designer. PSEB background.", avatar: "https://picsum.photos/seed/amanat/200/200", skills: ["UI/UX", "Figma", "Tailwind"], availability: "Open to Work" },
          { id: 5, name: "Sakshi Sidhu", email: "sakshi.sidhu@campus.edu", bio: "Cybersecurity & ethical hacking. JEE: 22645280.", avatar: "https://picsum.photos/seed/anish/200/200", skills: ["Network Security", "Linux", "Python"], availability: "Busy" },
          ];

        // Mock Projects
        const mockProjects: Project[] = [
          {
            id: 1,
            title: "EcoTrack App",
            description: "Building a smart campus recycling tracker to reward students for sustainable habits.",
            category: "Startup",
            owner_id: 1,
            owner_name: "Nivedita Shikarwar",
            owner_avatar: "https://picsum.photos/seed/nivedita/200/200",
            tags: ["Sustainability", "Mobile", "IoT"],
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Logo Design for Robotics Club",
            description: "Need a fresh, modern logo for the university robotics competition team.",
            category: "Freelance",
            owner_id: 2,
            owner_name: "Aashi Bhalla",
            owner_avatar: "https://picsum.photos/seed/aashi/200/200",
            tags: ["Graphic Design", "Branding"],
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "Campus AI Assistant",
            description: "Developing an LLM-powered assistant for university queries and schedules.",
            category: "Collaboration",
            owner_id: 3,
            owner_name: "Aman Nath Singh",
            owner_avatar: "https://picsum.photos/seed/aman/200/200",
            tags: ["AI", "NLP", "Python"],
            created_at: new Date().toISOString()
          }
        ];

        setProjects(mockProjects);
        setUsers(mockUsers);
        setOnlineUserIds([1, 2, 4, 6, 8, 11, 13, 17, 21, 25, 31, 35, 40, 44, 47, 50, 55, 60, 63, 66, 71, 75, 80, 83]);
        setCurrentUser(mockUsers[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const newSocket = io({
      reconnectionAttempts: 3,
      timeout: 5000,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect_error', (err) => {
      console.warn("Socket.io connection error (expected on static hosting):", err.message);
    });

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
    
    // Mock data for hackathon demo if API key is missing
    const mockFeedback: AiFeedback = {
      pros: ["High student engagement potential", "Scalable campus infrastructure", "Low initial overhead"],
      cons: ["Seasonal user retention", "Dependency on university policy", "Initial trust barrier"],
      score: 8,
      summary: "A solid campus-focused initiative. Focus on building a strong initial user base within a single department before scaling university-wide."
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Simulate loading for 1.5s then show mock data
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAiFeedback(mockFeedback);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this startup idea for a campus environment. Provide 3 pros, 3 cons, and a "Brutalist Score" from 1-10. 
        Title: ${project.title}
        Description: ${project.description}
        Return as JSON: { "pros": [], "cons": [], "score": 0, "summary": "" }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING }
            },
            required: ["pros", "cons", "score", "summary"]
          }
        }
      });
      
      const data = JSON.parse(response.text || "{}") as AiFeedback;
      setAiFeedback(data);
    } catch (err) { 
      console.error(err); 
      // Fallback or error state
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F0F0F0] font-sans text-black selection:bg-yellow-300">
        <Navbar currentUser={currentUser} onEditProfile={() => setIsProfileModalOpen(true)} />
        
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
                    <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-fuchsia-400" />
                    <h3 className="text-xl font-black uppercase tracking-widest">Gemini is analyzing...</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">AI Idea Audit</h3>
                        <p className="text-zinc-400 text-xs font-bold uppercase">
                          {process.env.GEMINI_API_KEY ? "Powered by Gemini 3 Flash" : "Demo Mode (Mock Analysis)"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-fuchsia-400">{aiFeedback?.score || 0}/10</div>
                        <div className="text-[10px] font-black uppercase">Brutalist Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="text-xs font-black uppercase mb-4 text-fuchsia-400 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> The Pros
                        </h4>
                        <ul className="space-y-2">
                          {(aiFeedback?.pros || []).map((p: string, i: number) => (
                            <li key={i} className="text-xs font-bold flex gap-2">
                              <span className="text-fuchsia-400">+</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase mb-4 text-orange-400 flex items-center gap-2">
                          <Filter className="w-4 h-4" /> The Cons
                        </h4>
                        <ul className="space-y-2">
                          {(aiFeedback?.cons || []).map((c: string, i: number) => (
                            <li key={i} className="text-xs font-bold flex gap-2">
                              <span className="text-orange-400">-</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 mb-8">
                      <p className="text-sm font-medium italic text-zinc-300">"{aiFeedback?.summary || 'No summary available.'}"</p>
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
          <Route path="/skills" element={
            <SkillForge projects={projects} currentUser={currentUser} />
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
                <Github className="w-5 h-5 cursor-pointer hover:text-fuchsia-500" />
                <Twitter className="w-5 h-5 cursor-pointer hover:text-fuchsia-500" />
                <Mail className="w-5 h-5 cursor-pointer hover:text-fuchsia-500" />
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
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" />
              System Operational
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
