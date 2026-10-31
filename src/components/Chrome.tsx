import * as React from "react";
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { scrollToId } from './SmoothScroll'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWebsite } from '../context/WebsiteContext'
import { assetUrl } from '../lib/api'
import CategoryModal from './CategoryModal'
import SearchModal from './SearchModal'

/* ---------- top scroll progress bar ---------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-caramel"
      style={{ scaleX }}
    />
  )
}

/* ---------- floating section-dot guide rail ---------- */
export type RailItem = { id: string; label: string }

export function SectionRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [items])

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      aria-label="Section guide"
      className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
      transition={{ duration: 0.4 }}
    >
      {items.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollToId(id)}
          className="group flex items-center gap-2"
          aria-label={`Go to ${label}`}
        >
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-300 ${
              active === id
                ? 'bg-moss text-ivory opacity-100'
                : 'bg-ivory/90 text-olive opacity-0 shadow-soft group-hover:opacity-100'
            }`}
          >
            {label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === id ? 'h-4 w-2 bg-caramel' : 'h-2 w-2 bg-olive/40'
            }`}
          />
        </button>
      ))}
    </motion.nav>
  )
}

/* ---------- navbar ---------- */

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
]

const easeExpo: [number, number, number, number] = [0.22, 1, 0.36, 1]

function SearchGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

