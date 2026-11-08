import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { createError } from 'h3'

const MAX_BYTES = 1_500_000
const bad = (message: string, statusCode = 422) => createError({ statusCode, statusMessage: message })

function blockedIp(ip: string): boolean {
  const x = ip.toLowerCase()
  if (x.includes(':')) {
    if (x.startsWith('::ffff:')) return blockedIp(x.slice(7))
    return x === '::' || x === '::1' || x.startsWith('fc') || x.startsWith('fd') || /^fe[89ab]/.test(x) || x.startsWith('2001:db8') || x.startsWith('2001:0:')
  }
  const p = x.split('.').map(Number)
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true
  return p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224 || (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127) || (p[0] === 192 && p[1] === 0) || (p[0] === 198 && (p[1] === 18 || p[1] === 19)) || (p[0] === 192 && p[1] === 0 && p[2] === 2) || (p[0] === 198 && p[1] === 51 && p[2] === 100) || (p[0] === 203 && p[1] === 0 && p[2] === 113)
}

export async function validateImportUrl(value: string): Promise<URL> {
  let url: URL
  try { url = new URL(value) } catch { throw bad('Enter a valid website URL.') }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port && !['80','443'].includes(url.port)) throw bad('Only standard HTTP or HTTPS website URLs are supported.')
  if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost') || url.hostname.endsWith('.local') || url.hostname.endsWith('.internal') || isIP(url.hostname)) throw bad('This website address is not permitted.')
  let addresses: { address: string }[]
  try { addresses = await lookup(url.hostname, { all: true }) } catch { throw bad('Could not resolve the website hostname.') }
  if (!addresses.length || addresses.some(a => blockedIp(a.address))) throw bad('This website address is not permitted.')
  return url
}

export async function fetchRecipeHtml(input: string): Promise<string> {
  let current = input
  for (let hop = 0; hop < 4; hop++) {
    const url = await validateImportUrl(current)
    let response: Response
    try {
      response = await fetch(url.toString(), { redirect: 'manual', signal: AbortSignal.timeout(9000), headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'RecipeVaultRecipeImporter/1.0' } })
    } catch { throw bad('Could not retrieve the recipe page. The website may block automated access.') }
    if ([301,302,303,307,308].includes(response.status)) {
      const target = response.headers.get('location')
      if (!target) throw bad('The website redirected without a destination.')
      current = new URL(target, url).toString()
      continue
    }
    if (!response.ok) throw bad(`Website returned HTTP ${response.status}.`)
    if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(response.headers.get('content-type') || '')) throw bad('This URL does not return an HTML recipe page.')
    if (Number(response.headers.get('content-length') || 0) > MAX_BYTES) throw bad('The recipe page is too large.')
    const reader = response.body?.getReader()
    if (!reader) throw bad('Website returned no content.')
    const chunks: Uint8Array[] = []
    let length = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        length += value.length
        if (length > MAX_BYTES) throw bad('The recipe page is too large.')
        chunks.push(value)
      }
    } finally { await reader.cancel().catch(() => {}) }
    const bytes = new Uint8Array(length)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
    return new TextDecoder().decode(bytes)
  }
  throw bad('Too many redirects while fetching the recipe.')
}

const decode = (value: string) => value.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#(\d+)|#x([\da-f]+));/gi, (m, dec, hex) => {
  if (dec || hex) return String.fromCodePoint(parseInt(dec || hex, hex ? 16 : 10))
  return ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' } as Record<string,string>)[m.toLowerCase()] || m
})
const plain = (value: unknown): string => typeof value === 'string' ? decode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()) : ''
const duration = (value: unknown): number => {
  if (typeof value !== 'string') return 0
  const m = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i)
  return m ? Math.min(100000, Number(m[1] || 0)*1440 + Number(m[2] || 0)*60 + Number(m[3] || 0)) : 0
}
const textList = (value: unknown): string[] => (Array.isArray(value) ? value : value ? [value] : []).map(plain).filter(Boolean)
function steps(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(steps)
  if (typeof value === 'string') return [plain(value)].filter(Boolean)
  if (value && typeof value === 'object') {
    const item = value as Record<string, unknown>
    if (item.itemListElement) return steps(item.itemListElement)
    return [plain(item.text || item.name)].filter(Boolean)
  }
  return []
}
function findRecipe(node: unknown, depth = 0): Record<string, unknown> | null {
  if (!node || depth > 12) return null
  if (Array.isArray(node)) { for (const item of node) { const found = findRecipe(item, depth+1); if (found) return found } return null }
  if (typeof node !== 'object') return null
  const obj = node as Record<string, unknown>
  const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']]
  if (types.some(t => typeof t === 'string' && /(^|\/)Recipe$/i.test(t))) return obj
  for (const key of ['@graph', 'mainEntity', 'mainEntityOfPage', 'itemListElement', 'subjectOf']) {
    const found = findRecipe(obj[key], depth+1)
    if (found) return found
  }
  return null
}
export function parseRecipeHtml(html: string, sourceUrl: string) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
  for (const [, attrs, raw] of scripts) {
    if (!/type\s*=\s*["']?application\/ld\+json\b/i.test(attrs)) continue
    let data: unknown
    try { data = JSON.parse(raw.trim().replace(/^<!--|-->$/g, '')) } catch { continue }
    const recipe = findRecipe(data)
    if (!recipe) continue
    const title = plain(recipe.name)
    const ingredients = textList(recipe.recipeIngredient || recipe.ingredients).slice(0, 200)
    const instructions = steps(recipe.recipeInstructions).slice(0, 100)
    if (!title || !ingredients.length || !instructions.length) continue
    const yieldText = plain(Array.isArray(recipe.recipeYield) ? recipe.recipeYield[0] : recipe.recipeYield)
    const servings = Number(yieldText.match(/\d+/)?.[0] || 4)
    const prep = duration(recipe.prepTime), cook = duration(recipe.cookTime)
    return {
      sourceUrl, title: title.slice(0,160), description: plain(recipe.description).slice(0,3000),
      category: plain(Array.isArray(recipe.recipeCategory) ? recipe.recipeCategory[0] : recipe.recipeCategory) || 'Other',
      servings: Math.max(1,Math.min(1000,servings)), prep_minutes: prep, cook_minutes: cook,
      ingredients: ingredients.map((name, position) => ({ position, quantity: null, unit: '', name: name.slice(0,200), notes: '' })),
      steps: instructions.map((instruction, position) => ({ position, instruction: instruction.slice(0,5000) }))
    }
  }
  throw bad('No supported structured recipe was found. Try another recipe page or enter it manually.')
}
