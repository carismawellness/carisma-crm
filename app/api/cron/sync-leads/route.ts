import { NextRequest, NextResponse } from 'next/server'
import { BRANDS, type BrandId } from '@/lib/constants'
import { syncBrandStages, syncBrandLeads } from '@/lib/leads/sync'

// Lead sync does many sequential mirror upserts; give it headroom beyond the
// default function timeout so a full cron pass commits without being killed.
export const maxDuration = 60

// Serverless time guards: cap leads per brand on the normal cron path;
// ?bulk=true lifts the cap for a full reseed.
const MAX_LEADS_PER_BRAND = 200
const MAX_LEADS_BULK = 2000

async function handle(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const bulk = url.searchParams.get('bulk') === 'true'
  const max = bulk ? MAX_LEADS_BULK : MAX_LEADS_PER_BRAND

  const results: Record<string, { stages: number; leads: number; errors: string[] }> = {}

  for (const id of Object.keys(BRANDS) as BrandId[]) {
    const brand = BRANDS[id]
    if (
      !brand.ghlApiKey || brand.ghlApiKey === 'placeholder' ||
      !brand.ghlLocationId || brand.ghlLocationId === 'placeholder'
    ) {
      continue
    }

    const brandResult = { stages: 0, leads: 0, errors: [] as string[] }
    results[id] = brandResult

    try {
      brandResult.stages = await syncBrandStages(id)
    } catch (err) {
      brandResult.errors.push(`stages: ${String(err)}`)
    }

    try {
      brandResult.leads = await syncBrandLeads(id, { max })
    } catch (err) {
      brandResult.errors.push(`leads: ${String(err)}`)
    }
  }

  return NextResponse.json({ ok: true, synced: results, bulk, ts: new Date().toISOString() })
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
