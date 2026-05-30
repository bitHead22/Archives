import { Link } from 'react-router-dom'
import { Briefcase, Code, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'
import { useAuthContext } from '@/context/AuthContext'

const GithubIcon = ({ size = 24, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
)

const LinkedinIcon = ({ size = 24, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

export default function AboutPage() {
  const { user } = useAuthContext()

  return (
    <div className="bg-[#000000] text-white font-sans min-h-screen flex flex-col overflow-x-hidden selection:bg-[#C6F174] selection:text-black">
      {/* Navbar similar to landing */}
      <nav className="sticky top-0 z-50 w-full bg-[#000000]/80 backdrop-blur-sm border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-bold text-2xl tracking-tight text-white">Archives</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/select-course" className="text-sm font-medium text-[#888888] hover:text-[#C6F174] transition-colors">Courses</Link>
                <UserAvatar />
              </div>
            ) : (
              <Link to="/auth" className="h-10 px-6 flex items-center justify-center bg-[#C6F174] text-black text-sm font-bold rounded-2xl hover:bg-white transition-colors">
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-5xl font-light tracking-tight text-white mb-12">
          About <span className="text-[#C6F174]">Archives</span>
        </h1>

        <section className="bg-[#111111] border border-[#222222] rounded-2xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-medium text-white mb-6">What this platform does</h2>
          <ul className="space-y-4 text-[#888888] font-light leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#C6F174] flex-shrink-0 mt-1" size={20} />
              <span>Provides a highly organized, comprehensive repository of past university question papers structured by Degree, Branch, and Semester.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#C6F174] flex-shrink-0 mt-1" size={20} />
              <span>Features an intelligent, context-aware RAG-powered AI chat assistant that can read the papers and extract precise, source-backed answers to your queries.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#C6F174] flex-shrink-0 mt-1" size={20} />
              <span>Allows students to effortlessly search, filter, and view exam documents categorized into First Term, Second Term, and End Semesters.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#C6F174] flex-shrink-0 mt-1" size={20} />
              <span>Acts as a strategic study companion designed to replace the chaotic pre-exam scramble with structured, high-yield preparation.</span>
            </li>
          </ul>
        </section>

        <section id="developer" className="bg-[#111111] border border-[#222222] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-start scroll-mt-24">
          <div className="w-32 h-32 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center flex-shrink-0 overflow-hidden">
            <span className="text-4xl text-[#C6F174] font-medium tracking-widest">AT</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-medium text-white mb-2">Ayushman Tiwari</h2>
            <h3 className="text-[#C6F174] text-sm uppercase tracking-widest font-bold mb-4">Creator & Developer</h3>
            <p className="text-[#888888] font-light leading-relaxed mb-8">
              A passionate software developer dedicated to building impactful tools that solve real-world problems. With a focus on intuitive design and cutting-edge technologies like AI and modern web frameworks, Ayushman created Archives to streamline the academic journey for students everywhere.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-6">
              <a href="https://www.linkedin.com/in/ayushman-tiwari-a64b1028b/" target="_blank" rel="noreferrer" className="text-[#888888] hover:text-[#C6F174] transition-colors" aria-label="LinkedIn">
                <LinkedinIcon size={24} />
              </a>
              <a href="https://github.com/bitHead22" target="_blank" rel="noreferrer" className="text-[#888888] hover:text-white transition-colors" aria-label="GitHub">
                <GithubIcon size={24} />
              </a>
              <a href="mailto:ayushmantiwari033@gmail.com" className="text-[#888888] hover:text-[#C6F174] transition-colors" aria-label="Email">
                <Mail size={24} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 bg-transparent border-t border-[#262626] mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#555555] text-xs">© 2026 Archives Education Platform. Built by Ayushman Tiwari.</p>
        </div>
      </footer>
    </div>
  )
}
