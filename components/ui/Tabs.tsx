'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface Tab {
  key: string
  label: string
  content: ReactNode
}

export interface TabsProps {
  tabs: readonly Tab[]
  defaultTab?: string
  className?: string
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const initial = defaultTab ?? tabs[0]?.key
  const [active, setActive] = useState<string | undefined>(initial)
  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0]

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab?.key
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={cn(
                'rounded-pill border px-4 py-2 font-mono text-mono-label uppercase tracking-widest transition-colors',
                isActive
                  ? 'border-text-primary bg-text-primary text-white'
                  : 'border-border-strong text-text-primary hover:border-text-primary',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel">{activeTab?.content}</div>
    </div>
  )
}
