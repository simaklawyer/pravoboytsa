import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import { useUserStore } from './store/userStore'

function App() {
  const role = useUserStore((s) => s.role)

  useEffect(() => {
    // Telegram WebApp init
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
        {/* Дальше будут: /sections, /article/:id, /search, /profile */}
      </Routes>
    </div>
  )
}

export default App
