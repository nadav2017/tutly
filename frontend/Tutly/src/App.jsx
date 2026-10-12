import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import AddSubject from './components/AddSubject'
import TeacherProfile from './pages/TeacherProfile'
import SubjectPage from './pages/SubjectPage'
import TeacherPage from './pages/TeacherPage'
import logoTutly from './assets/logo_tutly.png'
import tutorImage from './assets/tutorImage.png'
import teachImage from '../teachImage.png'
import './App.css'

function RequireAuth({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [teacherName, setTeacherName] = useState(localStorage.getItem('teacherName') || localStorage.getItem('name'))

  useEffect(() => {
    function syncAuthState() {
      setToken(localStorage.getItem('token'))
      setTeacherName(localStorage.getItem('teacherName') || localStorage.getItem('name'))
    }

    window.addEventListener('storage', syncAuthState)

    return () => {
      window.removeEventListener('storage', syncAuthState)
    }
  }, [])

  function handleAuthSuccess() {
    setToken(localStorage.getItem('token'))
    setTeacherName(localStorage.getItem('teacherName') || localStorage.getItem('name'))
    navigate('/profile')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('teacherName')
    localStorage.removeItem('name')
    localStorage.removeItem('teacherProfile')
    setToken(null)
    setTeacherName('')
    navigate('/', { replace: true })
  }

  const isLoggedIn = Boolean(token)
  const isProfilePage = location.pathname === '/profile'
  const isTeacherPage = location.pathname.startsWith('/teachers/')
  const isSubjectPage = location.pathname.startsWith('/subjects/')
  const hideHero = location.pathname === '/login' || location.pathname === '/register' || isTeacherPage || isSubjectPage
  const isHomePage = location.pathname === '/'
  const heroImage = isHomePage ? (isLoggedIn ? teachImage : tutorImage) : null

  const guestButtons = [
    { to: '/login', label: 'Login', className: 'nav-button nav-button--login' },
    { to: '/register', label: 'Register', className: 'nav-button nav-button--register' },
  ]

  const userButtons = [
    { to: '/add', label: 'Add Subject', className: 'nav-button nav-button--add' },
    { to: '/profile', label: 'My Area', className: 'nav-button nav-button--ghost' },
  ]

  function getHeroCopy() {
    if (location.pathname.startsWith('/teachers/')) {
      return {
        eyebrow: 'Teacher profile',
        title: 'Explore a tutor profile and see every subject they currently offer.',
        text: 'This page is public and read-only, so students can browse teacher details without changing anything.',
      }
    }

    if (location.pathname.startsWith('/subjects/')) {
      return {
        eyebrow: 'Subject details',
        title: 'Review the subject details and jump directly to the teacher behind it.',
        text: 'Each subject page keeps the teacher visible so it is easy to continue browsing related offerings.',
      }
    }

    if (isLoggedIn) {
      return {
        eyebrow: 'Welcome back',
        title: 'Browse subjects, open public teacher pages, and manage your own tutoring profile.',
        text: 'You are signed in, so you can add subjects, open your personal area, and still use the public catalog flow.',
      }
    }

    return {
      eyebrow: 'Discover tutors',
      title: 'Browse subjects first, then open the teacher behind each one.',
      text: 'The public flow starts with the full subject catalog, continues to a subject details page, and then leads to each teacher profile.',
    }
  }

  const hero = getHeroCopy()

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="app-navbar__inner">
          <Link className="app-brand app-brand--button" to="/">
            <span className="app-brand__badge">
              <img className="app-brand__logo" src={logoTutly} alt="Tutly logo" />
            </span>
            <div>
              <p className="app-brand__title">Tutly</p>
              <p className="app-brand__subtitle">Simple tutoring dashboard</p>
            </div>
          </Link>

          <nav className="app-nav">
            {!isLoggedIn &&
              guestButtons.map((item) => (
                <Link
                  key={item.to}
                  className={`${item.className} ${location.pathname === item.to ? 'is-active' : ''}`}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ))}

            {isLoggedIn && (
              <div className="app-user-menu">
                <button className="app-user-name app-user-name--trigger" type="button">
                  {teacherName || 'My Account'}
                </button>

                <div className="app-user-menu__panel">
                  {userButtons.map((item) => (
                    <Link
                      key={item.to}
                      className={`${item.className} ${location.pathname === item.to ? 'is-active' : ''}`}
                      to={item.to}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <button
                    className="nav-button nav-button--ghost nav-button--logout"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className={`app-main ${isProfilePage ? 'app-main--profile' : ''}`}>
        {!isProfilePage && !hideHero && (
          <section
            className={`app-hero ${heroImage ? 'app-hero--with-image' : ''}`}
            style={heroImage ? { '--hero-image': `url(${heroImage})` } : undefined}
          >
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className="hero-title">{hero.title}</h1>
            <p className="hero-text">{hero.text}</p>
          </section>
        )}

        <div className={`page-wrapper ${isProfilePage ? 'page-wrapper--profile' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subjects/:id" element={<SubjectPage />} />
            <Route path="/teachers/:id" element={<TeacherPage />} />
            <Route path="/login" element={<Login onLoginSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Register onRegisterSuccess={handleAuthSuccess} />} />
            <Route
              path="/add"
              element={(
                <RequireAuth isAuthenticated={isLoggedIn}>
                  <AddSubject />
                </RequireAuth>
              )}
            />
            <Route
              path="/profile"
              element={(
                <RequireAuth isAuthenticated={isLoggedIn}>
                  <TeacherProfile token={token} onAccountDeleted={handleLogout} />
                </RequireAuth>
              )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
