import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSemesters } from '@/hooks/useCourses'
import { Search, ChevronRight } from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'

const EXAM_TERMS = [
  { id: 'first_term', title: 'First Term' },
  { id: 'second_term', title: 'Second Term' },
  { id: 'end_sem', title: 'End Semester' },
]

const AVAILABLE_YEARS = [2024, 2023, 2022, 2021]

export default function SemestersPage() {
  const { courseId } = useParams()
  const { semesters, loading: semLoading, error: semError } = useSemesters(courseId)

  const [selectedSemester, setSelectedSemester] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (semesters?.length > 0 && !selectedSemester) {
      setSelectedSemester(semesters[0])
    }
  }, [semesters, selectedSemester])

  // Filter years that match search query
  const filteredYears = AVAILABLE_YEARS.filter(y =>
    y.toString().includes(searchQuery.trim())
  )

  return (
    <div className="bg-black text-white font-display min-h-screen flex flex-col overflow-x-hidden antialiased selection:bg-neutral-800 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 text-white hover:text-neutral-300 transition-colors">
            <div className="size-6 text-white">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor" />
                <path clipRule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-white text-base font-bold tracking-tight">Archives</h2>
          </Link>

          {/* Right: Search + Avatar */}
          <div className="flex flex-1 justify-end gap-4 md:gap-6 items-center">
            <div className="hidden sm:flex items-center">
              <div className="relative w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <Search size={16} />
                </span>
                <input
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-sm focus:ring-1 focus:ring-white focus:border-white block pl-10 p-2 placeholder-neutral-500 transition-colors"
                  placeholder="Search by year..."
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Page Body */}
      <main className="flex-1 flex flex-col items-center py-8 px-6">
        <div className="w-full max-w-[1400px] flex flex-col gap-10">

          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 text-sm text-neutral-500 font-mono uppercase tracking-wider">
            <Link className="hover:text-white transition-colors" to="/select-course">Courses</Link>
            <span>/</span>
            <span className="text-white font-medium">
              {selectedSemester ? `Semester ${selectedSemester.number}` : 'Semesters'}
            </span>
          </div>

          {/* Layout: Sidebar + Content */}
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Sidebar */}
            <aside className="w-full lg:w-56 flex-shrink-0">
              <div className="lg:sticky lg:top-24 flex flex-col gap-2">
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2">Semester</p>
                {semLoading ? (
                  <p className="text-neutral-500 text-sm">Loading...</p>
                ) : semError ? (
                  <p className="text-red-500 text-sm">{semError}</p>
                ) : semesters.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No semesters found.</p>
                ) : (
                  semesters.map(sem => {
                    const isSelected = selectedSemester?.id === sem.id
                    return (
                      <button
                        key={sem.id}
                        onClick={() => setSelectedSemester(sem)}
                        className={`w-full flex items-center justify-between px-4 py-3 border transition-all duration-200 text-left ${
                          isSelected
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:border-white hover:text-white'
                        }`}
                      >
                        <span className="text-sm font-bold uppercase tracking-widest">Sem {sem.number}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5">Active</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-10">
              {/* Page heading */}
              <div className="flex flex-col gap-2 border-b border-neutral-800 pb-8">
                <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tighter uppercase">
                  {selectedSemester ? `Semester ${selectedSemester.number} Papers` : 'Select a Semester'}
                </h1>
                <p className="text-neutral-400 text-base md:text-lg font-light leading-relaxed">
                  Choose an exam term and year to browse available question papers.
                </p>
              </div>

              {!selectedSemester ? (
                <div className="p-16 text-center text-neutral-600 border border-dashed border-neutral-800 text-sm uppercase tracking-widest">
                  Select a semester from the sidebar
                </div>
              ) : (
                <div className="flex flex-col gap-12">
                  {EXAM_TERMS.map(term => (
                    <section key={term.id} className="flex flex-col gap-6">
                      {/* Term heading */}
                      <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white tracking-widest uppercase">{term.title}</h2>
                        <div className="h-px flex-1 bg-neutral-800" />
                      </div>

                      {/* Year cards */}
                      {filteredYears.length === 0 ? (
                        <p className="text-neutral-600 text-sm uppercase tracking-widest">No years match your search.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                          {filteredYears.map(year => (
                            <Link
                              key={`${term.id}-${year}`}
                              to={`/semester/${selectedSemester.id}/papers?term=${term.id}&year=${year}`}
                              className="group flex flex-col gap-2 p-6 bg-black border border-neutral-800 hover:border-white transition-all duration-300"
                            >
                              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300 transition-colors">
                                {term.title}
                              </span>
                              <span className="text-3xl font-bold text-white tracking-tighter">
                                {year}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-neutral-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border border-neutral-800 w-fit mt-2 group-hover:border-white group-hover:text-white transition-all duration-200">
                                Pending
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
