import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Zap, Plus } from 'lucide-react';
import { User } from '../types';

export const Navbar = ({ currentUser, onEditProfile }: { currentUser: User | null, onEditProfile: () => void }) => (
  <nav className="border-b-4 border-black bg-white sticky top-0 z-50 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
    <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-brand-pink flex items-center justify-center rounded-sm border-2 border-black group-hover:rotate-12 transition-transform">
          <Zap className="text-white w-6 h-6 fill-white" />
        </div>
        <span className="font-black text-2xl tracking-tighter uppercase italic">Campus Catalyst</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest">
        <NavLink to="/" className={({ isActive }) => isActive ? "bg-brand-yellow px-2 py-1 border-2 border-black" : "hover:bg-brand-cyan px-2 py-1 border-2 border-transparent hover:border-black transition-all"}>Feed</NavLink>
        <NavLink to="/startups" className={({ isActive }) => isActive ? "bg-brand-yellow px-2 py-1 border-2 border-black" : "hover:bg-brand-cyan px-2 py-1 border-2 border-transparent hover:border-black transition-all"}>Startups</NavLink>
        <NavLink to="/freelance" className={({ isActive }) => isActive ? "bg-brand-yellow px-2 py-1 border-2 border-black" : "hover:bg-brand-cyan px-2 py-1 border-2 border-transparent hover:border-black transition-all"}>Freelance</NavLink>
        <NavLink to="/talent" className={({ isActive }) => isActive ? "bg-brand-yellow px-2 py-1 border-2 border-black" : "hover:bg-brand-cyan px-2 py-1 border-2 border-transparent hover:border-black transition-all"}>Talent</NavLink>
      </div>
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onEditProfile}>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black leading-none group-hover:underline">{currentUser.name}</p>
              <p className="text-[10px] font-black text-brand-pink uppercase">{currentUser.availability}</p>
            </div>
            <img src={currentUser.avatar} className="w-10 h-10 border-2 border-black rounded-full group-hover:scale-110 transition-transform bg-brand-yellow" alt="" />
          </div>
        ) : (
          <button className="hidden sm:block text-xs font-black uppercase border-2 border-black px-4 py-2 hover:bg-brand-cyan transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            Sign In
          </button>
        )}
        <Link to="/post" className="bg-brand-pink text-white text-xs font-black uppercase px-6 py-3 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post
        </Link>
      </div>
    </div>
  </nav>
);
