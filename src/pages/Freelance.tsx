import React from 'react';
import { Project, User } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { Sidebar } from '../components/Sidebar';

interface FreelanceProps {
  projects: Project[];
  users: User[];
  onlineUserIds: number[];
  loading: boolean;
  onConvert: (id: number, equity: any) => void;
  onFeedback: (p: Project) => void;
}

export const Freelance: React.FC<FreelanceProps> = ({ projects, users, onlineUserIds, loading, onConvert, onFeedback }) => {
  const freelanceProjects = projects.filter(p => p.category === 'Freelance');

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Freelance Gigs</h1>
        <p className="text-zinc-600 font-bold">Quick tasks, real money, campus talent.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-zinc-200 animate-pulse border-2 border-black" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freelanceProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  users={users}
                  onlineUserIds={onlineUserIds}
                  onConvert={onConvert}
                  onFeedback={onFeedback}
                />
              ))}
              {freelanceProjects.length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-300">
                  <p className="text-zinc-400 font-bold uppercase">No freelance gigs available right now.</p>
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
  );
};
