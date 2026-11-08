import { createError, readBody } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { fetchRecipeHtml, parseRecipeHtml } from '../../utils/recipeImport'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to import recipes.' })
  const body = await readBody<{ url?: unknown }>(event)
  if (typeof body?.url !== 'string' || body.url.length > 2048) throw createError({ statusCode: 400, statusMessage: 'Provide a valid recipe URL.' })
  const url = body.url.trim()
  const html = await fetchRecipeHtml(url)
  return parseRecipeHtml(html, url)
})
