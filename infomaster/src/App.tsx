import { Route, Routes } from 'react-router'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Formacion } from './pages/Formacion'
import { Cursos } from './pages/Cursos'
import { Nosotros } from './pages/Nosotros'
import { Contacto } from './pages/Contacto'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="formacion" element={<Formacion />} />
        <Route path="cursos" element={<Cursos />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
