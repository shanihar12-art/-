import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomeScreen from './screens/WelcomeScreen'
import AuthScreen from './screens/AuthScreen'
import UploadScreen from './screens/UploadScreen'
import DashboardScreen from './screens/DashboardScreen'
import InsightsScreen from './screens/InsightsScreen'
import ERDScreen from './screens/ERDScreen'
import Navigation from './components/Navigation'
import { getCurrentUser, logout, saveUpload } from './utils/authStore'

const SCREENS = ['welcome', 'auth', 'upload', 'dashboard', 'insights', 'erd']

const pageVariants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate: { opacity: 1, x: 0 },
  exit:    (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}
const pageTransition = { type: 'tween', duration: 0.25, ease: 'easeInOut' }

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [prevScreen, setPrevScreen] = useState('welcome')
  const [financialData, setFinancialData] = useState(null)
  const [user, setUser] = useState(() => getCurrentUser())

  const navigateTo = useCallback((screen) => {
    setCurrentScreen(prev => { setPrevScreen(prev); return screen })
  }, [])

  const handleAuth = useCallback((u) => {
    setUser(u)
    navigateTo('upload')
  }, [navigateTo])

  const handleDataLoaded = useCallback((data) => {
    setFinancialData(data)
    if (user) saveUpload(user.id, data)
    navigateTo('dashboard')
  }, [navigateTo, user])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
    setFinancialData(null)
    navigateTo('welcome')
  }, [navigateTo])

  const direction = SCREENS.indexOf(currentScreen) - SCREENS.indexOf(prevScreen)
  const showNav = currentScreen !== 'welcome' && currentScreen !== 'auth'

  return (
    <div className="w-full h-screen overflow-hidden" style={{ background: '#080B14' }}>

      {/* מסכי טרום-אפליקציה: ברוכים הבאים + כניסה */}
      <AnimatePresence mode="wait" custom={direction}>
        {currentScreen === 'welcome' && (
          <motion.div key="welcome" custom={direction}
            variants={pageVariants} initial="initial" animate="animate" exit="exit"
            transition={pageTransition}
            className="absolute inset-0 w-full h-full">
            <WelcomeScreen onStart={() => navigateTo(user ? 'upload' : 'auth')} />
          </motion.div>
        )}
        {currentScreen === 'auth' && (
          <motion.div key="auth" custom={direction}
            variants={pageVariants} initial="initial" animate="animate" exit="exit"
            transition={pageTransition}
            className="absolute inset-0 w-full h-full">
            <AuthScreen onAuth={handleAuth} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* מעטפת האפליקציה: ניווט + מסכים — AnimatePresence נפרד, לא תלוי ביציאת auth */}
      <AnimatePresence>
        {showNav && (
          <motion.div key="app-shell"
            className="absolute inset-0 w-full h-full flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <Navigation
              currentScreen={currentScreen}
              onNavigate={navigateTo}
              hasData={!!financialData}
              user={user}
              onLogout={handleLogout}
            />
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {currentScreen === 'upload' && (
                  <motion.div key="upload" custom={direction}
                    variants={pageVariants} initial="initial" animate="animate" exit="exit"
                    transition={pageTransition} className="h-full">
                    <UploadScreen onDataLoaded={handleDataLoaded} user={user} />
                  </motion.div>
                )}
                {currentScreen === 'dashboard' && (
                  <motion.div key="dashboard" custom={direction}
                    variants={pageVariants} initial="initial" animate="animate" exit="exit"
                    transition={pageTransition} className="h-full">
                    <DashboardScreen data={financialData} user={user} onUpload={() => navigateTo('upload')} />
                  </motion.div>
                )}
                {currentScreen === 'insights' && (
                  <motion.div key="insights" custom={direction}
                    variants={pageVariants} initial="initial" animate="animate" exit="exit"
                    transition={pageTransition} className="h-full">
                    <InsightsScreen data={financialData} onUpload={() => navigateTo('upload')} />
                  </motion.div>
                )}
                {currentScreen === 'erd' && (
                  <motion.div key="erd" custom={direction}
                    variants={pageVariants} initial="initial" animate="animate" exit="exit"
                    transition={pageTransition} className="h-full">
                    <ERDScreen />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
