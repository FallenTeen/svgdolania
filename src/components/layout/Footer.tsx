import Link from 'next/link'
import { Music2, Droplets, MessageCircle } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa'

const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER

export function Footer() {
  return (
    <footer className="border-t-2 border-[var(--color-ink)] bg-[var(--color-primary-dark)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-extrabold">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[var(--color-sun)]">
                <Droplets size={18} strokeWidth={2.5} className="text-[var(--color-ink)]" />
              </span>
              Explore Curug Banyumas
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Katalog curug dan trip explore di seputaran Banyumas — dari yang santai buat
              keluarga sampai yang menantang buat pecinta trekking.
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
              Jelajah
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/curugs" className="hover:text-[var(--color-sun)]">Katalog Curug</Link></li>
              <li><Link href="/trips" className="hover:text-[var(--color-sun)]">Trip Terbuka</Link></li>
              <li><Link href="/artikel" className="hover:text-[var(--color-sun)]">Artikel</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-white/50">
              Terhubung
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 transition-colors hover:border-[var(--color-sun)] hover:text-[var(--color-sun)]"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 transition-colors hover:border-[var(--color-sun)] hover:text-[var(--color-sun)]"
              >
                <Music2 size={18} />
              </a>
            </div>
            {ADMIN_WHATSAPP && (
              <a
                href={`https://wa.me/${ADMIN_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-[var(--color-sun)]"
              >
                <MessageCircle size={16} />
                Chat admin di WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} Explore Curug Banyumas. Dibuat dengan ❤️ untuk pecinta alam.
        </div>
      </div>
    </footer>
  )
}
