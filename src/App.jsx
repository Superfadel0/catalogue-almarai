import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus, Minus, ShoppingBag, FileDown, ArrowUpRight, Sparkles } from 'lucide-react'
import jsPDF from 'jspdf'
import productsData from './data/products.json'

// Resolve image path with Vite base
const resolveImg = (path) => `${import.meta.env.BASE_URL}${path}`

export default function App() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  // Load cart from sessionStorage on mount (won't persist forever — by design)
  useEffect(() => {
    const saved = sessionStorage.getItem('atelier-cart')
    if (saved) {
      try { setCart(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('atelier-cart', JSON.stringify(cart))
  }, [cart])

  const categories = useMemo(() => {
    const cats = ['Tous', ...new Set(productsData.map(p => p.category))]
    return cats
  }, [])

  const filteredProducts = useMemo(() => {
    return productsData.filter(p => {
      const matchCategory = activeCategory === 'Tous' || p.category === activeCategory
      const matchSearch = search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search)
      return matchCategory && matchSearch
    })
  }, [search, activeCategory])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
      .filter(item => item.qty > 0)
    )
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.price || 0) * item.qty
  }, 0)

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="grain min-h-screen relative overflow-x-hidden">
      <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <Hero />
      <Marquee />

      <main className="px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto pb-32">
        <FilterBar
          search={search}
          setSearch={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          resultCount={filteredProducts.length}
        />

        <ProductGrid
          products={filteredProducts}
          onSelect={setSelectedProduct}
          onAdd={addToCart}
        />

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-display text-6xl text-ink/30">Rien trouvé.</p>
            <p className="font-mono text-sm text-ink/60 mt-4 uppercase tracking-widest">
              [ Essaie un autre mot ]
            </p>
          </div>
        )}
      </main>

      <Footer />

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdd={addToCart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cart={cart}
            onClose={() => setCartOpen(false)}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            total={cartTotal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================== HEADER ================== */
function Header({ cartCount, onCartClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-cream/90 backdrop-blur-sm">
      <div className="px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-terracotta flex items-center justify-center text-cream font-display text-2xl font-black">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-display text-xl leading-none">ATELIER</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/60">
              Catalogue · 2026
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest">
          <a href="#produits" className="hover:text-terracotta transition-colors">Produits</a>
          <a href="#about" className="hover:text-terracotta transition-colors">À propos</a>
          <a href="#contact" className="hover:text-terracotta transition-colors">Contact</a>
        </nav>

        <button
          onClick={onCartClick}
          className="relative flex items-center gap-2 px-4 py-2 bg-ink text-cream hover:bg-terracotta transition-colors group"
        >
          <ShoppingBag size={16} />
          <span className="font-mono text-xs uppercase tracking-wider">Devis</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-terracotta text-cream w-6 h-6 flex items-center justify-center text-[11px] font-bold rounded-full border-2 border-cream group-hover:bg-ink">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

/* ================== HERO ================== */
function Hero() {
  return (
    <section className="relative px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto pt-12 sm:pt-20 pb-16">
      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-12 lg:col-span-9">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/60 mb-6 flex items-center gap-3"
          >
            <span className="w-12 h-px bg-ink" />
            Volume 01 · Édition Permanente
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-display text-[15vw] sm:text-[12vw] lg:text-[10vw] leading-[0.85] font-light"
          >
            Le <em className="text-terracotta italic font-medium">catalogue</em>
            <br />
            d'une <span className="text-display-soft italic font-light">collection</span>
            <br />
            choisie.
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="col-span-12 lg:col-span-3 lg:pb-4"
        >
          <p className="text-sm leading-relaxed text-ink/80 max-w-xs">
            Cinq maisons. Cinquante-quatre références.
            Une sélection rigoureuse de boissons, sauces et fruits secs —
            pensée pour les professionnels exigeants.
          </p>
          <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/60">
            <Sparkles size={12} />
            Mis à jour Mai 2026
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ================== MARQUEE ================== */
function Marquee() {
  const items = ['ALMARAI', 'BEYTI', 'LAVIDA', 'V7', 'PREMIUM', 'ALMARAI', 'BEYTI', 'LAVIDA', 'V7', 'PREMIUM']
  return (
    <div className="border-y border-ink overflow-hidden bg-ink text-cream">
      <div className="flex animate-marquee whitespace-nowrap py-4">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-display text-3xl sm:text-4xl px-8 italic">
            {item} <span className="text-terracotta not-italic mx-4">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ================== FILTER BAR ================== */
function FilterBar({ search, setSearch, categories, activeCategory, setActiveCategory, resultCount }) {
  return (
    <section id="produits" className="py-12 border-b border-ink/20">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-display text-4xl sm:text-5xl">
          La <em className="italic text-terracotta">sélection</em>
        </h2>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
          [{String(resultCount).padStart(2, '0')}] résultats
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-12 md:col-span-5 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, marque, code-barre..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-ink focus:border-terracotta focus:outline-none font-mono text-sm placeholder:text-ink/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/50 hover:text-terracotta"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="col-span-12 md:col-span-7 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-ink text-cream'
                  : 'bg-transparent text-ink border border-ink/30 hover:border-ink hover:bg-ink/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================== PRODUCT GRID ================== */
function ProductGrid({ products, onSelect, onAdd }) {
  return (
    <section className="py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            onSelect={() => onSelect(product)}
            onAdd={() => onAdd(product)}
          />
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product, index, onSelect, onAdd }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col"
    >
      <button
        onClick={onSelect}
        className="relative aspect-[4/5] bg-paper overflow-hidden mb-4 stripes border border-ink/10"
      >
        <img
          src={resolveImg(product.image)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-6 img-hover"
        />
        <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest bg-cream/90 px-2 py-1 backdrop-blur">
          № {String(product.id).padStart(3, '0')}
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-3 right-3 bg-ink text-cream w-10 h-10 flex items-center justify-center"
            >
              <ArrowUpRight size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="flex-1 flex flex-col">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">
          {product.brand}
        </p>
        <h3 className="text-display text-lg leading-tight mb-1">
          {product.name}
        </h3>
        {product.subtitle && (
          <p className="text-xs text-ink/60 italic mb-2">{product.subtitle}</p>
        )}
        <p className="font-mono text-[10px] text-ink/50 mb-4">
          {product.barcode}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          {product.price ? (
            <p className="text-display text-xl">
              {(product.price / 1000).toFixed(3)} <span className="text-sm text-ink/60">F</span>
            </p>
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              Sur devis
            </p>
          )}
          <button
            onClick={onAdd}
            className="px-3 py-2 bg-ink text-cream font-mono text-[10px] uppercase tracking-widest hover:bg-terracotta transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            Ajouter
          </button>
        </div>
      </div>
    </motion.article>
  )
}

/* ================== PRODUCT MODAL ================== */
function ProductModal({ product, onClose, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="bg-cream max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-ink text-cream flex items-center justify-center hover:bg-terracotta transition-colors"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="aspect-square bg-paper relative stripes p-12">
            <img
              src={resolveImg(product.image)}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 font-mono text-xs uppercase tracking-widest bg-cream/90 px-3 py-1.5">
              № {String(product.id).padStart(3, '0')}
            </div>
          </div>

          <div className="p-8 lg:p-12 flex flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-terracotta mb-4">
              {product.brand} — {product.category}
            </p>

            <h2 className="text-display text-4xl lg:text-5xl leading-[0.95] mb-4">
              {product.name}
            </h2>

            {product.subtitle && (
              <p className="text-lg text-ink/70 italic font-display mb-6">
                {product.subtitle}
              </p>
            )}

            <div className="border-t border-ink/20 my-6" />

            <dl className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="uppercase tracking-widest text-ink/50">Référence</dt>
                <dd>№ {String(product.id).padStart(3, '0')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="uppercase tracking-widest text-ink/50">Code-barre</dt>
                <dd>{product.barcode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="uppercase tracking-widest text-ink/50">Marque</dt>
                <dd>{product.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="uppercase tracking-widest text-ink/50">Catégorie</dt>
                <dd>{product.category}</dd>
              </div>
              {product.price && (
                <div className="flex justify-between">
                  <dt className="uppercase tracking-widest text-ink/50">Prix</dt>
                  <dd className="text-terracotta font-bold">
                    {(product.price / 1000).toFixed(3)} F
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { onAdd(product); onClose(); }}
                className="flex-1 px-6 py-4 bg-ink text-cream font-mono text-xs uppercase tracking-widest hover:bg-terracotta transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Ajouter au devis
              </button>
              <button
                onClick={onClose}
                className="px-6 py-4 border border-ink font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-cream transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ================== CART DRAWER ================== */
function CartDrawer({ cart, onClose, onUpdateQty, onRemove, total }) {
  const [info, setInfo] = useState({ name: '', company: '', email: '', notes: '' })

  const generatePDF = () => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    let y = margin

    // Header band
    pdf.setFillColor(14, 14, 12)
    pdf.rect(0, 0, pageWidth, 35, 'F')
    pdf.setFillColor(200, 85, 61)
    pdf.rect(margin, 8, 14, 14, 'F')
    pdf.setTextColor(244, 239, 230)
    pdf.setFont('times', 'bold')
    pdf.setFontSize(28)
    pdf.text('A', margin + 4, 19)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text('ATELIER', margin + 20, 17)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text('CATALOGUE · 2026', margin + 20, 23)

    pdf.setFontSize(9)
    pdf.text('DEVIS', pageWidth - margin, 17, { align: 'right' })
    const date = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
    pdf.text(date, pageWidth - margin, 23, { align: 'right' })

    y = 50
    pdf.setTextColor(14, 14, 12)
    pdf.setFont('times', 'italic')
    pdf.setFontSize(26)
    pdf.text('Devis Personnalisé', margin, y)
    y += 12

    // Customer info block
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text('CLIENT', margin, y)
    pdf.setTextColor(14, 14, 12)
    pdf.setFontSize(10)
    y += 5
    if (info.name) { pdf.text(info.name, margin, y); y += 5 }
    if (info.company) { pdf.text(info.company, margin, y); y += 5 }
    if (info.email) { pdf.text(info.email, margin, y); y += 5 }
    y += 6

    // Table header
    pdf.setFillColor(14, 14, 12)
    pdf.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
    pdf.setTextColor(244, 239, 230)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'bold')
    pdf.text('№', margin + 2, y + 5.5)
    pdf.text('PRODUIT', margin + 12, y + 5.5)
    pdf.text('CODE', margin + 95, y + 5.5)
    pdf.text('QTÉ', pageWidth - margin - 35, y + 5.5, { align: 'right' })
    pdf.text('P.U.', pageWidth - margin - 20, y + 5.5, { align: 'right' })
    pdf.text('TOTAL', pageWidth - margin - 2, y + 5.5, { align: 'right' })
    y += 8

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(14, 14, 12)
    pdf.setFontSize(8)

    cart.forEach((item, idx) => {
      if (y > pageHeight - 50) {
        pdf.addPage()
        y = margin
      }
      const lineHeight = 8
      if (idx % 2 === 0) {
        pdf.setFillColor(234, 226, 210)
        pdf.rect(margin, y, pageWidth - 2 * margin, lineHeight, 'F')
      }
      pdf.text(String(item.id).padStart(3, '0'), margin + 2, y + 5.5)
      const name = item.name.length > 40 ? item.name.substring(0, 38) + '..' : item.name
      pdf.text(name, margin + 12, y + 5.5)
      pdf.setFontSize(6)
      pdf.text(item.barcode, margin + 95, y + 5.5)
      pdf.setFontSize(8)
      pdf.text(String(item.qty), pageWidth - margin - 35, y + 5.5, { align: 'right' })
      const price = item.price ? (item.price / 1000).toFixed(3) : '—'
      pdf.text(price, pageWidth - margin - 20, y + 5.5, { align: 'right' })
      const lineTotal = item.price ? ((item.price * item.qty) / 1000).toFixed(3) : '—'
      pdf.text(lineTotal, pageWidth - margin - 2, y + 5.5, { align: 'right' })
      y += lineHeight
    })

    // Total
    y += 6
    pdf.setDrawColor(14, 14, 12)
    pdf.setLineWidth(0.4)
    pdf.line(margin, y, pageWidth - margin, y)
    y += 8
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('TOTAL', margin, y)
    pdf.setTextColor(200, 85, 61)
    pdf.setFontSize(14)
    pdf.text(`${(total / 1000).toFixed(3)} F`, pageWidth - margin, y, { align: 'right' })

    // Notes
    if (info.notes) {
      y += 14
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text('NOTES', margin, y)
      y += 5
      pdf.setTextColor(14, 14, 12)
      const lines = pdf.splitTextToSize(info.notes, pageWidth - 2 * margin)
      pdf.text(lines, margin, y)
    }

    // Footer
    pdf.setTextColor(150, 150, 150)
    pdf.setFontSize(7)
    pdf.text(
      `Devis non contractuel · Valable 30 jours · Généré le ${date}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    pdf.save(`devis-atelier-${Date.now()}.pdf`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-cream h-full overflow-y-auto"
      >
        <div className="sticky top-0 bg-cream border-b border-ink p-6 flex items-center justify-between z-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
              Votre sélection
            </p>
            <h2 className="text-display text-3xl">
              Devis <em className="italic text-terracotta">en cours</em>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-ink text-cream flex items-center justify-center hover:bg-terracotta transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {cart.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingBag size={40} className="mx-auto text-ink/30 mb-4" />
              <p className="text-display text-3xl text-ink/40">Vide.</p>
              <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mt-2">
                Ajoute des produits pour commencer
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-ink/15">
                {cart.map(item => (
                  <li key={item.id} className="py-4 flex gap-4">
                    <div className="w-20 h-20 bg-paper flex-shrink-0 stripes p-2">
                      <img
                        src={resolveImg(item.image)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-terracotta mb-1">
                        {item.brand}
                      </p>
                      <h4 className="text-display text-sm leading-tight mb-2">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center border border-ink">
                          <button
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-ink hover:text-cream transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-mono text-xs">{item.qty}</span>
                          <button
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-ink hover:text-cream transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right">
                          {item.price ? (
                            <p className="font-mono text-xs">
                              {((item.price * item.qty) / 1000).toFixed(3)} F
                            </p>
                          ) : (
                            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                              Sur devis
                            </p>
                          )}
                          <button
                            onClick={() => onRemove(item.id)}
                            className="font-mono text-[10px] uppercase tracking-widest text-ink/50 hover:text-terracotta mt-1"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-ink mt-4 pt-4 flex items-baseline justify-between">
                <p className="font-mono text-xs uppercase tracking-widest">Total estimé</p>
                <p className="text-display text-3xl text-terracotta">
                  {(total / 1000).toFixed(3)} <span className="text-base text-ink">F</span>
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                  Vos informations
                </p>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={info.name}
                  onChange={e => setInfo({ ...info, name: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border border-ink/30 focus:border-terracotta focus:outline-none font-mono text-sm transition-colors"
                />
                <input
                  type="text"
                  placeholder="Société (optionnel)"
                  value={info.company}
                  onChange={e => setInfo({ ...info, company: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border border-ink/30 focus:border-terracotta focus:outline-none font-mono text-sm transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={info.email}
                  onChange={e => setInfo({ ...info, email: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border border-ink/30 focus:border-terracotta focus:outline-none font-mono text-sm transition-colors"
                />
                <textarea
                  placeholder="Notes / commentaires (optionnel)"
                  value={info.notes}
                  onChange={e => setInfo({ ...info, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-transparent border border-ink/30 focus:border-terracotta focus:outline-none font-mono text-sm transition-colors resize-none"
                />
              </div>

              <button
                onClick={generatePDF}
                className="w-full mt-6 px-6 py-4 bg-terracotta text-cream font-mono text-xs uppercase tracking-widest hover:bg-ink transition-colors flex items-center justify-center gap-2"
              >
                <FileDown size={14} />
                Télécharger le devis (PDF)
              </button>
            </>
          )}
        </div>
      </motion.aside>
    </motion.div>
  )
}

/* ================== FOOTER ================== */
function Footer() {
  return (
    <footer id="contact" className="bg-ink text-cream mt-32">
      <div className="px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto py-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cream/50 mb-6">
              — Une dernière chose
            </p>
            <h2 className="text-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9]">
              Parlons<br />
              <em className="italic text-terracotta">ensemble.</em>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-end">
            <div className="space-y-2 font-mono text-sm">
              <p className="text-cream/60 uppercase text-[10px] tracking-widest mb-3">Contact</p>
              <a href="mailto:contact@atelier.com" className="block hover:text-terracotta transition-colors">
                contact@atelier.com
              </a>
              <a href="tel:+33000000000" className="block hover:text-terracotta transition-colors">
                +33 0 00 00 00 00
              </a>
              <p className="text-cream/60 pt-4">
                Toulon, France
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-cream/50">
          <p>© 2026 Atelier — Tous droits réservés</p>
          <p>Catalogue généré · 54 références · 5 marques</p>
        </div>
      </div>
    </footer>
  )
}
