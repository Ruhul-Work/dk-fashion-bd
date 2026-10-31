import { useMemo, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { SectionHeading, StaggerGroup, StepItem } from '../components/motion-kit'
import { Reveal } from '../components/motion-kit'
import { ProductCard } from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/Skeletons'
import { useProducts } from '../lib/hooks'
import type { Product } from '../lib/types'

const easeSoft: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

/* ================= NEW ARRIVALS =================
   Three columns that drift at different scroll speeds (isotope feel);
   tiles enter in staggered steps, fed by the API's newest products.   */

const COLUMN_SPLITS: number[][] = [[0, 1], [2, 3, 4], [5, 6]]

function shuffle<T>(list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function NewArrivals() {
  const ref = useRef<HTMLElement>(null)
  const arrivalsQuery = useMemo(() => ({ sort_by: 'latest', per_page: 7 }) as const, [])
  const { data, loading, error, reload } = useProducts(arrivalsQuery)
  const items = data?.items ?? []

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -36])
  const y2 = useTransform(scrollYProgress, [0, 1], [90, -70])
  const y3 = useTransform(scrollYProgress, [0, 1], [58, -44])

  const colY = [y1, y2, y3]

  return (
    <section ref={ref} id="arrivals" className="py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Fresh off the table"
          title="New arrivals, just landed"
          accentWords={['landed']}
          className="mb-14"
        />

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={i === 1 ? 'lg:mt-10' : ''}>
                <SkeletonCard variant="tile" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <EmptyState title="The rack is on break" hint={error} actionLabel="Try again" onAction={reload} />
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {COLUMN_SPLITS.map((col, c) => (
              <motion.div key={c} style={{ y: colY[c] }} className={`flex flex-col gap-6 sm:gap-8 lg:gap-10 ${c === 1 ? 'lg:mt-10' : ''}`}>
                {col
                  .map((i) => items[i])
                  .filter((p): p is Product => Boolean(p))
                  .map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={i}
                      tag="New"
                      imageClass="h-56 sm:h-64"
                      stepped={false}
                    />
                  ))}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ================= POPULAR COLLECTION =================
   A client-side shuffled pick of what came off the newest batch —
   ranked numerals and the scroll-scrubbed meter stay as decoration. */

function PopularCard({ product, rank, index }: { product: Product; rank: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  /* meter scrubs with scroll — fills as the card travels up */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end 60%'] })

  /* cursor tilt */
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 140, damping: 14 })
  const sry = useSpring(ry, { stiffness: 140, damping: 14 })

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ delay: index * 0.09, duration: 0.6, ease: easeSoft }}
      style={{ perspective: 900 }}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el || e.pointerType === 'touch') return
        const r = el.getBoundingClientRect()
        ry.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 10)
        rx.set(((e.clientY - (r.top + r.height / 2)) / r.height) * -10)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      <motion.div
        className="relative overflow-hidden rounded-[1.6rem] img-fallback shadow-soft transition-shadow duration-500 group-hover:shadow-lift"
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        whileHover={{ zIndex: 20 }}
      >
        <ProductCard product={product} index={index} imageClass="h-64 sm:h-72" stepped={false} />
        {/* rank numeral */}
        <motion.span
          className="text-outline pointer-events-none absolute -left-1 -top-3 z-10 select-none font-display text-6xl font-semibold"
          style={{ transform: 'translateZ(40px)' }}
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.09 + 0.25, duration: 0.5 }}
        >
          {rank}
        </motion.span>
      </motion.div>

      {/* scroll-scrubbed meter */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-hairline">
        <motion.div
          className="h-full origin-left bg-caramel"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </motion.div>
  )
}

export function PopularCollection() {
  const popularQuery = useMemo(() => ({ sort_by: 'latest', per_page: 12 }) as const, [])
  const { data, loading, error, reload } = useProducts(popularQuery)
  const picks = useMemo(() => shuffle(data?.items ?? []).slice(0, 4), [data])

  return (
    <section id="popular" className="bg-sand/60 py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <StaggerGroup className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <StepItem>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-eucalyptus-deep">
              Popular collection
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl">
              In <em className="font-display italic text-caramel">rotation</em> this season
            </h2>
          </StepItem>
          <StepItem className="max-w-sm text-sm leading-relaxed text-olive">
            Meters below each card fill as you scroll — and this shelf re-weaves
            itself with every visit.
          </StepItem>
        </StaggerGroup>

        {loading && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><SkeletonCard variant="wide" /></div>
            ))}
          </div>
        )}

        {error && !loading && (
          <EmptyState title="The meters stalled" hint={error} actionLabel="Try again" onAction={reload} />
        )}

        {picks.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {picks.map((p, i) => (
              <div key={p.id}>
                <PopularCard product={p} rank={`0${i + 1}`} index={i} />
              </div>
            ))}
          </div>
        )}

        <Reveal className="mt-16 text-center">
          <p className="text-sm text-olive">
            Prices update straight from the shelf — the discount badge tells you what you keep.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
