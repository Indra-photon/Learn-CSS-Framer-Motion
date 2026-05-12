'use client'

import React from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { IconBell } from '@tabler/icons-react'


function IconPhotoAlt() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-photo-alt"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 18h5" />
      <path d="M14 18h4" />
      <path d="M15 7h.01" />
      <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12" />
      <path d="M3 15l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
      <path d="M14 13l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
      <path d="M3 15h18" />
    </svg>
  )
}

function IconPlusFilled() {

    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1 -2 0v-6h-6a1 1 0 0 1 0 -2h6v-6a1 1 0 0 1 1 -1" /></svg>)
} 

const tabs = [
  {
    name: 'Gallery',
    icon: <IconPhotoAlt />,
  },
  {
    name: 'Search',
    icon: <IconPlusFilled />,
  },
  {
    name: 'Notifications',
    icon: <IconBell />,
  },
]

const springTransition = { type: 'spring', stiffness: 300, damping: 30 } as const

function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: { name: string; icon: React.ReactNode }
  isActive: boolean
  onClick: () => void
}) {
  if (isActive) {
    return (
      <motion.div
        layoutId={`tab-${tab.name}`}
        onClick={onClick}
        transition={springTransition}
        className='relative flex cursor-pointer flex-row items-center gap-2 px-3 py-1.5'
      >
        <motion.div
          layoutId='tab-background'
          transition={springTransition}
          className='absolute inset-0 rounded-[14px] bg-stone-400'
        />
        <motion.span
          layoutId={`tab-icon-${tab.name}`}
          transition={springTransition}
          className='relative z-10 flex items-center justify-center text-[16px]'
        >
          {tab.icon}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.15 }}
          className='relative z-10 whitespace-nowrap text-[16px] tracking-tighter text-gray-800'
        >
          {tab.name}
        </motion.span>
      </motion.div>
    )
  }

  return (
    <motion.div
      layoutId={`tab-${tab.name}`}
      onClick={onClick}
      transition={springTransition}
      className='relative cursor-pointer px-3 py-1.5'
    >
      <motion.span
        layoutId={`tab-icon-${tab.name}`}
        transition={springTransition}
        className='relative z-10 flex items-center justify-center text-[16px]'
      >
        {tab.icon}
      </motion.span>
    </motion.div>
  )
}


function SideTabInteraction() {
  const [activeTab, setActiveTab] = React.useState<string | null>(null)

  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <LayoutGroup>
        <motion.div
          layout
          transition={springTransition}
          className='bg-stone-300 rounded-[20px] p-[6px] flex flex-row items-center justify-center gap-1'
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.name}
              tab={tab}
              isActive={activeTab === tab.name}
              onClick={() => setActiveTab(activeTab === tab.name ? null : tab.name)}
            />
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  )
}

export default SideTabInteraction