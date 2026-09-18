'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import type { ActionResult } from '@/lib/types'

export function ConfirmButton({
  onConfirm,
  confirmMessage,
  className,
  children,
  onDone,
}: {
  onConfirm: () => Promise<ActionResult<unknown>>
  confirmMessage: string
  className?: string
  children: ReactNode
  onDone?: (result: ActionResult<unknown>) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    if (!window.confirm(confirmMessage)) return
    setError(null)
    startTransition(async () => {
      const result = await onConfirm()
      if (!result.success) {
        setError(result.error ?? 'Terjadi kesalahan')
      }
      onDone?.(result)
    })
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" onClick={handleClick} disabled={isPending} className={className}>
        {isPending ? <Loader2 size={14} className="animate-spin" /> : children}
      </button>
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  )
}