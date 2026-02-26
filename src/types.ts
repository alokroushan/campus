export interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  skills: string[];
  portfolio_url?: string;
  availability: 'Open to Work' | 'Open to Startup' | 'Busy';
  last_seen?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: 'Startup' | 'Collaboration' | 'Freelance';
  owner_id: number;
  owner_name: string;
  owner_avatar: string;
  tags: string[];
  created_at: string;
}

export interface AiFeedback {
  pros: string[];
  cons: string[];
  score: number;
  summary: string;
}
