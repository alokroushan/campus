import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, CheckCircle2, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Project, User } from '../types';

interface RoadmapStep {
  title: string;
  description: string;
  resources: string[];
}

interface Roadmap {
  skill: string;
  difficulty: string;
  estimatedTime: string;
  steps: RoadmapStep[];
  youtubePlaylist?: { title: string; url: string };
  nptelCourse?: { title: string; url: string };
}

interface SkillForgeProps {
  projects: Project[];
  currentUser: User | null;
}

export const SkillForge: React.FC<SkillForgeProps> = ({ projects, currentUser }) => {
  const [skillInput, setSkillInput] = useState('');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRoadmap = async () => {
    if (!skillInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    // Mock data for hackathon demo if API key is missing
    const mockRoadmap: Roadmap = {
      skill: skillInput,
      difficulty: "Intermediate",
      estimatedTime: "4-6 Weeks",
      youtubePlaylist: { title: `Best of ${skillInput} Tutorials`, url: `https://www.youtube.com/results?search_query=${skillInput}+playlist` },
      nptelCourse: { title: `Introduction to ${skillInput}`, url: `https://www.google.com/search?q=nptel+${skillInput}` },
      steps: [
        { title: "Foundations & Setup", description: "Learn the basic syntax and environment setup required for professional development.", resources: ["Official Docs", "Getting Started Guide"] },
        { title: "Core Concepts", description: "Master the fundamental building blocks and architectural patterns.", resources: ["Video Series", "Interactive Labs"] },
        { title: "Intermediate Projects", description: "Build 2-3 small scale applications to solidify your understanding.", resources: ["Project Templates", "GitHub Repos"] },
        { title: "Advanced Optimization", description: "Focus on performance, security, and best practices for production.", resources: ["Tech Blogs", "Case Studies"] },
        { title: "Portfolio Integration", description: "Deploy your work and document the process for your professional portfolio.", resources: ["Vercel", "Portfolio Site"] }
      ]
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Simulate loading for 1.5s then show mock data
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRoadmap(mockRoadmap);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a professional learning roadmap for the skill: "${skillInput}". 
        Focus on a student in a campus environment. 
        Provide 5 clear steps with descriptions and suggested resource types.
        Also suggest one specific YouTube lecture playlist title and one NPTEL course title that would be highly relevant.
        Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              estimatedTime: { type: Type.STRING },
              youtubePlaylist: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING, description: "A search URL for this playlist on YouTube" }
                },
                required: ["title", "url"]
              },
              nptelCourse: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING, description: "A search URL for this course on NPTEL or Google" }
                },
                required: ["title", "url"]
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "description", "resources"]
                }
              }
            },
            required: ["skill", "difficulty", "estimatedTime", "steps", "youtubePlaylist", "nptelCourse"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}") as Roadmap;
      setRoadmap(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const relevantProjects = roadmap 
    ? projects.filter(p => 
        p.tags.some(t => t.toLowerCase().includes(roadmap.skill.toLowerCase())) ||
        p.description.toLowerCase().includes(roadmap.skill.toLowerCase())
      ).slice(0, 3)
    : [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-fuchsia-500 flex items-center justify-center rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <Brain className="text-white w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Skill Forge</h1>
        </div>
        <p className="text-lg font-bold text-zinc-600 max-w-2xl">
          Level up your campus career. Use AI to generate custom learning roadmaps and find projects to practice your new skills.
          {!process.env.GEMINI_API_KEY && <span className="block mt-2 text-fuchsia-500 text-xs uppercase">[ Demo Mode Active ]</span>}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Input & Roadmap */}
        <div className="lg:col-span-8">
          <section className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-12">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" /> Forge a New Skill
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateRoadmap()}
                placeholder="e.g., React, UI Design, Marketing Strategy..." 
                className="flex-1 px-4 py-4 border-4 border-black bg-[#F0F0F0] text-sm font-black uppercase focus:outline-none focus:bg-white transition-colors"
              />
              <button 
                onClick={generateRoadmap}
                disabled={isLoading || !skillInput.trim()}
                className="bg-black text-white px-8 py-4 text-sm font-black uppercase hover:bg-fuchsia-500 transition-colors disabled:opacity-50 disabled:hover:bg-black flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Ignite Forge <Zap className="w-4 h-4 fill-current" /></>
                )}
              </button>
            </div>
            {error && <p className="mt-4 text-red-500 font-bold text-xs uppercase">{error}</p>}
          </section>

          <AnimatePresence mode="wait">
            {roadmap && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="bg-yellow-300 border-2 border-black px-4 py-1 text-[10px] font-black uppercase">
                    Difficulty: {roadmap.difficulty}
                  </div>
                  <div className="bg-fuchsia-400 border-2 border-black px-4 py-1 text-[10px] font-black uppercase">
                    Est. Time: {roadmap.estimatedTime}
                  </div>
                </div>

                <div className="space-y-6">
                  {roadmap.steps.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative pl-12 pb-8 border-l-4 border-black last:pb-0"
                    >
                      <div className="absolute left-[-16px] top-0 w-8 h-8 bg-white border-4 border-black flex items-center justify-center font-black text-sm group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
                        {idx + 1}
                      </div>
                      <h3 className="text-xl font-black uppercase mb-2 group-hover:text-fuchsia-600 transition-colors">{step.title}</h3>
                      <p className="text-sm font-bold text-zinc-600 mb-4 leading-relaxed">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res, rIdx) => (
                          <span key={rIdx} className="text-[10px] font-mono bg-zinc-100 border border-black/10 px-2 py-1 uppercase">
                            {res}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Recommended Projects & Stats */}
        <div className="lg:col-span-4 space-y-12">
          {roadmap && (
            <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(254,240,138,1)]">
              <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-600" /> Recommended Courses
              </h2>
              <div className="space-y-6">
                {roadmap.youtubePlaylist && (
                  <div className="group">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">YouTube Playlist</p>
                    <a 
                      href={roadmap.youtubePlaylist.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 border-2 border-black hover:bg-zinc-50 transition-colors"
                    >
                      <h4 className="font-black text-sm uppercase mb-1 group-hover:text-fuchsia-600">{roadmap.youtubePlaylist.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                        View on YouTube <ArrowRight className="w-3 h-3" />
                      </div>
                    </a>
                  </div>
                )}
                {roadmap.nptelCourse && (
                  <div className="group">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">NPTEL Course</p>
                    <a 
                      href={roadmap.nptelCourse.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 border-2 border-black hover:bg-zinc-50 transition-colors"
                    >
                      <h4 className="font-black text-sm uppercase mb-1 group-hover:text-fuchsia-600">{roadmap.nptelCourse.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                        View on NPTEL <ArrowRight className="w-3 h-3" />
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {roadmap && (
            <section className="bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
              <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-fuchsia-400" /> Practice Grounds
              </h2>
              <p className="text-xs font-bold text-zinc-400 mb-6 uppercase tracking-widest">
                Real campus projects needing {roadmap.skill}
              </p>
              
              <div className="space-y-4">
                {relevantProjects.length > 0 ? relevantProjects.map(project => (
                  <div key={project.id} className="p-4 border border-white/20 hover:border-fuchsia-400 transition-colors group cursor-pointer">
                    <h4 className="font-black text-sm uppercase mb-1 group-hover:text-fuchsia-400">{project.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white/10">{project.category}</span>
                      <ArrowRight className="w-3 h-3 text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center border border-dashed border-white/20">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">No active projects matching this skill yet.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-[#F0F0F0] border-4 border-black p-8">
            <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Learning Tips
            </h2>
            <ul className="space-y-4">
              {[
                "Build small, fail fast, learn faster.",
                "Find a project partner in the Talent directory.",
                "Document your progress in your portfolio.",
                "Teach what you learn to solidify knowledge."
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
};
