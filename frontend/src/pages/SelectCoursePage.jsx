import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCourses } from '@/hooks/useCourses'
import { useAuthContext } from '@/context/AuthContext'
import { UserAvatar } from '@/components/UserAvatar'
import { 
  GraduationCap, ChevronRight, CheckCircle2, 
  Search, Monitor, Settings, Cpu, Compass, Cloud, Zap, 
  FileText, Sparkles, ArrowRight, HelpCircle, LogOut, Code, Database, Home
} from 'lucide-react'

const HARDCODED_DEGREES = [
  { id: 'B.Tech', title: 'B.Tech', desc: 'Bachelor of Technology', icon: Settings },
  { id: 'M.Tech', title: 'M.Tech', desc: 'Master of Technology', icon: GraduationCap },
  { id: 'BCA', title: 'BCA', desc: 'Bachelor of Computer Apps', icon: Code },
  { id: 'MCA', title: 'MCA', desc: 'Master of Computer Apps', icon: Database },
];

const HARDCODED_BRANCHES = [
  { id: 'CSE', title: 'CSE', desc: 'Computer Science & Eng.', icon: Monitor },
  { id: 'ME', title: 'ME', desc: 'Mechanical Engineering', icon: Settings },
  { id: 'ECE', title: 'ECE', desc: 'Electronics & Comm.', icon: Cpu },
  { id: 'CE', title: 'CE', desc: 'Civil Engineering', icon: Compass },
  { id: 'IT', title: 'IT', desc: 'Information Tech.', icon: Cloud },
  { id: 'EE', title: 'EE', desc: 'Electrical Engineering', icon: Zap },
];

