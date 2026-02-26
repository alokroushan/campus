import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calculator, Flame, BarChart3, Brain } from 'lucide-react';
import * as d3 from 'd3';
import { Project, User } from '../types';

export const PlatformAnalysis = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [analysis, setAnalysis] = useState<string>("Analyzing platform trends...");

  useEffect(() => {
    if (!svgRef.current) return;

    const data = [
      { day: 'Mon', value: 30 },
      { day: 'Tue', value: 45 },
      { day: 'Wed', value: 35 },
      { day: 'Thu', value: 60 },
      { day: 'Fri', value: 85 },
      { day: 'Sat', value: 50 },
      { day: 'Sun', value: 75 }
    ];

    const margin = { top: 10, right: 10, bottom: 20, left: 25 };
    const width = 280 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(data.map(d => d.day))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(8))
      .attr("font-family", "inherit")
      .attr("font-size", "8px")
      .attr("font-weight", "900")
      .selectAll("text")
      .style("text-transform", "uppercase")
      .style("color", "#71717a");

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(3).tickSize(0).tickPadding(5))
      .attr("font-family", "inherit")
      .attr("font-size", "8px")
      .attr("font-weight", "900")
      .selectAll("text")
      .style("color", "#71717a");

    // Line
    const line = d3.line<any>()
      .x(d => x(d.day)!)
      .y(d => y(d.value)!)
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#d946ef")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Area
    const area = d3.area<any>()
      .x(d => x(d.day)!)
      .y0(height)
      .y1(d => y(d.value)!)
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "rgba(217, 70, 239, 0.1)")
      .attr("d", area);

    // Dots
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.day)!)
      .attr("cy", d => y(d.value)!)
      .attr("r", 4)
      .attr("fill", "black")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis("Platform activity spiked by 24% on Friday. Tech-stack searches are dominating the weekend trend.");
    }, 1500);

  }, []);

  return (
    <div className="border-4 border-black p-6 bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black uppercase flex items-center gap-2 tracking-tighter">
          <BarChart3 className="w-4 h-4" /> PLATFORM ANALYSIS
        </h4>
        <span className="text-[8px] font-black bg-fuchsia-500 text-white px-2 py-0.5 uppercase">Live</span>
      </div>
      
      <div className="mb-6 overflow-hidden">
        <svg ref={svgRef} className="mx-auto" />
      </div>

      <div className="bg-zinc-900 p-4 border-2 border-black">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-3 h-3 text-fuchsia-400" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Insights</span>
        </div>
        <p className="text-[10px] font-bold text-zinc-400 leading-relaxed italic">
          "{analysis}"
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center pt-4 border-t-2 border-zinc-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-500 uppercase">+12.5% Growth</span>
        </div>
        <span className="text-[8px] font-black text-zinc-400 uppercase">Updated 2m ago</span>
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
