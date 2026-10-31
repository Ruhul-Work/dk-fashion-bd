import { Hero, Ticker, Collections, Products } from '../sections/HomeTop'
import { SectionRail } from '../components/Chrome'
import { NewArrivals, PopularCollection } from '../sections/HomeMarket'
import {
  Making,
  FacebookPage,
  Qualities,
  Lookbook,
  StatsTestimonials,
  FAQ,
  ContactStrip,
} from '../sections/HomeBottom'

import { usePageTitle } from '../lib/usePageTitle'

export default function Home() {
  usePageTitle('Home')
  return (
    <main>
      <SectionRail items={[
        { id: 'hero', label: 'Hero' },
        { id: 'categories', label: 'Collections' },
        { id: 'products', label: 'Pieces' },
        { id: 'arrivals', label: 'New arrivals' },
        { id: 'popular', label: 'Popular' },
        { id: 'making', label: 'Making' },
        { id: 'facebook', label: 'Facebook' },
        { id: 'lookbook', label: 'Lookbook' },
        { id: 'voices', label: 'Voices' },
        { id: 'faq', label: 'FAQ' },
        { id: 'visit', label: 'Visit' },
      ]} />
      <Hero />
      <Collections />
      <Ticker />
      <Products />
      <NewArrivals />
      <PopularCollection />
      <Making />
      <FacebookPage />
      <Qualities />
      <Lookbook />
      <StatsTestimonials />
      <FAQ />
      <ContactStrip />
    </main>
  )
}
