import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'sun' | 'whatsapp' | 'outline' | 'ghost'
type Size = 'md' | 'lg'

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] text-white border-[var(--color-ink)]',
  sun: 'bg-[var(--color-sun)] text-[var(--color-ink)] border-[var(--color-ink)]',
  whatsapp: 'bg-[var(--color-whatsapp)] text-white border-[var(--color-ink)]',
  outline: 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]',
  ghost: 'bg-transparent text-[var(--color-ink)] border-transparent shadow-none hover:bg-black/5',
}

const SIZE_STYLES: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 font-display font-bold transition-transform duration-100 disabled:opacity-50 disabled:pointer-events-none'

const POP_SHADOW =
  'shadow-[var(--shadow-pop-sm)] hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'

function classes(variant: Variant, size: Size, className?: string) {
  const shadow = variant === 'ghost' ? '' : POP_SHADOW
  return [BASE, VARIANT_STYLES[variant], SIZE_STYLES[size], shadow, className].filter(Boolean).join(' ')
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  external = false,
}: {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  external?: boolean
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes(variant, size, className)}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes(variant, size, className)}>
      {children}
    </Link>
  )
}
