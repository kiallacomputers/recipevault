import { createError, readBody } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { parsePastedRecipe } from '../../utils/recipeImport'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to import recipes.' })
  const body = await readBody<{ text?: unknown }>(event)
  if (typeof body?.text !== 'string' || body.text.length > 30000) {
    throw createError({ statusCode: 400, statusMessage: 'Paste recipe text up to 30,000 characters.' })
  }
  return parsePastedRecipe(body.text)
})
