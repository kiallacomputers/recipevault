import type { RecipeDraft, Recipe, Ingredient, Step } from '~/types/recipe'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function useRecipeRepository() {
  const client = useSupabaseClient()

  // Get the authenticated user from Supabase instead of assuming the
  // reactive user state has already finished hydrating after a redirect.
  async function requireUser(): Promise<string> {
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) {
      throw new Error('Your session has expired. Please sign in again.')
    }
    const id = data.user.id
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
      throw new Error('Unable to determine your account ID. Please sign out and sign in again.')
    }
    return id
  }

  function requireRecipeId(id: string): string {
    if (!UUID_PATTERN.test(id)) throw new Error('Invalid recipe ID.')
    return id
  }

  async function list(search = ''): Promise<Recipe[]> {
    const ownerId = await requireUser()
    let query = client.from('recipes').select('*').eq('owner_id', ownerId)
      .order('updated_at', { ascending: false })
    if (search.trim()) {
      query = query.ilike('title', `%${search.trim().replace(/[%_,]/g, '')}%`)
    }
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Recipe[]
  }

  async function get(id: string) {
    const recipeId = requireRecipeId(id)
    await requireUser()
    const { data, error } = await client.from('recipes').select('*')
      .eq('id', recipeId).single()
    if (error) throw error
    const [ingredients, steps] = await Promise.all([
      client.from('recipe_ingredients').select('*').eq('recipe_id', recipeId).order('position'),
      client.from('recipe_steps').select('*').eq('recipe_id', recipeId).order('position')
    ])
    if (ingredients.error) throw ingredients.error
    if (steps.error) throw steps.error
    return {
      recipe: data as Recipe,
      ingredients: (ingredients.data ?? []) as Ingredient[],
      steps: (steps.data ?? []) as Step[]
    }
  }

  async function save(draft: RecipeDraft, id?: string) {
    await requireUser()
    if (id) requireRecipeId(id)
    const title = draft.title.trim()
    if (!title) throw new Error('Recipe title is required')
    const { data, error } = await client.rpc('save_my_recipe', {
      p_recipe_id: id || null,
      p_title: title,
      p_description: draft.description.trim() || null,
      p_category: draft.category.trim() || 'Other',
      p_servings: draft.servings,
      p_prep_minutes: draft.prep_minutes,
      p_cook_minutes: draft.cook_minutes,
      p_visibility: draft.visibility,
      p_ingredients: draft.ingredients.filter(i => i.name.trim()),
      p_steps: draft.steps.filter(s => s.instruction.trim())
    })
    if (error) throw error
    return data as string
  }

  async function remove(id: string) {
    const recipeId = requireRecipeId(id)
    const ownerId = await requireUser()
    const { error } = await client.from('recipes').delete()
      .eq('id', recipeId).eq('owner_id', ownerId)
    if (error) throw error
  }

  async function uploadCover(id: string, file: File) {
    const recipeId = requireRecipeId(id)
    const ownerId = await requireUser()
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Please choose a JPG, PNG or WebP image')
    }
    if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5 MB or less')
    const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[file.type]
    const path = `${ownerId}/${recipeId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await client.storage.from('recipe-images')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError
    const { error: dbError } = await client.from('recipes')
      .update({ cover_image_path: path }).eq('id', recipeId).eq('owner_id', ownerId)
    if (dbError) {
      await client.storage.from('recipe-images').remove([path])
      throw dbError
    }
  }

  async function imageUrl(path: string) {
    await requireUser()
    const { data, error } = await client.storage.from('recipe-images').createSignedUrl(path, 120)
    if (error) throw error
    return data.signedUrl
  }

  return { list, get, save, remove, uploadCover, imageUrl }
}
