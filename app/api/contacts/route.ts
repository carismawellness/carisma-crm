import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 50

// GHL-style contacts smart-list: filter by brand/tag/source, search name/phone/
// email, paginated, newest first.
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = new URL(req.url).searchParams
  const brand = sp.get('brand')
  const q = sp.get('q')?.trim()
  const tag = sp.get('tag')
  const source = sp.get('source')
  const page = Math.max(0, Number(sp.get('page') ?? '0') || 0)

  let query = supabase
    .from('crm_contacts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  if (brand) query = query.eq('brand_id', brand)
  if (source) query = query.eq('source', source)
  if (tag) query = query.contains('tags', [tag])
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    contacts: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  })
}
