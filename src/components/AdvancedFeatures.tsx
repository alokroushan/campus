import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Calculator, Flame } from 'lucide-react';
import { Project, User } from '../types';

export const ContributionHeatmap = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weeks = 12;
  
  return (
    <div className="border-2 border-black p-4 bg-white">
      <h4 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2">
        <TrendingUp className="w-3 h-3" /> Contribution Heatmap
      </h4>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 pr-2">
          {days.map((d, i) => (
            <span key={i} className="text-[8px] font-bold text-zinc-400 h-2 flex items-center">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-1 flex-1">
          {Array.from({ length: weeks * 7 }).map((_, i) => {
            const intensity = Math.random();
            const color = intensity > 0.8 ? 'bg-emerald-500' : 
                          intensity > 0.5 ? 'bg-emerald-300' : 
                          intensity > 0.2 ? 'bg-emerald-100' : 'bg-zinc-100';
            return (
              <div 
                key={i} 
                className={`w-full aspect-square border border-black/5 ${color} hover:border-black transition-all cursor-crosshair`}
                title={`Activity: ${Math.floor(intensity * 100)}%`}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-[8px] font-mono text-zinc-400 uppercase">Last 90 Days</span>
        <div className="flex gap-1 items-center">
          <span className="text-[8px] font-mono text-zinc-400 uppercase">Less</span>
          <div className="w-2 h-2 bg-zinc-100 border border-black/5" />
          <div className="w-2 h-2 bg-emerald-100 border border-black/5" />
          <div className="w-2 h-2 bg-emerald-300 border border-black/5" />
          <div className="w-2 h-2 bg-emerald-500 border border-black/5" />
          <span className="text-[8px] font-mono text-zinc-400 uppercase">More</span>
        </div>
      </div>
    </div>
  );
};

export const RevenueCalculator = () => {
  const [revenue, setRevenue] = useState(1000);
  const [members, setMembers] = useState(3);
  const [equity, setEquity] = useState(20);

  const perMember = (revenue * (1 - equity/100)) / members;

  return (
    <div className="border-2 border-black p-4 bg-orange-50">
      <h4 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2">
        <Calculator className="w-3 h-3" /> Revenue Split Calc
      </h4>
      <div className="space-y-3">
        <div>
          <label className="block text-[8px] font-black uppercase mb-1">Monthly Revenue ($)</label>
          <input 
            type="number" 
            value={revenue} 
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="w-full border border-black p-1 text-[10px] font-bold focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[8px] font-black uppercase mb-1">Team Size</label>
            <input 
              type="number" 
              value={members} 
              onChange={(e) => setMembers(Number(e.target.value))}
              className="w-full border border-black p-1 text-[10px] font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[8px] font-black uppercase mb-1">Reserve (%)</label>
            <input 
              type="number" 
              value={equity} 
              onChange={(e) => setEquity(Number(e.target.value))}
              className="w-full border border-black p-1 text-[10px] font-bold focus:outline-none"
            />
          </div>
        </div>
        <div className="pt-2 border-t border-black/10">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase">Per Member:</span>
            <span className="text-sm font-black text-orange-600">${perMember.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SquadMatch = ({ project, users, onlineUserIds }: { project: Project, users: User[], onlineUserIds: number[] }) => {
  const matches = useMemo(() => {
    return users
      .filter(u => u.id !== project.owner_id)
      .map(u => {
        const matchingSkills = u.skills.filter(s => 
          project.tags.some(t => t.toLowerCase().includes(s.toLowerCase()))
        );
        return { user: u, score: matchingSkills.length, skills: matchingSkills };
      })
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  }, [project, users]);

  if (matches.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-zinc-900 text-white border-2 border-black">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
        <span className="text-[10px] font-black uppercase tracking-wider">Squad Auto-Match</span>
      </div>
      <div className="space-y-2">
        {matches.map(m => (
          <div key={m.user.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src={m.user.avatar} className="w-6 h-6 border border-white/20" alt="" />
                {onlineUserIds.includes(m.user.id) && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold leading-none">{m.user.name}</p>
                <p className="text-[8px] text-zinc-400 uppercase">{m.skills.join(', ')}</p>
              </div>
            </div>
            <button className="text-[8px] font-black uppercase border border-white/20 px-2 py-1 hover:bg-white hover:text-black transition-colors">
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
