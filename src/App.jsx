import Booking from './sections/Booking';
import Footer from './sections/Footer';
import Hero from './sections/Hero';
import Nav from './sections/Nav';
import Pricing from './sections/Pricing';
import Safety from './sections/Safety';
import Tonight from './sections/Tonight';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Pricing />
        <Tonight />
        <Safety />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
