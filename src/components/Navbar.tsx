import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Zap, Plus } from 'lucide-react';
import { User } from '../types';

export const Navbar = ({ currentUser, onEditProfile }: { currentUser: User | null, onEditProfile: () => void }) => (
  <nav className="border-b border-black bg-white sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
          <Zap className="text-white w-5 h-5 fill-white" />
        </div>
        <span className="font-black text-xl tracking-tighter uppercase">Campus Catalyst</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
        <NavLink to="/" className={({ isActive }) => isActive ? "underline underline-offset-4" : "hover:underline underline-offset-4"}>Feed</NavLink>
        <NavLink to="/startups" className={({ isActive }) => isActive ? "underline underline-offset-4" : "hover:underline underline-offset-4"}>Startups</NavLink>
        <NavLink to="/freelance" className={({ isActive }) => isActive ? "underline underline-offset-4" : "hover:underline underline-offset-4"}>Freelance</NavLink>
        <NavLink to="/talent" className={({ isActive }) => isActive ? "underline underline-offset-4" : "hover:underline underline-offset-4"}>Talent</NavLink>
      </div>
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onEditProfile}>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black leading-none group-hover:underline">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase">{currentUser.availability}</p>
            </div>
            <img src={currentUser.avatar} className="w-8 h-8 border-2 border-black rounded-full group-hover:scale-110 transition-transform" alt="" />
          </div>
        ) : (
          <button className="hidden sm:block text-xs font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
            Sign In
          </button>
        )}
        <Link to="/post" className="bg-black text-white text-xs font-bold uppercase px-4 py-2 hover:bg-zinc-800 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post
        </Link>
      </div>
    </div>
  </nav>
);