/* hides the bar on scroll-down, brings it back on scroll-up */
function HideOnScroll({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false)
  const last = useRef(0)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsub = scrollY.on('change', (y: number) => {
      const previous = last.current
      last.current = y
      if (y < 160) {
        setHidden(false)
        return
      }
      if (y - previous > 6) setHidden(true)
      else if (previous - y > 6) setHidden(false)
    })
    return () => unsub()
  }, [scrollY])

  return (
    <motion.div
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.5, ease: easeExpo }}
    >
      {children}
    </motion.div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [catMobileOpen, setCatMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)
  const location = useLocation()
  const { cartCount } = useCart()
  const { user } = useAuth()
  const { settings } = useWebsite()
  const logoUrl = assetUrl(settings?.logo)
  const atTop = !scrolled
  /* only the video hero is dark enough to host the transparent bar */
  const transparent = atTop && location.pathname === '/' && !catOpen && !catMobileOpen && !searchOpen && !isMobile

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* sit exactly on top of the announcement strip, whatever height it renders at */
  useEffect(() => {
    const bar = document.getElementById('announce-bar')
    if (!bar) return
    const measure = () => setOffset(bar.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [location.pathname])

  useEffect(() => setOpen(false), [location.pathname])

  const overHero = transparent ? 'text-ivory' : 'text-moss'
  const chipBorder = transparent ? 'border-ivory/30' : 'border-hairline'
  const chipBg = transparent ? 'bg-ivory text-moss hover:bg-caramel hover:text-ivory' : 'bg-moss text-ivory hover:bg-caramel hover:text-ivory'

  const triggerChip = `inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 ${
    transparent
      ? 'text-ivory hover:text-caramel'
      : 'text-moss hover:text-caramel-deep'
  }`

  return (
    <>
      <HideOnScroll>
        <motion.header
          className="fixed inset-x-0 z-[55]"
          initial={{ top: offset }}
          animate={{ top: atTop ? offset : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div
            className={`border-b transition-colors duration-500 ${
              transparent
                ? 'border-transparent bg-transparent'
                : 'border-hairline bg-ivory/85 backdrop-blur-xl'
            }`}
          >
            <div className="relative mx-auto flex h-[72px] max-w-6xl items-center gap-2 overflow-x-hidden overflow-y-visible md:px-4 px-3">
              {/* left: links + mobile menu trigger */}
              <nav className="flex flex-1 items-center">
                <ul className={`hidden items-center gap-6 transition-colors duration-500 lg:flex ${overHero}`}>
                  {navLinks.map(({ to, label }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                          `relative inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 ${
                            isActive || (to === '/shop' && location.pathname.startsWith('/product/'))
                              ? overHero
                              : `${transparent ? 'hover:text-ivory' : 'text-olive hover:text-moss'}`
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              aria-hidden
                              className={`h-1.5 w-1.5 rounded-full bg-caramel transition-all duration-300 ${
                                isActive || (to === '/shop' && location.pathname.startsWith('/product/')) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                              }`}
                            />
                            {label}
                            {(isActive || (to === '/shop' && location.pathname.startsWith('/product/'))) && (
                              <motion.span
                                layoutId="nav-underline"
                                className="absolute -bottom-1.5 left-0 -z-10 h-px w-full bg-caramel"
                                transition={{ duration: 0.45, ease: easeExpo }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      aria-label="Open categories"
                      aria-haspopup="dialog"
                      aria-expanded={catOpen}
                      data-cursor="hover"
                      onClick={() => setCatOpen(true)}
                      className={triggerChip}
                    >
                      Category
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/offers"
                      data-cursor="hover"
                      className={`relative inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 ${
                        transparent ? 'text-ivory hover:text-caramel' : 'text-moss hover:text-caramel-deep'
                      }`}
                    >
                      Offers
                    </Link>
                  </li>
                </ul>

                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={open}
                  onClick={() => setOpen(true)}
                  className={`group inline-flex h-11 items-center gap-3 rounded-full border px-5 transition-colors duration-500 lg:hidden ${chipBorder} ${overHero}`}
                >
                  <span className="flex flex-col gap-[3px]">
                    <span
                      className={`block h-px w-4 transition-all duration-500 group-hover:translate-x-0.5 ${transparent ? 'bg-ivory' : 'bg-moss'}`}
                    />
                    <span
                      className={`block h-px w-4 transition-colors duration-500 ${transparent ? 'bg-ivory' : 'bg-moss'}`}
                    />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Menu</span>
                </button>
              </nav>

              {/* centre: logo */}
              <Link
                to="/"
                className=" "
                aria-label="DK Fashion — home"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={settings?.company_name || 'Logo'} className={`h-14 w-auto max-w-[220px] shrink-0 object-contain transition sm:h-16 ${transparent ? 'brightness-0 invert mix-blend-screen' : ''}`} />
                ) : (
                  <span className={`font-display text-lg transition-colors duration-500 sm:text-3xl ${transparent ? "text-ivory" : "text-moss"}`}>{settings?.company_name || 'Smart Garments'}</span>
                )}
              </Link>

              {/* right: search + status + contact pill */}
              <div className="flex flex-1 items-center justify-end gap-2 max-w-full overflow-x-hidden overflow-y-visible px-3">
                <button
                  type="button"
                  aria-label="Search pieces"
                  data-cursor="hover"
                  onClick={() => setSearchOpen(true)}
                  className={`hidden h-9 w-9 shrink-0 items-center justify-center transition-all duration-300 hover:scale-110 hover:text-caramel-deep sm:inline-flex ${transparent ? 'text-ivory' : 'text-moss'}`}
                >
                  <SearchGlyph />
                </button>
                <Link
                  to="/track-order"
                  data-cursor="hover"
                  aria-label="Track order"
                  className={`relative hidden h-9 w-9 shrink-0 items-center justify-center transition-all duration-300 hover:scale-110 sm:inline-flex ${transparent ? 'text-ivory' : 'text-moss'}`}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 3h15v13H1z" />
                    <path d="M16 8h4l3 3v5h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </Link>


                <Link
                  to="/cart"
                  data-cursor="hover"
                  className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center transition-all duration-300 hover:scale-110 ${transparent ? 'text-ivory' : 'text-moss'}`}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -right-1 top-0 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-caramel px-1 text-[9px] font-bold text-ivory">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {user && (
                  <Link
                    to="/profile"
                    data-cursor="hover"
                    aria-label="Profile"
                    className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center transition-all duration-300 hover:scale-110 ${transparent ? 'text-ivory' : 'text-moss'}`}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                )}
{!user && (
                  <Link
                    to="/login"
                    data-cursor="hover"
                    className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 sm:px-5 ${chipBg}`}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.header>
      </HideOnScroll>

      {/* full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-ivory lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-8">
              <span className="text-[10px] uppercase tracking-[0.24em] text-olive">Menu</span>
              <div className="flex items-center gap-3 ">
                <button
                  type="button"
                  aria-label="Search pieces"
                  data-cursor="hover"
                  onClick={() => {
                    setOpen(false)
                    window.setTimeout(() => setSearchOpen(true), 260)
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline"
                >
                  <SearchGlyph />
                </button>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <motion.nav
              className="mx-auto flex max-w-6xl flex-col px-4 pt-6 sm:px-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
              }}
            >
              {navLinks.map(({ to, label }, index) => (
                <motion.div
                  key={to}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: easeExpo }}
                >
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-hairline py-5"
                  >
                    <span className="text-[10px] text-caramel">0{index + 1}</span>
                    <span className="font-display text-4xl text-moss sm:text-5xl">{label}</span>
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, ease: easeExpo }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    window.setTimeout(() => setCatMobileOpen(true), 260)
                  }}
                  className="flex w-full items-baseline gap-4 border-b border-hairline py-5 text-left"
                >
                  <span className="text-[10px] text-caramel">0{navLinks.length + 1}</span>
                  <span className="flex-1 font-display text-4xl text-moss sm:text-5xl">Category</span>
                  <span className="self-center text-caramel-deep" aria-hidden>
                    →
                  </span>
                </button>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: easeExpo }}>
                <Link to="/offers" onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-hairline py-5">
                  <span className="text-[10px] text-caramel">0{navLinks.length + 2}</span>
                  <span className="font-display text-4xl text-moss sm:text-5xl">Offers</span>
                </Link>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: easeExpo }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    window.setTimeout(() => setSearchOpen(true), 260)
                  }}
                  className="flex w-full items-baseline gap-4 border-b border-hairline py-5 text-left"
                >
                  <span className="text-[10px] text-caramel">0{navLinks.length + 3}</span>
                  <span className="font-display text-4xl text-moss sm:text-5xl">Search</span>
                </button>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: easeExpo }}>
                <Link to="/track-order" onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-hairline py-5">
                  <span className="text-[10px] text-caramel">0{navLinks.length + 4}</span>
                  <span className="font-display text-4xl text-moss sm:text-5xl">Track</span>
                </Link>
              </motion.div>
            </motion.nav>

            <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-8">
              <p className="text-[10px] uppercase tracking-[0.24em] text-caramel">
                Shop our pieces on Shopee
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {searchOpen && <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />}
      <CategoryModal open={catOpen} onClose={() => setCatOpen(false)} />
      <CategoryModal open={catMobileOpen} onClose={() => setCatMobileOpen(false)} mobile />

    </>
  )
}

/* ---------- announcement bar ---------- */

export function AnnouncementBar() {
  return (
    <div className="relative z-[60] flex items-center justify-center gap-2 bg-moss px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-ivory">
      <motion.span
        className="inline-block h-1.5 w-1.5 rounded-full bg-caramel"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
      />
      Shop our pieces on Shopee
    </div>
  )
}
