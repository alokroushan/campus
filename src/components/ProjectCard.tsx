import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Brain, ChevronRight } from 'lucide-react';
import { Project, User } from '../types';
import { SquadMatch } from './AdvancedFeatures';

export const ProjectCard: React.FC<{ 
  project: Project, 
  users: User[], 
  onlineUserIds: number[],
  onConvert: (id: number, equity: any) => void,
  onFeedback: (p: Project) => void
}> = ({ project, users, onlineUserIds, onConvert, onFeedback }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [equity, setEquity] = useState({ owner: 70, squad: 30 });

  const categoryColors = {
    Startup: 'bg-fuchsia-400',
    Collaboration: 'bg-blue-400',
    Freelance: 'bg-orange-400'
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group border-2 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col relative"
    >
      <AnimatePresence>
        {isConverting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-white p-6 flex flex-col justify-center border-2 border-black"
          >
            <h4 className="text-sm font-black uppercase mb-4">Equity Split Logic</h4>
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                  <span>Founder</span>
                  <span>{equity.owner}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={equity.owner} 
                  onChange={(e) => setEquity({ owner: Number(e.target.value), squad: 100 - Number(e.target.value) })}
                  className="w-full accent-black"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span>Squad Pool</span>
                <span>{equity.squad}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  onConvert(project.id, equity);
                  setIsConverting(false);
                }}
                className="flex-1 bg-black text-white py-2 text-[10px] font-black uppercase"
              >
                Confirm
              </button>
              <button 
                onClick={() => setIsConverting(false)}
                className="flex-1 border border-black py-2 text-[10px] font-black uppercase"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map(tag => (
          <span key={tag} className="text-[10px] font-bold uppercase text-zinc-400">#{tag}</span>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => onFeedback(project)}
          className="flex-1 border border-black p-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-50"
        >
          <Brain className="w-3 h-3" /> AI Feedback
        </button>
        {project.category !== 'Startup' && (
          <button 
            onClick={() => setIsConverting(true)}
            className="flex-1 bg-black text-white p-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-800"
          >
            <Rocket className="w-3 h-3" /> Convert to Startup
          </button>
        )}
      </div>

      <SquadMatch project={project} users={users} onlineUserIds={onlineUserIds} />

      <div className="flex items-center justify-between pt-4 mt-auto border-t border-zinc-100">
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
