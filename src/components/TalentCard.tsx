import React from 'react';
import { motion } from 'motion/react';
import { User } from '../types';

export const TalentCard: React.FC<{ user: User, isOnline: boolean }> = ({ user, isOnline }) => (
  <motion.div 
    layout
    className="border-2 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all group"
  >
    <div className="flex items-start gap-4">
      <div className="relative">
        <img src={user.avatar} className="w-16 h-16 border-2 border-black rounded-sm bg-brand-yellow group-hover:rotate-6 transition-transform" alt="" />
        {isOnline && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand-green border-2 border-black rounded-full animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-black truncate uppercase tracking-tighter">{user.name}</h4>
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
            user.availability === 'Open to Startup' ? 'bg-brand-pink text-white' : 
            user.availability === 'Open to Work' ? 'bg-brand-cyan' : 'bg-zinc-200'
          }`}>
            {user.availability}
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 font-bold line-clamp-2 mb-3 leading-relaxed">{user.bio}</p>
        <div className="flex flex-wrap gap-1">
          {user.skills.slice(0, 3).map(skill => (
            <span key={skill} className="text-[8px] font-black uppercase bg-brand-yellow/20 border border-black/10 px-2 py-0.5">{skill}</span>
          ))}
          {user.skills.length > 3 && <span className="text-[8px] font-black text-brand-pink uppercase">+{user.skills.length - 3} more</span>}
        </div>
      </div>
    </div>
  </motion.div>
);
