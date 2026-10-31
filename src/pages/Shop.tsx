import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../services/api'
import type { Product, Category } from '../services/api'
import { ProductCard } from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/Skeletons'
import { SectionHeading } from '../components/motion-kit'
import { lenisStop, lenisStart } from '../components/SmoothScroll'
import { useCategories, useDebouncedValue } from '../lib/hooks'

const easeSoft: [number, number, number, number] = [0.22, 0.61, 0.36, 1]
const PER_PAGE = 12

const chipBase =
  'inline-flex items-center gap-2 rounded-full border border-hairline bg-ivory px-3.5 py-1.5 text-xs text-moss transition-colors hover:border-caramel hover:text-caramel-deep'

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className={chipBase}>
      <span className="h-1.5 w-1.5 rounded-full bg-caramel" aria-hidden />
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove filter ${label}`} className="text-olive transition-colors hover:text-caramel-deep">
        ✕
      </button>
    </span>
  )
}

function catSlug(c: Category) {
  return c.slug || String(c.id)
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const categoryParam = params.get('category')
  const searchParam = params.get('q') ?? ''
  const sort = (params.get('sort') ?? 'latest')

  const { data: categories, loading: catLoading, error: catError, reload: reloadCategories } = useCategories()

  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState('')
  const [tick, setTick] = useState(0)

  const [searchDraft, setSearchDraft] = useState(searchParam)
  const debouncedSearch = useDebouncedValue(searchDraft, 300)

  useEffect(() => { setSearchDraft(searchParam) }, [searchParam])

  useEffect(() => {
    if (debouncedSearch !== searchParam) {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim())
        else next.delete('q')
        return next
      })
    }
  }, [debouncedSearch, searchParam, setParams])

  const updateParams = useCallback((patch: Record<string, string | null>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === '') next.delete(key)
        else next.set(key, value)
      })
      return next
    })
  }, [setParams])

  const setCategory = useCallback((slug: string | null) => updateParams({ category: slug }), [updateParams])
  const setSort = useCallback((value: string) => updateParams({ sort: value }), [updateParams])
  const clearAll = useCallback(() => updateParams({ category: null, q: null, sort: null }), [updateParams])

  const activeCategory = useMemo(() => categories.find((c) => catSlug(c) === categoryParam) ?? null, [categories, categoryParam])
  const activeCount = [categoryParam, searchParam].filter(Boolean).length

  const queryKey = useMemo(() => JSON.stringify({ categoryParam, searchParam, sort }), [categoryParam, searchParam, sort])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')
    setPage(1)
    api.getProducts(categoryParam ?? undefined, 1, sort, searchParam || undefined)
      .then((res) => {
        if (!isMounted) return
        setItems(res.products || [])
        setTotal(res.pagination?.total ?? res.products?.length ?? 0)
        setLastPage(res.pagination?.last_page ?? 1)
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err?.message ?? 'Something went wrong')
        setItems([])
        setLoading(false)
      })
    return () => { isMounted = false }
  }, [queryKey, tick, categoryParam, searchParam, sort])

  const canLoadMore = page < lastPage

  const loadMore = useCallback(() => {
    if (!canLoadMore || loadingMore) return
    const next = page + 1
    setLoadingMore(true)
    setMoreError('')
    api.getProducts(categoryParam ?? undefined, next, sort, searchParam || undefined)
      .then((res) => {
        setItems((prev) => [...prev, ...(res.products || [])])
        setLastPage(res.pagination?.last_page ?? lastPage)
        setTotal(res.pagination?.total ?? total)
        setPage(next)
        setLoadingMore(false)
      })
      .catch((err) => {
        setMoreError(err?.message ?? 'Something went wrong')
        setLoadingMore(false)
      })
  }, [canLoadMore, loadingMore, page, lastPage, total, categoryParam, sort, searchParam])

  const [drawerOpen, setDrawerOpen] = useState(false)
  useEffect(() => {
    if (!drawerOpen) return
    lenisStop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lenisStart()
    }
  }, [drawerOpen])

  const displayedTotal = total || items.length

  const panel = (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="shop-filter-search" className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-olive">
          Search within results
        </label>
        <input
          id="shop-filter-search"
          type="search"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="e.g. cargo"
          className="w-full rounded-full border border-hairline bg-ivory px-4 py-3 text-sm text-moss outline-none transition-colors placeholder:text-olive/50 focus:border-caramel"
        />
      </div>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-olive">Categories</p>
        {catLoading && (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-3 w-3/4 animate-pulse rounded bg-sand" />))}</div>
        )}
        {catError && !catLoading && (
          <div>
            <p className="text-sm text-olive">{catError}</p>
            <button type="button" onClick={reloadCategories} className="mt-2 rounded-full border border-hairline px-4 py-2 text-xs uppercase tracking-[0.18em] text-moss transition-colors hover:border-caramel">Try again</button>
          </div>
        )}
        <ul className="flex flex-col">
          {!catLoading && !catError && (
            <>
              <li>
                <button type="button" onClick={() => setCategory(null)} aria-pressed={!categoryParam}
                  className={`w-full border-b border-hairline/60 py-3 text-left text-sm transition-colors ${!categoryParam ? 'font-semibold text-caramel-deep' : 'text-moss hover:text-caramel-deep'}`}>
                  All pieces
                </button>
              </li>
              {categories.map((cat) => {
                const selected = categoryParam === catSlug(cat)
                return (
                  <li key={cat.id}>
                    <button type="button" onClick={() => setCategory(selected ? null : catSlug(cat))} aria-pressed={selected}
                      className={`w-full border-b border-hairline/60 py-3 text-left text-sm transition-colors ${selected ? 'font-semibold text-caramel-deep' : 'text-moss hover:text-caramel-deep'}`}>
                      {cat.name}
                    </button>
                  </li>
                )
              })}
            </>
          )}
        </ul>
      </div>
    </div>
  )

  return (
    <main className="pt-36">
      <section className="mx-auto max-w-6xl px-4 pb-12 lg:px-8">
        <SectionHeading eyebrow="The Shop" title="Every piece, one shelf" accentWords={['shelf']} align="left" />
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-olive">
          <AnimatePresence mode="wait">
            <motion.span key={displayedTotal} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: easeSoft }}>
              {loading ? 'Counting the shelf…' : `${displayedTotal} ${displayedTotal === 1 ? 'piece' : 'pieces'}`}
            </motion.span>
          </AnimatePresence>
          {searchParam && (
            <>
              <span aria-hidden>·</span>
              <span className="font-display italic text-caramel-deep">“{searchParam}”</span>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden self-start lg:sticky lg:top-32 lg:block">
            <div className="rounded-[1.6rem] border border-hairline bg-ivory p-6 shadow-soft">{panel}</div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setDrawerOpen(true)} data-cursor="hover"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ivory px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-moss shadow-soft transition-colors hover:border-caramel hover:text-caramel-deep lg:hidden">
                Filters
                {activeCount > 0 && <span className="rounded-full bg-caramel px-1.5 text-[10px] font-bold text-ivory">{activeCount}</span>}
              </button>
              <div className="lg:ml-auto flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-olive">Sort</span>
                <div className="flex flex-wrap gap-1.5 rounded-full border border-hairline bg-ivory p-1">
                  {[
                    { v: 'latest', l: 'Latest' },
                    { v: 'oldest', l: 'Oldest' },
                    { v: 'price_asc', l: 'Price ↑' },
                    { v: 'price_desc', l: 'Price ↓' },
                  ].map((o) => (
                    <button key={o.v} type="button" onClick={() => setSort(o.v)} aria-pressed={sort === o.v} data-cursor="hover"
                      className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${sort === o.v ? 'bg-moss text-ivory' : 'text-olive hover:text-moss'}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeCount > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {categoryParam && (
                  <Chip label={activeCategory?.name ?? categoryParam} onRemove={() => setCategory(null)} />
                )}
                {searchParam && <Chip label={`Search: “${searchParam}”`} onRemove={() => updateParams({ q: null })} />}
                <button type="button" onClick={clearAll} className="text-xs uppercase tracking-[0.18em] text-olive transition-colors hover:text-caramel-deep">
                  Clear all
                </button>
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-3 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (<div key={i}><SkeletonCard /></div>))}
              </div>
            )}

            {error && !loading && (
              <EmptyState title="The shelf slipped" hint={error} actionLabel="Try again" onAction={() => setTick((t) => t + 1)} />
            )}

            {!loading && !error && items.length === 0 && (
              <EmptyState title="Nothing here yet" hint="This corner of the shelf is empty. Try clearing a filter or browse everything." actionLabel="Clear filters" onAction={clearAll} />
            )}

            {!loading && !error && items.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-3 lg:gap-8">
                  {items.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} stepped={false} />
                  ))}
                </div>

                {moreError && (
                  <p className="mt-6 text-center text-sm text-olive">
                    {moreError} —{' '}
                    <button onClick={loadMore} className="text-caramel-deep underline underline-offset-4">try again</button>
                  </p>
                )}

                {canLoadMore && (
                  <div className="mt-14 flex justify-center">
                    <button type="button" onClick={loadMore} disabled={loadingMore} data-cursor="hover"
                      className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ivory px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-moss shadow-soft transition-all duration-300 hover:border-caramel hover:text-caramel-deep disabled:opacity-60">
                      {loadingMore ? 'Bringing more…' : 'Load more'}
                    </button>
                  </div>
                )}

                {!canLoadMore && items.length > PER_PAGE && (
                  <p className="mt-14 text-center text-xs uppercase tracking-[0.24em] text-olive/70">That is the whole shelf</p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} role="dialog" aria-modal="true" aria-label="Shop filters">
            <div className="absolute inset-0 bg-moss/40 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
            <motion.div className="absolute inset-x-0 bottom-0 max-h-[82svh] overflow-y-auto rounded-t-[2rem] border-t border-hairline bg-ivory p-6 pb-10 shadow-lift"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.45, ease: easeSoft }}>
              <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-xl">Filters</p>
                <button type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {panel}
              <button type="button" onClick={() => setDrawerOpen(false)} className="mt-8 w-full rounded-full bg-moss px-6 py-4 text-sm font-medium text-ivory transition-colors hover:bg-caramel-deep">
                Show {displayedTotal} {displayedTotal === 1 ? 'piece' : 'pieces'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}