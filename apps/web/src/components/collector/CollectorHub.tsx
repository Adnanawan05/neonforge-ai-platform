'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DragDropUpload from './DragDropUpload'
import ApiConnector from './ApiConnector'
import DbConnector from './DbConnector'

const tabs = [
  { id: 'upload', label: 'Upload' },
  { id: 'api', label: 'API' },
  { id: 'db', label: 'Database' },
] as const

type Tab = (typeof tabs)[number]['id']

export default function CollectorHub() {
  const [tab, setTab] = useState<Tab>('upload')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {tabs.map((t) => {
          const active = t.id === tab
          return (
            <motion.button
              key={t.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab(t.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${active ? 'bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black shadow-glow' : 'bg-white/10 text-white/80 border border-white/10'}`}
            >
              {t.label}
            </motion.button>
          )
        })}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'upload' ? <DragDropUpload /> : null}
            {tab === 'api' ? <ApiConnector /> : null}
            {tab === 'db' ? <DbConnector /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
