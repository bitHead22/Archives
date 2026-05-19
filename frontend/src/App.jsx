import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import LandingPage from '@/pages/LandingPage'
import AuthPage from '@/pages/AuthPage'
import SelectCoursePage from '@/pages/SelectCoursePage'
import SemestersPage from '@/pages/SemestersPage'
import PapersPage from '@/pages/PapersPage'
import ViewerPage from '@/pages/ViewerPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/select-course" element={<SelectCoursePage />} />
        <Route path="/course/:courseId/semesters" element={<SemestersPage />} />
        <Route path="/semester/:semesterId/papers" element={<PapersPage />} />
        <Route path="/viewer/:paperId" element={<ViewerPage />} />
      </Route>
    </Routes>
  )
}

export default App