export default function SelectCoursePage() {
  const { courses, loading, error } = useCourses()
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()

  const allDegrees = useMemo(() => {
    const degreesMap = new Map()
    HARDCODED_DEGREES.forEach(deg => {
      degreesMap.set(deg.id, { ...deg, isDisabled: true })
    })

    if (courses) {
      courses.forEach(c => {
        const parts = c.name.split(' ')
        const degId = parts[0]
        if (degreesMap.has(degId)) {
          degreesMap.set(degId, { ...degreesMap.get(degId), isDisabled: false })
        } else {
          degreesMap.set(degId, {
            id: degId,
            title: degId,
            desc: `${degId} Programme`,
            icon: degId.includes('Tech') ? Settings : (degId.includes('CA') ? Code : GraduationCap),
            isDisabled: false
          })
        }
      })
    }
    return Array.from(degreesMap.values())
  }, [courses])

  const [selectedDegree, setSelectedDegree] = useState(null)

  useEffect(() => {
    const activeDegrees = allDegrees.filter(d => !d.isDisabled)
    if (activeDegrees.length > 0) {
      if (!selectedDegree || !activeDegrees.find(d => d.id === selectedDegree.id)) {
        setSelectedDegree(activeDegrees[0])
      }
    }
  }, [allDegrees, selectedDegree])

  const allBranches = useMemo(() => {
    const branchesMap = new Map()
    HARDCODED_BRANCHES.forEach(branch => {
      branchesMap.set(branch.id, { ...branch, isDisabled: true })
    })

    if (courses && selectedDegree) {
      courses.forEach(c => {
        if (c.name.startsWith(selectedDegree.id)) {
          const parts = c.name.split(' ')
          const branchId = parts.length > 1 ? parts.slice(1).join(' ') : 'General'
          if (branchesMap.has(branchId)) {
            branchesMap.set(branchId, { ...branchesMap.get(branchId), isDisabled: false })
          } else {
            branchesMap.set(branchId, {
              id: branchId,
              title: branchId,
              desc: `${branchId} Specialization`,
              icon: (branchId.includes('CS') || branchId.includes('IT')) ? Monitor :
                    (branchId.includes('EC') || branchId.includes('EE')) ? Zap :
                    branchId.includes('ME') ? Settings :
                    branchId.includes('CE') ? Compass : Monitor,
              isDisabled: false
            })
          }
        }
      })
    }
    return Array.from(branchesMap.values())
  }, [courses, selectedDegree])

  const [selectedBranch, setSelectedBranch] = useState(null)

  useEffect(() => {
    const activeBranches = allBranches.filter(b => !b.isDisabled)
    if (activeBranches.length > 0) {
      if (!selectedBranch || !activeBranches.find(b => b.id === selectedBranch.id)) {
        setSelectedBranch(activeBranches[0])
      }
    } else {
      setSelectedBranch(null)
    }
  }, [allBranches, selectedBranch])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredBranches = allBranches.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  let matchedCourse = null;
  if (courses && courses.length > 0 && selectedDegree && selectedBranch) {
    const searchName = selectedBranch.id === 'General' ? selectedDegree.id : `${selectedDegree.id} ${selectedBranch.id}`
    matchedCourse = courses.find(c => c.name.toLowerCase() === searchName.toLowerCase())
    if (!matchedCourse) {
      matchedCourse = courses.find(c => c.name.toLowerCase().startsWith(selectedDegree.id.toLowerCase())) || courses[0] 
    }
  }

  const handleContinue = () => {
    if (matchedCourse) {
      navigate(`/course/${matchedCourse.id}/semesters`)
    }
  }

  return (
    <div className="bg-[#000000] text-white font-sans min-h-screen flex flex-col antialiased">
      <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-sm border-b border-[#262626] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-white">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-white text-lg font-semibold tracking-tight">Archives Portal</h2>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-6">
              <Link className="text-[#a3a3a3] hover:text-white transition-colors text-sm font-medium" to="/">Home</Link>
              <Link className="text-[#a3a3a3] hover:text-white transition-colors text-sm font-medium" to="/about">About</Link>
              <a className="text-[#a3a3a3] hover:text-white transition-colors text-sm font-medium" href="/about#developer">Contact</a>
            </nav>
            <div className="flex items-center gap-3 pl-6 border-l border-[#262626]">
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Link className="hover:text-white transition-colors flex items-center gap-1" to="/">
              <Home size={16} />
            </Link>
            <ChevronRight size={14} className="text-neutral-600" />
            <span className="text-white font-medium">Selection</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Degree Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-sm bg-white text-black font-bold text-xs">1</span>
                <h1 className="text-white text-xl font-semibold tracking-tight">Select Degree</h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {allDegrees.map((deg) => {
                  const isSelected = selectedDegree?.id === deg.id;
                  const Icon = deg.icon;
                  return (
                    <div 
                      key={deg.id}
                      onClick={() => !deg.isDisabled && setSelectedDegree(deg)}
                      className={`group relative flex flex-col items-center p-6 bg-[#000000] rounded-sm border transition-all ${deg.isDisabled ? 'opacity-50 cursor-not-allowed border-[#262626]' : 'cursor-pointer'} ${isSelected ? 'border-white' : (deg.isDisabled ? '' : 'border-[#262626] hover:border-neutral-600')}`}
                    >
                      {deg.isDisabled && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm rounded-sm">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white">Coming Soon</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-white">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                      <div className={`w-12 h-12 mb-4 rounded-sm flex items-center justify-center transition-colors border border-neutral-800 ${isSelected ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400'} ${!deg.isDisabled && !isSelected ? 'group-hover:bg-white group-hover:text-black' : ''}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`font-medium text-sm mb-1 ${isSelected ? 'text-white' : 'text-neutral-200'}`}>{deg.title}</h3>
                      <p className="text-neutral-500 text-xs text-center">{deg.desc}</p>
                    </div>
                  )
                })}
              </div>
            </section>
            
            <div className="h-px w-full bg-[#262626]"></div>
            
            {/* Branch Section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-sm bg-neutral-800 text-white font-bold text-xs">2</span>
                  <h2 className="text-white text-xl font-semibold tracking-tight">Select Branch</h2>
                </div>
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <Search size={18} />
                  </span>
                  <input 
                    type="text" 
                    className="w-full py-2 pl-9 pr-4 text-sm bg-black border border-neutral-800 rounded-sm focus:outline-none focus:border-white text-white placeholder:text-neutral-600 transition-colors" 
                    placeholder="Search branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredBranches.map((branch) => {
                  const isSelected = selectedBranch?.id === branch.id;
                  const Icon = branch.icon;
                  return (
                    <label key={branch.id} className={`relative group ${branch.isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      <input 
                        type="radio" 
                        name="branch" 
                        className="peer sr-only" 
                        checked={isSelected}
                        disabled={branch.isDisabled}
                        onChange={() => !branch.isDisabled && setSelectedBranch(branch)}
                      />
                      <div className={`flex items-center p-3 bg-black border rounded-sm transition-all ${isSelected ? 'border-white bg-[#171717]' : (branch.isDisabled ? 'border-neutral-800' : 'border-neutral-800 hover:border-neutral-600')}`}>
                        {branch.isDisabled && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm rounded-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white">Coming Soon</span>
                          </div>
                        )}
                        <div className={`p-1.5 rounded-sm mr-3 border transition-colors ${isSelected ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-neutral-900 text-neutral-400 border-neutral-800'} ${!branch.isDisabled && !isSelected ? 'group-hover:text-white' : ''}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-neutral-300'} ${!branch.isDisabled && !isSelected ? 'group-hover:text-white' : ''}`}>{branch.title}</p>
                          <p className="text-xs text-neutral-500">{branch.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute right-3 text-white transition-opacity">
                            <CheckCircle2 size={18} />
                          </div>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </section>
          </div>
          
          {/* Summary Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-black rounded-sm border border-neutral-800">
                <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
                  <h3 className="font-medium text-white flex items-center gap-2 text-sm">
                    <FileText size={18} className="text-neutral-400" />
                    Selection Summary
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">Degree</p>
                      <p className="text-base font-semibold text-white">{selectedDegree?.title || '-'}</p>
                      <p className="text-xs text-neutral-400">{selectedDegree?.desc || '-'}</p>
                    </div>
                  </div>
                  <div className="h-px bg-neutral-800"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">Branch</p>
                      <p className="text-base font-semibold text-white">{selectedBranch?.title || '-'}</p>
                      <p className="text-xs text-neutral-400">{selectedBranch?.desc || '-'}</p>
                    </div>
                  </div>
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-sm p-3 flex gap-3 items-start">
                    <Sparkles size={18} className="text-[#c5f174] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      AI Assistant ready for <span className="text-white font-medium">{selectedDegree?.title || ''} {selectedBranch?.title !== 'General' ? selectedBranch?.title : ''}</span> papers.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-neutral-800 bg-neutral-950/30">
                  <button 
                    onClick={handleContinue}
                    disabled={loading || !courses?.length}
                    className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Continue to Semesters'}
                    <ArrowRight size={18} />
                  </button>
                  {error && (
                    <p className="text-red-400 text-xs text-center mt-3">{error}</p>
                  )}
                  {!loading && courses?.length === 0 && (
                    <p className="text-red-400 text-xs text-center mt-3">No courses available. Ask Admin to upload some.</p>
                  )}
                </div>
              </div>
              
              <div className="p-4 rounded-sm border border-dashed border-neutral-800">
                <div className="flex gap-3">
                  <div className="min-w-8 h-8 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <HelpCircle size={14} className="text-neutral-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Missing a branch?</h4>
                    <p className="text-xs text-neutral-500 mb-2 leading-relaxed">Some specializations are under general categories.</p>
                    <a className="text-xs font-medium text-white hover:text-neutral-300 transition-colors underline decoration-neutral-600 underline-offset-2" href="https://github.com/bitHead22/Archives/issues" target="_blank" rel="noopener noreferrer">Request addition</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-8 bg-black border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-xs">© 2026 Academic Portal. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-neutral-500 hover:text-white transition-colors text-xs" href="#">Privacy</a>
            <a className="text-neutral-500 hover:text-white transition-colors text-xs" href="#">Terms</a>
            <a className="text-neutral-500 hover:text-white transition-colors text-xs" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
