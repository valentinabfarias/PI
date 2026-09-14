import Header from './components/header/Header'
import MobileFooter from './components/mobile-footer/MobileFooter'
import Hero from './components/hero/Hero'
import Footer from './components/footer/Footer'
import Mapa from './components/mapa/Mapa'

import './App.css'
import './components/mobile/mobile.css'

function App() {

  return (
    <>
      <Header />
        <main id="main">
          <Hero></Hero>
          <Mapa/>
        </main>
      <Footer />
      <MobileFooter />
    </>
  )
}

export default App
