import Header from './components/header/Header'
import MobileFooter from './components/mobile-footer/MobileFooter'
import Hero from './components/hero/Hero'
import Footer from './components/footer/Footer'

import './App.css'
import './components/mobile/mobile.css'

function App() {

  return (
    <>
      <Header />
        <main id="main">
          <Hero></Hero>
        </main>
      <Footer />
      <MobileFooter />
    </>
  )
}

export default App
