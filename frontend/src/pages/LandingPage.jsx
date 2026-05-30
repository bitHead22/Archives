import { Link } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { BookOpen, Sparkles, ArrowUpRight, BarChart } from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'

export default function LandingPage() {
  const { user } = useAuthContext()

  return (
    <div className="bg-[#000000] text-white font-sans min-h-screen flex flex-col overflow-x-hidden selection:bg-[#C6F174] selection:text-black">
      <nav className="fixed top-0 z-50 w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-bold text-2xl tracking-tight text-white">Archives</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link className="text-sm font-medium text-[#888888] hover:text-white transition-colors" to="/about">About</Link>
            <a className="text-sm font-medium text-[#888888] hover:text-white transition-colors" href="/about#developer">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/select-course" className="h-12 px-6 flex items-center justify-center bg-[#C6F174] text-black text-sm font-bold rounded-2xl hover:bg-white transition-colors duration-300">
                  Go to Courses
                </Link>
                <UserAvatar />
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium text-white hover:text-[#C6F174] transition-colors mr-4 hidden sm:block">
                  Log In
                </Link>
                <Link to="/auth" className="h-12 px-6 flex items-center justify-center bg-[#C6F174] text-black text-sm font-bold rounded-2xl hover:bg-white transition-colors duration-300">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col relative pt-32">
        <section className="max-w-7xl mx-auto px-6 mb-24 w-full">
          <div className="flex flex-col">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter text-white leading-[0.9]">
              Past Papers
            </h1>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 mt-4 lg:mt-0">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-light italic tracking-tighter text-[#C6F174] leading-[0.9]">
                Made Smart
              </h1>
              <p className="mt-4 lg:mt-2 text-xl text-[#888888] max-w-sm font-light leading-relaxed relative top-2">
                Your ultimate academic archive. Navigate your university journey with organized past papers and RAG-powered AI assistance.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full px-6 mb-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#C6F174] rounded-2xl p-12 md:p-16 flex flex-col justify-between min-h-[400px]">
              <div className="flex justify-between items-start">
                <span className="text-black font-medium text-lg">Curriculum Database</span>
                <BookOpen className="text-black" size={32} />
              </div>
              <div>
                <span className="block text-5xl md:text-7xl font-bold text-black tracking-tighter mb-4">Organized</span>
                <p className="text-black/80 text-xl font-medium max-w-sm">Access a structured repository of past university papers categorized by Degree, Branch, and Semester.</p>
              </div>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-12 md:p-16 flex flex-col justify-between min-h-[400px] group hover:bg-[#151515] transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-white font-medium text-lg">RAG-Powered AI</span>
                <Sparkles className="text-[#C6F174]" size={32} />
              </div>
              <div>
                <span className="block text-5xl md:text-7xl font-bold text-white tracking-tighter mb-4">Contextual</span>
                <p className="text-[#888888] text-xl font-light max-w-sm">Get precise answers extracted directly from the actual question papers using advanced Retrieval-Augmented Generation.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mb-32 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
              Intelligence designed for the <span className="text-[#C6F174]">ambitious student</span>.
            </h2>
            <a className="pb-2 border-b border-white/20 text-white hover:text-[#C6F174] hover:border-[#C6F174] transition-colors flex items-center gap-2" href="#">
              Explore All Features <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111111] rounded-2xl p-8 flex flex-col gap-8 h-full">
              <div className="bg-[#1a1a1a] w-full aspect-[4/3] rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="w-32 h-32 rounded-full border border-[#C6F174]/20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#C6F174]/10 flex items-center justify-center">
                    <Sparkles className="text-[#C6F174]" size={24} />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-medium text-white mb-3">Chat with Past Papers</h3>
                <p className="text-[#888888] font-light leading-relaxed">
                  Stop scrolling through endless PDFs. Ask questions directly and let our AI extract exact answers with source context from your exam papers.
                </p>
              </div>
            </div>
            <div className="bg-[#111111] rounded-2xl p-8 flex flex-col gap-8 h-full">
              <div className="bg-[#1a1a1a] w-full aspect-[4/3] rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-1/2 absolute bottom-0 flex gap-4 px-8 items-end">
                  <div className="w-1/3 h-[40%] bg-white/5 rounded-t-lg"></div>
                  <div className="w-1/3 h-[70%] bg-[#C6F174]/80 rounded-t-lg"></div>
                  <div className="w-1/3 h-[50%] bg-white/10 rounded-t-lg"></div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-medium text-white mb-3">Organized by Curriculum</h3>
                <p className="text-[#888888] font-light leading-relaxed">
                  Navigate seamlessly through your specific Degree, Branch, and Semester. Browse papers for First Term, Second Term, and End Semesters.
                </p>
              </div>
            </div>
            <div className="bg-[#111111] rounded-2xl p-8 flex flex-col gap-8 h-full">
              <div className="bg-[#1a1a1a] w-full aspect-[4/3] rounded-xl flex items-center justify-center relative overflow-hidden">
                <BarChart size={64} className="text-white/20" />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-white mb-3">Search & Filter</h3>
                <p className="text-[#888888] font-light leading-relaxed">
                  Quickly filter available question papers by year and exam type, ensuring you focus only on the most relevant past questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-[#111111] py-32">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-light leading-tight text-white text-center max-w-4xl mx-auto">
              "Archives transforms the chaotic pre-exam scramble into a <span className="text-[#C6F174]">structured, strategic advantage</span>."
            </h2>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="border-t border-white/10 pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-6xl md:text-8xl font-medium tracking-tighter text-white mb-8">
                  First Class<br />Preparation
                </h2>
                <div className="flex gap-4">
                  {user ? (
                    <Link to="/select-course" className="h-14 flex items-center justify-center px-8 bg-[#C6F174] text-black text-lg font-bold rounded-2xl hover:bg-white transition-colors duration-300">
                      Go to Courses
                    </Link>
                  ) : (
                    <Link to="/auth" className="h-14 flex items-center justify-center px-8 bg-[#C6F174] text-black text-lg font-bold rounded-2xl hover:bg-white transition-colors duration-300">
                      Get Started
                    </Link>
                  )}
                  <button className="h-14 px-8 bg-transparent border border-white/20 text-white text-lg font-medium rounded-2xl hover:border-[#C6F174] hover:text-[#C6F174] transition-colors duration-300">
                    View Demo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 lg:pl-20 pt-4">
                <div className="flex flex-col gap-4">
                  <h4 className="text-white font-bold mb-2">Platform</h4>
                  <a className="text-[#888888] hover:text-white transition-colors" href="#">Roadmaps</a>
                  <a className="text-[#888888] hover:text-white transition-colors" href="#">Past Papers</a>
                  <a className="text-[#888888] hover:text-white transition-colors" href="#">AI Tutor</a>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-white font-bold mb-2">Company</h4>
                  <Link className="text-[#888888] hover:text-white transition-colors" to="/about">About</Link>
                  <a className="text-[#888888] hover:text-white transition-colors" href="#">Careers</a>
                  <a className="text-[#888888] hover:text-white transition-colors" href="/about#developer">Contact</a>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end mt-24 pt-8 border-t border-white/5">
              <p className="text-[#888888] text-sm">© 2026 Archives. All Rights Reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a className="text-[#888888] hover:text-white text-sm transition-colors" href="#">Privacy</a>
                <a className="text-[#888888] hover:text-white text-sm transition-colors" href="#">Terms</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
