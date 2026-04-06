import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

function App() {
  const location = useLocation()
  const hideChrome = ['/login'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {!hideChrome && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageMotion}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics/:id" element={<Analytics />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      {!hideChrome && <Footer />}
    </div>
  )
}

export default App
