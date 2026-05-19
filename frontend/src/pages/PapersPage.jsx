import { useState, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { usePapers } from '@/hooks/usePapers'
import { useSolvedPapers } from '@/hooks/useSolvedPapers'
import { Search } from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'

// ...
const TERM_LABELS = {
  'first_term': 'First Term',
  'second_term': 'Second Term',
  'mid_term': 'Mid-Term',
  'end_sem': 'End-Term',
  'supplementary': 'Supplementary'
}

export default function PapersPage() {
  const { semesterId } = useParams()
  const [searchParams] = useSearchParams()
  const termParam = searchParams.get('term')
  const yearParam = searchParams.get('year')
  
  const [searchQuery, setSearchQuery] = useState('')
  
  const { papers, loading, error } = usePapers(semesterId)
  const { solvedPapers, toggleSolved } = useSolvedPapers()

  const filteredPapers = useMemo(() => {
    if (!papers) return []
    let filtered = papers

    if (termParam) {
      filtered = filtered.filter(p => p.exam_type === termParam)
    }
    if (yearParam) {
      filtered = filtered.filter(p => p.year && p.year.toString() === yearParam)
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.year && p.year.toString().includes(searchQuery))
      )
    }
    return filtered
  }, [papers, termParam, yearParam, searchQuery])

  // Group papers dynamically by their exact exam type from the database
  const groupedPapers = useMemo(() => {
    return filteredPapers.reduce((acc, paper) => {
      const typeKey = paper.exam_type || 'Other'
      const label = TERM_LABELS[typeKey] || typeKey
      if (!acc[label]) acc[label] = []
      acc[label].push(paper)
      return acc
    }, {})
  }, [filteredPapers])

  return (
    <div className="bg-black text-white font-display min-h-screen flex flex-col overflow-x-hidden antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-4 text-white hover:text-neutral-300 transition-colors">
              <div className="size-6 text-white">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-white text-base font-bold tracking-tight">Archives</h2>
            </Link>
          </div>
          <div className="flex flex-1 justify-end gap-4 md:gap-6 items-center">
            <div className="hidden sm:flex items-center">
              <div className="relative w-64 group/search">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <Search size={16} />
                </span>
                <input 
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-sm focus:ring-1 focus:ring-white focus:border-white block pl-10 p-2 placeholder-neutral-500 transition-colors" 
                  placeholder="Search papers..." 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {/* User Profile */}
            <UserAvatar />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-8 px-6">
        <div className="w-full max-w-[1400px] flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2 text-sm text-neutral-500 font-mono uppercase tracking-wider">
              <Link className="hover:text-white transition-colors" to="/select-course">Courses</Link>
              <span>/</span>
              <a className="hover:text-white transition-colors cursor-pointer" onClick={() => window.history.back()}>Semester</a>
              <span>/</span>
              <span className="text-white font-medium">{(termParam ? TERM_LABELS[termParam] || termParam : 'All Papers')} {yearParam && `(${yearParam})`}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-800 pb-8">
              <div className="flex flex-col gap-2 max-w-2xl">
                <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tighter uppercase">
                  Select Question Paper
                </h1>
                <p className="text-neutral-400 text-base md:text-lg font-light leading-relaxed">
                  Browse past year papers curated directly for your active term. 
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 text-neutral-500">Loading resources...</div>
          ) : error ? (
            <div className="p-8 border border-red-500/20 bg-red-500/10 text-red-500 rounded-sm">{error}</div>
          ) : Object.keys(groupedPapers).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 bg-neutral-900/10 text-center">
              <span className="material-symbols-outlined text-neutral-700 text-[32px] mb-2">folder_off</span>
              <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest">No matching papers</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {Object.entries(groupedPapers).map(([examType, papersList]) => (
                <section key={examType} className="flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase">{examType}</h2>
                    <div className="h-px flex-1 bg-neutral-800"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {papersList.map(paper => {
                      const isSolved = !!solvedPapers[paper.id]
                      
                      return (
                      <div key={paper.id} className="group flex flex-col gap-4 p-6 bg-black border border-neutral-800 hover:border-white transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div className="mr-2">
                            <h3 className="font-bold text-lg text-white group-hover:text-white transition-colors">{paper.subject}</h3>
                            <p className="text-xs font-mono text-neutral-500 mt-1 uppercase tracking-wider">
                              {paper.exam_type || 'Paper'} • {paper.year || 'N/A'}
                            </p>
                          </div>
                          
                          {/* Pseudo-logic for Urgent vs Pending based on exam type for visual flare */}
                          {isSolved ? (
                            <span className="inline-flex items-center gap-1 bg-green-950/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-400 border border-green-900/50 flex-shrink-0 transition-colors">
                              Solved
                            </span>
                          ) : paper.exam_type?.toLowerCase().includes("supp") ? (
                            <span className="inline-flex items-center gap-1 bg-orange-950/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-500 border border-orange-900/50 flex-shrink-0 transition-colors">
                                Urgent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-neutral-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border border-neutral-800 flex-shrink-0 transition-colors">
                                Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800/50">
                          <label className="flex items-center gap-3 cursor-pointer select-none group/checkbox">
                            <input 
                              type="checkbox"
                              checked={isSolved}
                              onChange={(e) => toggleSolved(paper.id, e.target.checked)}
                              className="rounded-none border-neutral-700 text-white focus:ring-0 focus:ring-offset-0 w-4 h-4 bg-black checked:bg-white checked:border-white transition-colors" 
                            />
                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSolved ? 'text-white' : 'text-neutral-400 group-hover/checkbox:text-white'}`}>Mark Solved</span>
                          </label>
                          <Link 
                            to={`/viewer/${paper.id}`} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 border border-white rounded-none text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                          >
                            AI Assist
                          </Link>
                        </div>
                      </div>
                    )})}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
