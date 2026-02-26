import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { Project, User } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { Sidebar } from '../components/Sidebar';

interface FeedProps {
  projects: Project[];
  users: User[];
  onlineUserIds: number[];
  loading: boolean;
  onConvert: (id: number, equity: any) => void;
  onFeedback: (p: Project) => void;
}

export const Feed: React.FC<FeedProps> = ({ projects, users, onlineUserIds, loading, onConvert, onFeedback }) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesFilter = filter === 'All' || p.category === filter;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, searchQuery]);

  return (
    <>
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
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      users={users}
                      onlineUserIds={onlineUserIds}
                      onConvert={onConvert}
                      onFeedback={onFeedback}
                    />
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

          <aside className="lg:col-span-4">
            <Sidebar users={users} onlineUserIds={onlineUserIds} />
          </aside>
        </div>
      </main>
    </>
  );
};
