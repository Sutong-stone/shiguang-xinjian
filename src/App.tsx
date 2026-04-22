import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import AlbumPage from './pages/AlbumPage'
import MessagesPage from './pages/MessagesPage'
import TimelinePage from './pages/TimelinePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/album" element={<AlbumPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
