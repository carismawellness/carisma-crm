'use client'

import { useState } from 'react'
import { TopNav } from '@/components/inbox/TopNav'
import type { BrandId, Channel } from '@/lib/constants'

export default function InboxPage() {
  const [selectedBrand, setSelectedBrand] = useState<BrandId | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('open')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar placeholder — replaced in Task 15 */}
        <div id="sidebar-placeholder" className="w-48 border-r bg-white shrink-0" />
        {/* ConversationList placeholder — replaced in Task 16 */}
        <div id="conversation-list-placeholder" className="w-80 border-r bg-white shrink-0" />
        {/* ThreadPane placeholder — replaced in Task 17 */}
        <div id="thread-pane-placeholder" className="flex-1 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
          Select a conversation
        </div>
      </div>
    </div>
  )
}
