import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { User } from '../types';
import { TalentCard } from '../components/TalentCard';

interface TalentProps {
  users: User[];
  onlineUserIds: number[];
  loading: boolean;
}

export const Talent: React.FC<TalentProps> = ({ users, onlineUserIds, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Campus Talent</h1>
          <p className="text-zinc-600 font-bold">Discover the best creators and founders on campus.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or skill..." 
            className="pl-10 pr-4 py-2 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 ring-yellow-300 w-full md:w-80"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-zinc-200 animate-pulse border-2 border-black" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <TalentCard key={user.id} user={user} isOnline={onlineUserIds.includes(user.id)} />
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-300">
              <p className="text-zinc-400 font-bold uppercase">No talent found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
