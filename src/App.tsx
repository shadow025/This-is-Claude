import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Luis from './pages/Luis'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/luis" element={<Luis />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
