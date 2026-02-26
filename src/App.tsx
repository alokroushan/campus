import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Users, 
  Briefcase, 
  Search, 
  Plus, 
  Github, 
  Twitter, 
  Mail,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  Code,
  Palette,
  Megaphone,
  Filter,
  User as UserIcon,
  Circle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Project, User } from './types';

// --- Components ---

const ProfileModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (updated: Partial<User>) => void }) => {
  const [formData, setFormData] = useState({
    bio: user.bio,
    skills: user.skills.join(', '),
    portfolio_url: user.portfolio_url || '',
    availability: user.availability
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
      >
        <h2 className="text-2xl font-black uppercase mb-6">Edit Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none focus:ring-2 ring-yellow-300"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Skills (comma separated)</label>
            <input 
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none focus:ring-2 ring-yellow-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Portfolio URL</label>
            <input 
              type="text"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none focus:ring-2 ring-yellow-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Availability</label>
            <select 
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
              className="w-full border-2 border-black p-2 text-xs font-bold focus:outline-none focus:ring-2 ring-yellow-300"
            >
              <option value="Open to Work">Open to Work</option>
              <option value="Open to Startup">Open to Startup</option>
              <option value="Busy">Busy</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => onSave({
              ...formData,
              skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            })}
            className="flex-1 bg-black text-white py-3 text-xs font-black uppercase hover:bg-zinc-800 transition-colors"
          >
            Save Changes
          </button>
          <button 
            onClick={onClose}
            className="flex-1 border-2 border-black py-3 text-xs font-black uppercase hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ currentUser, onEditProfile }: { currentUser: User | null, onEditProfile: () => void }) => (
  <nav className="border-b border-black bg-white sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
          <Zap className="text-white w-5 h-5 fill-white" />
        </div>
        <span className="font-black text-xl tracking-tighter uppercase">Campus Catalyst</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
        <a href="#" className="hover:underline underline-offset-4">Feed</a>
        <a href="#" className="hover:underline underline-offset-4">Startups</a>
        <a href="#" className="hover:underline underline-offset-4">Freelance</a>
        <a href="#" className="hover:underline underline-offset-4">Talent</a>
      </div>
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onEditProfile}>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black leading-none group-hover:underline">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase">{currentUser.availability}</p>
            </div>
            <img src={currentUser.avatar} className="w-8 h-8 border-2 border-black rounded-full group-hover:scale-110 transition-transform" alt="" />
          </div>
        ) : (
          <button className="hidden sm:block text-xs font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
            Sign In
          </button>
        )}
        <button className="bg-black text-white text-xs font-bold uppercase px-4 py-2 hover:bg-zinc-800 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post
        </button>
      </div>
    </div>
  </nav>
);

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const categoryColors = {
    Startup: 'bg-emerald-400',
    Collaboration: 'bg-blue-400',
    Freelance: 'bg-orange-400'
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group border-2 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-black uppercase px-2 py-1 border border-black ${categoryColors[project.category]}`}>
          {project.category}
        </span>
        <span className="text-[10px] font-mono text-zinc-500">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-xl font-black mb-2 leading-tight group-hover:underline cursor-pointer">
        {project.title}
      </h3>
      <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map(tag => (
          <span key={tag} className="text-[10px] font-bold uppercase text-zinc-400">#{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2">
          <img src={project.owner_avatar} className="w-6 h-6 rounded-full border border-black" alt="" />
          <span className="text-xs font-bold">{project.owner_name}</span>
        </div>
        <button className="text-xs font-black uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
          Details <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const TalentCard: React.FC<{ user: User, isOnline: boolean }> = ({ user, isOnline }) => (
  <motion.div 
    layout
    className="border-2 border-black bg-white p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
  >
    <div className="flex items-start gap-4">
      <div className="relative">
        <img src={user.avatar} className="w-12 h-12 border-2 border-black rounded-sm" alt="" />
        {isOnline && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-black truncate">{user.name}</h4>
          <span className={`text-[8px] font-black uppercase px-1 border border-black ${
            user.availability === 'Open to Startup' ? 'bg-purple-400' : 
            user.availability === 'Open to Work' ? 'bg-emerald-400' : 'bg-zinc-200'
          }`}>
            {user.availability}
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 line-clamp-1 mb-2">{user.bio}</p>
        <div className="flex flex-wrap gap-1">
          {user.skills.slice(0, 3).map(skill => (
            <span key={skill} className="text-[8px] font-bold uppercase bg-zinc-100 px-1">{skill}</span>
          ))}
          {user.skills.length > 3 && <span className="text-[8px] font-bold text-zinc-400">+{user.skills.length - 3}</span>}
        </div>
      </div>
    </div>
  </motion.div>
);

const Sidebar = ({ users, onlineUserIds }: { users: User[], onlineUserIds: number[] }) => (
  <div className="space-y-8">
    <div className="border-2 border-black p-6 bg-yellow-300">
      <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> Trending Skills
      </h4>
      <div className="space-y-3">
        {[
          { name: 'React Native', count: 24, icon: Code },
          { name: 'UI/UX Design', count: 18, icon: Palette },
          { name: 'Growth Hacking', count: 12, icon: Megaphone },
          { name: 'Solidity', count: 8, icon: Globe },
        ].map(skill => (
          <div key={skill.name} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2">
              <skill.icon className="w-4 h-4" />
              <span className="text-xs font-bold group-hover:underline">{skill.name}</span>
            </div>
            <span className="text-[10px] font-mono bg-white px-1 border border-black">{skill.count}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="border-2 border-black p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black uppercase text-sm">Active Talent</h4>
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase">{onlineUserIds.length} Online</span>
        </div>
      </div>
      <div className="space-y-4">
        {users.slice(0, 5).map(user => (
          <TalentCard key={user.id} user={user} isOnline={onlineUserIds.includes(user.id)} />
        ))}
      </div>
      <button className="w-full mt-6 text-xs font-black uppercase border-2 border-black py-2 hover:bg-black hover:text-white transition-colors">
        View All Talent
      </button>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // Initial Data Fetch
    Promise.all([
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/users').then(res => res.json()),
      fetch('/api/online-users').then(res => res.json())
    ]).then(([projectsData, usersData, onlineData]) => {
      setProjects(projectsData);
      setUsers(usersData);
      setOnlineUserIds(onlineData);
      // For demo purposes, set the first user as current user
      setCurrentUser(usersData[0]);
      setLoading(false);
    });

    // Socket Setup
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('presence_update', (ids: number[]) => {
      setOnlineUserIds(ids);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Handle Presence
  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('join', currentUser.id);
      return () => {
        socket.emit('leave', currentUser.id);
      };
    }
  }, [socket, currentUser]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesFilter = filter === 'All' || p.category === filter;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, searchQuery]);

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
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  return (
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
      
      <header className="bg-white border-b-2 border-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-6"
            >
              Build the <span className="text-emerald-500">Future</span> <br />
              Inside <span className="underline decoration-8 decoration-yellow-300 underline-offset-8">Campus</span>.
            </motion.h1>
            <p className="text-lg font-bold text-zinc-600 max-w-xl">
              The ultimate platform for student entrepreneurs, freelancers, and creators to find their next big collaboration.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div className="flex flex-wrap gap-2">
                {['All', 'Startup', 'Collaboration', 'Freelance'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 text-xs font-black uppercase border-2 border-black transition-all ${
                      filter === cat ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects or skills..." 
                  className="pl-10 pr-4 py-2 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 ring-yellow-300 w-full sm:w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 4].map(i => (
                  <div key={i} className="h-64 bg-zinc-200 animate-pulse border-2 border-black" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </AnimatePresence>
                {filteredProjects.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-300">
                    <p className="text-zinc-400 font-bold uppercase">No projects found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <Sidebar users={users} onlineUserIds={onlineUserIds} />
          </aside>
        </div>
      </main>

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
  );
}
