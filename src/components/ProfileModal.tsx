import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';

export const ProfileModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (updated: Partial<User>) => void }) => {
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
