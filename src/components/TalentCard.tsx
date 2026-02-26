import React from 'react';
import { motion } from 'motion/react';
import { User } from '../types';

export const TalentCard: React.FC<{ user: User, isOnline: boolean }> = ({ user, isOnline }) => (
  <motion.div 
    layout
    className="border-2 border-black bg-white p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
  >
    <div className="flex items-start gap-4">
      <div className="relative">
        <img src={user.avatar} className="w-12 h-12 border-2 border-black rounded-sm" alt="" />
        {isOnline && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-fuchsia-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-black truncate">{user.name}</h4>
          <span className={`text-[8px] font-black uppercase px-1 border border-black ${
            user.availability === 'Open to Startup' ? 'bg-purple-400' : 
            user.availability === 'Open to Work' ? 'bg-fuchsia-400' : 'bg-zinc-200'
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
