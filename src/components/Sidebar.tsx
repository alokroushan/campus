import React from 'react';
import { Sparkles, Code, Palette, Megaphone, Globe, Circle } from 'lucide-react';
import { User } from '../types';
import { TalentCard } from './TalentCard';
import { ContributionHeatmap, RevenueCalculator } from './AdvancedFeatures';

export const Sidebar = ({ users, onlineUserIds }: { users: User[], onlineUserIds: number[] }) => (
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

    <ContributionHeatmap />
    
    <RevenueCalculator />

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
