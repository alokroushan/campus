import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { Brain, Github, Twitter, Mail, Zap, TrendingUp, Filter } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

import { Project, User, AiFeedback } from './types';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';

// Pages
import { Feed } from './pages/Feed';
import { Startups } from './pages/Startups';
import { Freelance } from './pages/Freelance';
import { Talent } from './pages/Talent';
import { Post } from './pages/Post';
import { SkillForge } from './pages/SkillForge';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    // Initial Data Fetch with Mock Fallback for Vercel/Hackathon
    const fetchInitialData = async () => {
      try {
        const [projectsRes, usersRes, onlineRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/users'),
          fetch('/api/online-users')
        ]);

        if (!projectsRes.ok || !usersRes.ok || !onlineRes.ok) {
          throw new Error('Backend not available');
        }

        const projectsData = await projectsRes.json();
        const usersData = await usersRes.json();
        const onlineData = await onlineRes.json();

        setProjects(projectsData);
        setUsers(usersData);
        setOnlineUserIds(onlineData);
        setCurrentUser(usersData[0]);
      } catch (err) {
        console.warn("Backend fetch failed, using mock data for demo:", err);
        
        // Mock Users from PDF data
        const mockUsers: User[] = [
          { id: 1, name: "Nivedita Shikarwar", email: "nivedita@campus.edu", bio: "Full-stack dev & UI enthusiast. Building the future of campus tech.", avatar: "https://picsum.photos/seed/nivedita/200/200", skills: ["React", "Node.js", "Design"], availability: "Open to Startup" },
          { id: 2, name: "Aashi Bhalla", email: "aashi@campus.edu", bio: "Marketing major looking for tech partners to build sustainable startups.", avatar: "https://picsum.photos/seed/aashi/200/200", skills: ["Marketing", "Strategy", "Copywriting"], availability: "Open to Work" },
          { id: 3, name: "Aman Nath Singh", email: "aman.singh@campus.edu", bio: "ML & AI research. JEE: 13716146.", avatar: "https://picsum.photos/seed/aman/200/200", skills: ["TensorFlow", "PyTorch", "Python"], availability: "Open to Startup" },
          { id: 4, name: "Amanat Sharma", email: "amanat.sharma@campus.edu", bio: "Creative designer. PSEB background.", avatar: "https://picsum.photos/seed/amanat/200/200", skills: ["UI/UX", "Figma", "Tailwind"], availability: "Open to Work" },
          { id: 5, name: "Anish Kumar Singh", email: "anish.singh@campus.edu", bio: "Cybersecurity & ethical hacking. JEE: 22645280.", avatar: "https://picsum.photos/seed/anish/200/200", skills: ["Network Security", "Linux", "Python"], availability: "Busy" },
          { id: 6, name: "Aryan Kumar", email: "aryan.kumar@campus.edu", bio: "Mobile app developer. React Native specialist.", avatar: "https://picsum.photos/seed/aryan/200/200", skills: ["React Native", "Firebase", "TypeScript"], availability: "Open to Startup" },
          { id: 7, name: "Ashmit Malhotra", email: "ashmit.malhotra@campus.edu", bio: "Cloud architect & DevOps. JEE: 13719565.", avatar: "https://picsum.photos/seed/ashmit/200/200", skills: ["AWS", "Docker", "Kubernetes"], availability: "Open to Work" },
          { id: 8, name: "Birdavinder Singh Chothia", email: "birdavinder.singh@campus.edu", bio: "Embedded systems & IoT. PSEB background.", avatar: "https://picsum.photos/seed/birdavinder/200/200", skills: ["Arduino", "Raspberry Pi", "C"], availability: "Open to Startup" },
          { id: 9, name: "Cherrish Chhabra", email: "cherrish.chhabra@campus.edu", bio: "Blockchain & smart contracts. Web3 enthusiast.", avatar: "https://picsum.photos/seed/cherrish/200/200", skills: ["Solidity", "Ethereum", "Web3.js"], availability: "Open to Work" },
          { id: 10, name: "Daksh Thakur", email: "daksh.thakur@campus.edu", bio: "Game dev & 3D artist. PSEB background.", avatar: "https://picsum.photos/seed/daksh/200/200", skills: ["Unity", "C#", "Blender"], availability: "Busy" },
          { id: 11, name: "Devanshi Gupta", email: "devanshi.gupta@campus.edu", bio: "Frontend developer with a keen eye for detail. JEE: 17670478.", avatar: "https://picsum.photos/seed/devanshi/200/200", skills: ["Vue.js", "Sass", "JavaScript"], availability: "Open to Work" },
          { id: 12, name: "Guransh Singh Narang", email: "guransh.singh@campus.edu", bio: "Backend engineer interested in distributed systems.", avatar: "https://picsum.photos/seed/guransh/200/200", skills: ["Go", "Redis", "Microservices"], availability: "Open to Startup" },
          { id: 13, name: "Harsh", email: "harsh.sg@campus.edu", bio: "Competitive programmer and algorithm specialist.", avatar: "https://picsum.photos/seed/harsh1/200/200", skills: ["C++", "Java", "Algorithms"], availability: "Open to Work" },
          { id: 14, name: "Harsh Sharma", email: "harsh.sharma@campus.edu", bio: "Data scientist exploring big data technologies.", avatar: "https://picsum.photos/seed/harsh2/200/200", skills: ["Spark", "Hadoop", "Python"], availability: "Open to Startup" },
          { id: 15, name: "Ipshita Singh", email: "ipshita.singh@campus.edu", bio: "Product manager with a focus on user-centric design.", avatar: "https://picsum.photos/seed/ipshita/200/200", skills: ["Product Management", "Agile", "User Research"], availability: "Busy" },
          { id: 16, name: "Ishan Parmar", email: "ishan.parmar@campus.edu", bio: "Software engineer passionate about open source.", avatar: "https://picsum.photos/seed/ishan/200/200", skills: ["Git", "GitHub", "Open Source"], availability: "Open to Work" },
          { id: 17, name: "Ishika Jain", email: "ishika.jain@campus.edu", bio: "Web developer specializing in modern frameworks.", avatar: "https://picsum.photos/seed/ishika/200/200", skills: ["Next.js", "TypeScript", "Tailwind"], availability: "Open to Startup" },
          { id: 18, name: "Jaspreet Singh", email: "jaspreet.singh@campus.edu", bio: "System administrator and network engineer.", avatar: "https://picsum.photos/seed/jaspreet/200/200", skills: ["Networking", "Cisco", "Security"], availability: "Open to Work" },
          { id: 19, name: "Jattin Kumar", email: "jattin.kumar@campus.edu", bio: "Full-stack developer with a love for clean code.", avatar: "https://picsum.photos/seed/jattin/200/200", skills: ["Express", "MongoDB", "React"], availability: "Busy" },
          { id: 20, name: "Jiya Mor", email: "jiya.mor@campus.edu", bio: "UI designer focused on accessibility and inclusion.", avatar: "https://picsum.photos/seed/jiya/200/200", skills: ["Accessibility", "Figma", "Design Systems"], availability: "Open to Startup" },
          { id: 21, name: "Kartikey Shukla", email: "kartikey.shukla@campus.edu", bio: "AI/ML engineer building intelligent campus solutions.", avatar: "https://picsum.photos/seed/kartikey/200/200", skills: ["Deep Learning", "NLP", "Computer Vision"], availability: "Open to Work" },
          { id: 22, name: "Mohammad Ashar", email: "mohammad.ashar@campus.edu", bio: "DevOps specialist automating everything.", avatar: "https://picsum.photos/seed/ashar/200/200", skills: ["CI/CD", "Terraform", "Ansible"], availability: "Open to Startup" },
          { id: 23, name: "Najiya Khatun", email: "najiya.khatun@campus.edu", bio: "Frontend engineer creating immersive web experiences.", avatar: "https://picsum.photos/seed/najiya/200/200", skills: ["Three.js", "WebGL", "React"], availability: "Open to Work" },
          { id: 24, name: "Ojaswitha Patange", email: "ojaswitha.patange@campus.edu", bio: "Software tester ensuring high-quality releases.", avatar: "https://picsum.photos/seed/ojaswitha/200/200", skills: ["QA", "Selenium", "Jest"], availability: "Busy" },
          { id: 25, name: "Priyanshu Raj", email: "priyanshu.raj@campus.edu", bio: "Mobile developer building cross-platform apps.", avatar: "https://picsum.photos/seed/priyanshu/200/200", skills: ["Flutter", "Dart", "Firebase"], availability: "Open to Startup" },
          { id: 26, name: "Pulkit Dev Singh", email: "pulkit.singh@campus.edu", bio: "Backend developer focused on API performance.", avatar: "https://picsum.photos/seed/pulkit/200/200", skills: ["GraphQL", "Apollo", "Node.js"], availability: "Open to Work" },
          { id: 27, name: "Raunak Raj", email: "raunak.raj@campus.edu", bio: "Data analyst turning campus data into insights.", avatar: "https://picsum.photos/seed/raunak/200/200", skills: ["SQL", "Tableau", "Excel"], availability: "Open to Startup" },
          { id: 28, name: "Samarth Prashar", email: "samarth.prashar@campus.edu", bio: "Full-stack dev building community tools.", avatar: "https://picsum.photos/seed/samarth/200/200", skills: ["Next.js", "Prisma", "PostgreSQL"], availability: "Open to Work" },
          { id: 29, name: "Samim Badsha", email: "samim.badsha@campus.edu", bio: "Security researcher and bug bounty hunter.", avatar: "https://picsum.photos/seed/samim/200/200", skills: ["Penetration Testing", "Burp Suite", "Web Security"], availability: "Busy" },
          { id: 30, name: "Sarthak Tyagi", email: "sarthak.tyagi@campus.edu", bio: "Cloud engineer managing scalable infrastructure.", avatar: "https://picsum.photos/seed/sarthak/200/200", skills: ["Azure", "Cloud Formation", "Python"], availability: "Open to Startup" },
          { id: 31, name: "Satnam Singh", email: "satnam.singh@campus.edu", bio: "Frontend developer with a passion for animations.", avatar: "https://picsum.photos/seed/satnam/200/200", skills: ["Framer Motion", "GSAP", "React"], availability: "Open to Work" },
          { id: 32, name: "Shelja Sharma", email: "shelja.sharma@campus.edu", bio: "UX researcher understanding user needs.", avatar: "https://picsum.photos/seed/shelja/200/200", skills: ["UX Research", "Interviewing", "Personas"], availability: "Open to Startup" },
          { id: 33, name: "Shifa Firdaus", email: "shifa.firdaus@campus.edu", bio: "Full-stack developer building social platforms.", avatar: "https://picsum.photos/seed/shifa/200/200", skills: ["React", "Express", "Socket.io"], availability: "Open to Work" },
          { id: 34, name: "Shourya Thakur", email: "shourya.thakur@campus.edu", bio: "Software architect designing robust systems.", avatar: "https://picsum.photos/seed/shourya/200/200", skills: ["System Design", "Architecture", "Java"], availability: "Busy" },
          { id: 35, name: "Simran Kumari", email: "simran.kumari@campus.edu", bio: "Mobile dev creating sleek user interfaces.", avatar: "https://picsum.photos/seed/simran/200/200", skills: ["Swift", "iOS", "SwiftUI"], availability: "Open to Startup" },
          { id: 36, name: "Sujal Devpriya", email: "sujal.devpriya@campus.edu", bio: "Backend dev building real-time applications.", avatar: "https://picsum.photos/seed/sujal/200/200", skills: ["Node.js", "WebSockets", "Redis"], availability: "Open to Work" },
          { id: 37, name: "Sukhchain Singh", email: "sukhchain.singh@campus.edu", bio: "Cybersecurity student focused on defense.", avatar: "https://picsum.photos/seed/sukhchain/200/200", skills: ["SOC", "SIEM", "Security"], availability: "Open to Startup" },
          { id: 38, name: "Tanu Priya", email: "tanu.priya@campus.edu", bio: "Frontend dev with a love for CSS art.", avatar: "https://picsum.photos/seed/tanu/200/200", skills: ["CSS", "SVG", "React"], availability: "Open to Work" },
          { id: 39, name: "Vishu", email: "vishu.sg@campus.edu", bio: "Data engineer building robust data pipelines.", avatar: "https://picsum.photos/seed/vishu/200/200", skills: ["Python", "Airflow", "SQL"], availability: "Busy" },
          { id: 40, name: "Udayaveer Singh", email: "udayaveer.singh@campus.edu", bio: "Software engineer exploring cloud native tech.", avatar: "https://picsum.photos/seed/udayaveer/200/200", skills: ["Go", "Kubernetes", "Docker"], availability: "Open to Startup" },
          { id: 41, name: "Yatish Mangla", email: "yatish.mangla@campus.edu", bio: "Full-stack developer building campus tools.", avatar: "https://picsum.photos/seed/yatish/200/200", skills: ["React", "Node.js", "PostgreSQL"], availability: "Open to Work" },
          { id: 42, name: "Yesh Gorshi", email: "yesh.gorshi@campus.edu", bio: "Creative technologist blending art and code.", avatar: "https://picsum.photos/seed/yesh/200/200", skills: ["Creative Coding", "p5.js", "Three.js"], availability: "Open to Startup" },
          { id: 43, name: "Abhishek Kumar", email: "abhishek.kumar@campus.edu", bio: "Data scientist with a focus on predictive modeling.", avatar: "https://picsum.photos/seed/abhishek/200/200", skills: ["R", "Python", "Machine Learning"], availability: "Open to Work" },
          { id: 44, name: "Aditya Raj Tiwari", email: "aditya.tiwari@campus.edu", bio: "Frontend developer building responsive web apps.", avatar: "https://picsum.photos/seed/aditya_raj/200/200", skills: ["HTML", "CSS", "JavaScript"], availability: "Open to Startup" },
          { id: 45, name: "Ajitesh Singh", email: "ajitesh.singh@campus.edu", bio: "Backend developer interested in serverless architecture.", avatar: "https://picsum.photos/seed/ajitesh/200/200", skills: ["AWS Lambda", "Node.js", "DynamoDB"], availability: "Busy" },
          { id: 46, name: "Aman Negi", email: "aman.negi@campus.edu", bio: "UI/UX designer creating intuitive user journeys.", avatar: "https://picsum.photos/seed/negi/200/200", skills: ["Adobe XD", "Sketch", "Prototyping"], availability: "Open to Work" },
          { id: 47, name: "Aman Raj", email: "aman.raj@campus.edu", bio: "Full-stack developer with a passion for fintech.", avatar: "https://picsum.photos/seed/aman_raj/200/200", skills: ["React", "Java", "Spring Boot"], availability: "Open to Startup" },
          { id: 48, name: "Aman Thakur", email: "aman.thakur@campus.edu", bio: "Mobile developer building high-performance iOS apps.", avatar: "https://picsum.photos/seed/thakur/200/200", skills: ["Swift", "Objective-C", "Xcode"], availability: "Open to Work" },
          { id: 49, name: "Angel", email: "angel.sg@campus.edu", bio: "Software engineer focused on quality assurance.", avatar: "https://picsum.photos/seed/angel/200/200", skills: ["Testing", "Automation", "Cypress"], availability: "Busy" },
          { id: 50, name: "Anjali Kumari", email: "anjali.kumari@campus.edu", bio: "Frontend developer with a love for typography.", avatar: "https://picsum.photos/seed/anjali/200/200", skills: ["CSS", "Typography", "React"], availability: "Open to Startup" },
          { id: 51, name: "Ankit", email: "ankit.sg@campus.edu", bio: "Backend developer building scalable APIs.", avatar: "https://picsum.photos/seed/ankit_sg/200/200", skills: ["Python", "Django", "PostgreSQL"], availability: "Open to Work" },
          { id: 52, name: "Ankur Kashyap", email: "ankur.kashyap@campus.edu", bio: "Data analyst exploring campus trends.", avatar: "https://picsum.photos/seed/ankur/200/200", skills: ["Power BI", "SQL", "Python"], availability: "Open to Startup" },
          { id: 53, name: "Anubhav", email: "anubhav.sg@campus.edu", bio: "Software engineer interested in cloud computing.", avatar: "https://picsum.photos/seed/anubhav/200/200", skills: ["GCP", "Docker", "Go"], availability: "Busy" },
          { id: 54, name: "Ashish Kumar Burnwal", email: "ashish.burnwal@campus.edu", bio: "Full-stack developer building educational tools.", avatar: "https://picsum.photos/seed/burnwal/200/200", skills: ["React", "Node.js", "MongoDB"], availability: "Open to Work" },
          { id: 55, name: "Ayush Raj", email: "ayush.raj@campus.edu", bio: "Frontend developer focused on performance optimization.", avatar: "https://picsum.photos/seed/ayush/200/200", skills: ["Web Performance", "React", "JavaScript"], availability: "Open to Startup" },
          { id: 56, name: "Bharat Chouhan", email: "bharat.chouhan@campus.edu", bio: "Backend developer building secure systems.", avatar: "https://picsum.photos/seed/bharat/200/200", skills: ["Java", "Security", "MySQL"], availability: "Open to Work" },
          { id: 57, name: "Dheeraj Kumar", email: "dheeraj.kumar@campus.edu", bio: "Mobile developer building cross-platform apps.", avatar: "https://picsum.photos/seed/dheeraj/200/200", skills: ["React Native", "Expo", "TypeScript"], availability: "Busy" },
          { id: 58, name: "Divya Bharti", email: "divya.bharti@campus.edu", bio: "UI designer creating beautiful campus interfaces.", avatar: "https://picsum.photos/seed/divya/200/200", skills: ["Figma", "UI Design", "Branding"], availability: "Open to Startup" },
          { id: 59, name: "Gautam Kumar", email: "gautam.kumar@campus.edu", bio: "Full-stack developer with a focus on real-time features.", avatar: "https://picsum.photos/seed/gautam/200/200", skills: ["Socket.io", "React", "Node.js"], availability: "Open to Work" },
          { id: 60, name: "Govind Singh Bhati", email: "govind.bhati@campus.edu", bio: "Software engineer interested in blockchain tech.", avatar: "https://picsum.photos/seed/govind/200/200", skills: ["Solidity", "Smart Contracts", "Web3"], availability: "Open to Startup" },
          { id: 61, name: "Harshdeep Singh Sodhi", email: "harshdeep.sodhi@campus.edu", bio: "Backend developer building robust microservices.", avatar: "https://picsum.photos/seed/sodhi/200/200", skills: ["Go", "gRPC", "Docker"], availability: "Busy" },
          { id: 62, name: "Ishika Sharma", email: "ishika.sharma@campus.edu", bio: "Frontend developer with a passion for accessibility.", avatar: "https://picsum.photos/seed/ishika_sharma/200/200", skills: ["A11y", "React", "Tailwind"], availability: "Open to Work" },
          { id: 63, name: "Jatin Bansal", email: "jatin.bansal@campus.edu", bio: "Full-stack developer building campus tools.", avatar: "https://picsum.photos/seed/jatin_bansal/200/200", skills: ["React", "Express", "PostgreSQL"], availability: "Open to Startup" },
          { id: 64, name: "Lakshman Chandra Panda", email: "lakshman.panda@campus.edu", bio: "Data scientist exploring campus data.", avatar: "https://picsum.photos/seed/panda/200/200", skills: ["Python", "Pandas", "Matplotlib"], availability: "Open to Work" },
          { id: 66, name: "Alok Roushan", email: "alok.roushan@campus.edu", bio: "Full-stack developer building innovative solutions.", avatar: "https://picsum.photos/seed/alok/200/200", skills: ["Node.js", "React", "MongoDB"], availability: "Open to Startup" },
          { id: 67, name: "Amlan Roy", email: "amlan.roy@campus.edu", bio: "Backend developer interested in distributed databases.", avatar: "https://picsum.photos/seed/amlan/200/200", skills: ["Cassandra", "Java", "Spring"], availability: "Open to Work" },
          { id: 68, name: "Ankush Handa", email: "ankush.handa@campus.edu", bio: "Mobile developer building Android apps.", avatar: "https://picsum.photos/seed/ankush/200/200", skills: ["Kotlin", "Android SDK", "Jetpack Compose"], availability: "Open to Startup" },
          { id: 69, name: "Anurag", email: "anurag.sg@campus.edu", bio: "Software engineer focused on performance.", avatar: "https://picsum.photos/seed/anurag_sg/200/200", skills: ["C++", "Optimization", "Algorithms"], availability: "Busy" },
          { id: 70, name: "Archit Sharma", email: "archit.sharma@campus.edu", bio: "Frontend developer with a love for clean UI.", avatar: "https://picsum.photos/seed/archit/200/200", skills: ["React", "Tailwind", "Figma"], availability: "Open to Work" },
          { id: 71, name: "Arsh Kashyap", email: "arsh.kashyap@campus.edu", bio: "Backend developer building scalable systems.", avatar: "https://picsum.photos/seed/arsh/200/200", skills: ["Python", "FastAPI", "PostgreSQL"], availability: "Open to Startup" },
          { id: 72, name: "Aryan Sharma", email: "aryan.sharma@campus.edu", bio: "Data analyst turning data into stories.", avatar: "https://picsum.photos/seed/aryan_sharma/200/200", skills: ["Tableau", "SQL", "Python"], availability: "Open to Work" },
          { id: 73, name: "Anshul Choudhary", email: "anshul.choudhary@campus.edu", bio: "Software engineer interested in cloud native.", avatar: "https://picsum.photos/seed/anshul/200/200", skills: ["AWS", "Docker", "Terraform"], availability: "Busy" },
          { id: 74, name: "Barmeet Kaur", email: "barmeet.kaur@campus.edu", bio: "Frontend developer building accessible web apps.", avatar: "https://picsum.photos/seed/barmeet/200/200", skills: ["React", "A11y", "CSS"], availability: "Open to Work" },
          { id: 75, name: "Divyansh Wadhwa", email: "divyansh.wadhwa@campus.edu", bio: "Backend developer interested in real-time systems.", avatar: "https://picsum.photos/seed/divyansh/200/200", skills: ["Node.js", "Redis", "WebSockets"], availability: "Open to Startup" },
          { id: 76, name: "Gourav Kumar Meena", email: "gourav.meena@campus.edu", bio: "Full-stack developer with a focus on clean code.", avatar: "https://picsum.photos/seed/gourav/200/200", skills: ["React", "Express", "MongoDB"], availability: "Open to Work" },
          { id: 77, name: "Harsh Kumar", email: "harsh.kumar@campus.edu", bio: "Mobile developer building Android apps.", avatar: "https://picsum.photos/seed/harsh_k/200/200", skills: ["Kotlin", "Android", "Firebase"], availability: "Busy" },
          { id: 78, name: "Harshdeep Singh", email: "harshdeep.s@campus.edu", bio: "Software engineer interested in machine learning.", avatar: "https://picsum.photos/seed/harshdeep/200/200", skills: ["Python", "Scikit-Learn", "Data Science"], availability: "Open to Startup" },
          { id: 79, name: "Himanshu Kumar", email: "himanshu.kumar@campus.edu", bio: "Frontend developer with a passion for UI design.", avatar: "https://picsum.photos/seed/himanshu/200/200", skills: ["Figma", "React", "Tailwind"], availability: "Open to Work" },
          { id: 80, name: "Hitendra Rajan", email: "hitendra.rajan@campus.edu", bio: "Backend developer building scalable microservices.", avatar: "https://picsum.photos/seed/hitendra/200/200", skills: ["Java", "Spring Boot", "Docker"], availability: "Open to Startup" },
          { id: 81, name: "Ishan Kumar", email: "ishan.kumar@campus.edu", bio: "Software engineer focused on performance.", avatar: "https://picsum.photos/seed/ishan_k/200/200", skills: ["C++", "Algorithms", "Data Structures"], availability: "Busy" },
          { id: 82, name: "Jagdish Kumar", email: "jagdish.kumar@campus.edu", bio: "Full-stack developer building campus solutions.", avatar: "https://picsum.photos/seed/jagdish/200/200", skills: ["React", "Node.js", "PostgreSQL"], availability: "Open to Work" },
          { id: 83, name: "Jitender Kumar", email: "jitender.kumar@campus.edu", bio: "Mobile developer building iOS apps.", avatar: "https://picsum.photos/seed/jitender/200/200", skills: ["Swift", "iOS SDK", "SwiftUI"], availability: "Open to Startup" },
          { id: 84, name: "Kashish", email: "kashish.sg@campus.edu", bio: "Frontend developer with a love for animations.", avatar: "https://picsum.photos/seed/kashish_sg/200/200", skills: ["Framer Motion", "React", "JavaScript"], availability: "Open to Work" },
          { id: 85, name: "Komal", email: "komal.sg@campus.edu", bio: "Backend developer building secure APIs.", avatar: "https://picsum.photos/seed/komal/200/200", skills: ["Python", "Django", "Security"], availability: "Busy" }
        ];

        // Mock Projects
        const mockProjects: Project[] = [
          {
            id: 1,
            title: "EcoTrack App",
            description: "Building a smart campus recycling tracker to reward students for sustainable habits.",
            category: "Startup",
            owner_id: 1,
            owner_name: "Nivedita Shikarwar",
            owner_avatar: "https://picsum.photos/seed/nivedita/200/200",
            tags: ["Sustainability", "Mobile", "IoT"],
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Logo Design for Robotics Club",
            description: "Need a fresh, modern logo for the university robotics competition team.",
            category: "Freelance",
            owner_id: 2,
            owner_name: "Aashi Bhalla",
            owner_avatar: "https://picsum.photos/seed/aashi/200/200",
            tags: ["Graphic Design", "Branding"],
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "Campus AI Assistant",
            description: "Developing an LLM-powered assistant for university queries and schedules.",
            category: "Collaboration",
            owner_id: 3,
            owner_name: "Aman Nath Singh",
            owner_avatar: "https://picsum.photos/seed/aman/200/200",
            tags: ["AI", "NLP", "Python"],
            created_at: new Date().toISOString()
          }
        ];

        setProjects(mockProjects);
        setUsers(mockUsers);
        setOnlineUserIds([1, 2, 4, 6, 8, 11, 13, 17, 21, 25, 31, 35, 40, 44, 47, 50, 55, 60, 63, 66, 71, 75, 80, 83]);
        setCurrentUser(mockUsers[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const newSocket = io({
      reconnectionAttempts: 3,
      timeout: 5000,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect_error', (err) => {
      console.warn("Socket.io connection error (expected on static hosting):", err.message);
    });

    setSocket(newSocket);
    newSocket.on('presence_update', (ids: number[]) => {
      setOnlineUserIds(ids);
    });
    return () => { newSocket.close(); };
  }, []);

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('join', currentUser.id);
      return () => { socket.emit('leave', currentUser.id); };
    }
  }, [socket, currentUser]);

  const handleSaveProfile = async (updated: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const newUserData = { ...currentUser, ...updated } as User;
        setCurrentUser(newUserData);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? newUserData : u));
        setIsProfileModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleConvert = async (id: number, equity: any) => {
    try {
      const res = await fetch(`/api/projects/${id}/convert`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equity_split: equity })
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, category: 'Startup' } as Project : p));
      }
    } catch (err) { console.error(err); }
  };

  const handleAiFeedback = async (project: Project) => {
    setIsAiLoading(true);
    setAiFeedback(null);
    
    // Mock data for hackathon demo if API key is missing
    const mockFeedback: AiFeedback = {
      pros: ["High student engagement potential", "Scalable campus infrastructure", "Low initial overhead"],
      cons: ["Seasonal user retention", "Dependency on university policy", "Initial trust barrier"],
      score: 8,
      summary: "A solid campus-focused initiative. Focus on building a strong initial user base within a single department before scaling university-wide."
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Simulate loading for 1.5s then show mock data
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAiFeedback(mockFeedback);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this startup idea for a campus environment. Provide 3 pros, 3 cons, and a "Brutalist Score" from 1-10. 
        Title: ${project.title}
        Description: ${project.description}
        Return as JSON: { "pros": [], "cons": [], "score": 0, "summary": "" }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING }
            },
            required: ["pros", "cons", "score", "summary"]
          }
        }
      });
      
      const data = JSON.parse(response.text || "{}") as AiFeedback;
      setAiFeedback(data);
    } catch (err) { 
      console.error(err); 
      // Fallback or error state
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F0F0F0] font-sans text-black selection:bg-yellow-300">
        <Navbar currentUser={currentUser} onEditProfile={() => setIsProfileModalOpen(true)} />
        
        <AnimatePresence>
          {isProfileModalOpen && currentUser && (
            <ProfileModal 
              user={currentUser} 
              onClose={() => setIsProfileModalOpen(false)} 
              onSave={handleSaveProfile} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isAiLoading || aiFeedback) && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-zinc-900 text-white border-4 border-white p-8 max-w-2xl w-full shadow-[20px_20px_0px_0px_rgba(255,255,255,0.2)]"
              >
                {isAiLoading ? (
                  <div className="py-12 text-center">
                    <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-fuchsia-400" />
                    <h3 className="text-xl font-black uppercase tracking-widest">Gemini is analyzing...</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">AI Idea Audit</h3>
                        <p className="text-zinc-400 text-xs font-bold uppercase">
                          {process.env.GEMINI_API_KEY ? "Powered by Gemini 3 Flash" : "Demo Mode (Mock Analysis)"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-fuchsia-400">{aiFeedback?.score || 0}/10</div>
                        <div className="text-[10px] font-black uppercase">Brutalist Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="text-xs font-black uppercase mb-4 text-fuchsia-400 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> The Pros
                        </h4>
                        <ul className="space-y-2">
                          {(aiFeedback?.pros || []).map((p: string, i: number) => (
                            <li key={i} className="text-xs font-bold flex gap-2">
                              <span className="text-fuchsia-400">+</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase mb-4 text-orange-400 flex items-center gap-2">
                          <Filter className="w-4 h-4" /> The Cons
                        </h4>
                        <ul className="space-y-2">
                          {(aiFeedback?.cons || []).map((c: string, i: number) => (
                            <li key={i} className="text-xs font-bold flex gap-2">
                              <span className="text-orange-400">-</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 mb-8">
                      <p className="text-sm font-medium italic text-zinc-300">"{aiFeedback?.summary || 'No summary available.'}"</p>
                    </div>

                    <button 
                      onClick={() => setAiFeedback(null)}
                      className="w-full bg-white text-black py-4 text-xs font-black uppercase hover:bg-zinc-200 transition-colors"
                    >
                      Dismiss Audit
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Routes>
          <Route path="/" element={
            <Feed 
              projects={projects} 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
              onConvert={handleConvert}
              onFeedback={handleAiFeedback}
            />
          } />
          <Route path="/startups" element={
            <Startups 
              projects={projects} 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
              onConvert={handleConvert}
              onFeedback={handleAiFeedback}
            />
          } />
          <Route path="/freelance" element={
            <Freelance 
              projects={projects} 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
              onConvert={handleConvert}
              onFeedback={handleAiFeedback}
            />
          } />
          <Route path="/talent" element={
            <Talent 
              users={users} 
              onlineUserIds={onlineUserIds} 
              loading={loading} 
            />
          } />
          <Route path="/post" element={
            <Post currentUser={currentUser} />
          } />
          <Route path="/skills" element={
            <SkillForge projects={projects} currentUser={currentUser} />
          } />
        </Routes>

        <footer className="border-t-2 border-black bg-white py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
                  <Zap className="text-white w-5 h-5 fill-white" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">Campus Catalyst</span>
              </div>
              <p className="text-sm font-bold text-zinc-500 max-w-sm mb-6">
                Empowering the next generation of founders and creators right where they are.
              </p>
              <div className="flex gap-4">
                <Github className="w-5 h-5 cursor-pointer hover:text-fuchsia-500" />
                <Twitter className="w-5 h-5 cursor-pointer hover:text-fuchsia-500" />
                <Mail className="w-5 h-5 cursor-pointer hover:text-fuchsia-500" />
              </div>
            </div>
            <div>
              <h5 className="font-black uppercase text-xs mb-6">Platform</h5>
              <ul className="space-y-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <li className="hover:text-black cursor-pointer">Browse Talent</li>
                <li className="hover:text-black cursor-pointer">Startup Grants</li>
                <li className="hover:text-black cursor-pointer">Campus Partners</li>
                <li className="hover:text-black cursor-pointer">Success Stories</li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase text-xs mb-6">Support</h5>
              <ul className="space-y-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <li className="hover:text-black cursor-pointer">Guidelines</li>
                <li className="hover:text-black cursor-pointer">Privacy Policy</li>
                <li className="hover:text-black cursor-pointer">Terms of Service</li>
                <li className="hover:text-black cursor-pointer">Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-mono text-zinc-400 uppercase">© 2024 Campus Catalyst. Built for the bold.</p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase">
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" />
              System Operational
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
