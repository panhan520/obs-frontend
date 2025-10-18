import getReqByProxyModule from '~/config/request'
const req = getReqByProxyModule({ proxyModule: 'OPENSEARCH' })

export interface TimeRange {
  from: string // ISO string
  to: string // ISO string
}

export interface SearchRequest {
  index: string
  size?: number
  from?: number
  query?: string // simple query string
  filters?: Array<{ field: string; operator: 'is' | 'is_not'; value: string }>
  time?: TimeRange
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>
}

export interface OpenSearchHit<T = any> {
  _index: string
  _id: string
  _source: T
  sort?: any[]
}

export interface SearchResponse<T = any> {
  took: number
  timed_out: boolean
  hits: {
    total: { value: number; relation: string } | number
    hits: OpenSearchHit<T>[]
  }
}

function buildDsl(body: SearchRequest) {
  const must: any[] = []
  const mustNot: any[] = []

  if (body.query && body.query.trim()) {
    must.push({
      query_string: {
        query: body.query,
        default_operator: 'AND',
      },
    })
  }

  if (body.filters && body.filters.length) {
    body.filters.forEach((f) => {
      const term = { match_phrase: { [f.field]: f.value } }
      if (f.operator === 'is_not') mustNot.push(term)
      else must.push(term)
    })
  }

  if (body.time) {
    must.push({
      range: {
        '@timestamp': {
          gte: body.time.from,
          lte: body.time.to,
        },
      },
    })
  }

  const dsl: any = {
    size: body.size ?? 25,
    from: body.from ?? 0,
    sort: (body.sort && body.sort.length
      ? body.sort.map((s) => ({ [s.field]: { order: s.order } }))
      : [{ '@timestamp': { order: 'desc' } }]) as any,
    query: {
      bool: {
        must,
        must_not: mustNot,
      },
    },
  }

  return dsl
}

export async function searchLogs<T = any>(payload: SearchRequest) {
  const { index, ...rest } = payload
  const dsl = buildDsl(rest as SearchRequest)
  const res = (await req.post<SearchResponse<T>>(
    `/${encodeURIComponent(index)}/_search`,
    dsl,
  )) as unknown as SearchResponse<T>
  return res
}
