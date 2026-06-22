'use client'

import { useState } from 'react'
import { TopNav } from '@/components/inbox/TopNav'
import { Sidebar } from '@/components/inbox/Sidebar'
import { ConversationList } from '@/components/inbox/ConversationList'
import { ThreadPane } from '@/components/inbox/ThreadPane'
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
        <Sidebar
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        <ConversationList
          brand={selectedBrand}
          channel={selectedChannel}
          status={selectedStatus}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
        <ThreadPane
          conversationId={selectedConversationId}
          onConversationClosed={() => setSelectedConversationId(null)}
        />
      </div>
    </div>
  )
}
