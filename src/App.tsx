import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Sections from './pages/Sections'
import SectionDetail from './pages/SectionDetail'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Article from './pages/Article'
import { useUserStore } from './store/userStore'

function App() {
  const role = useUserStore((s) => s.role)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor('#0B0F0C')
      tg.setBackgroundColor('#0B0F0C')
    }
  }, [])

  return (
    <div className="min-h-full bg-bg-primary text-text-primary">
      <Routes>
        <Route
          path="/"
          element={role ? <Navigate to="/home" replace /> : <Onboarding />}
        />
        <Route path="/home" element={<Home />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/section/:id" element={<SectionDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
