import type { Recipe } from '~/types/recipe'
export interface SharedRecipe extends Recipe { creator_name?: string }
export function useRecipeSharing() {
 const db = useSupabaseClient()
 async function myId() {
  const { data, error } = await db.auth.getUser()
  if (error || !data.user) throw new Error('Please sign in again.')
  return data.user.id
 }
 async function withCreators(recipes: Recipe[]): Promise<SharedRecipe[]> {
  const ids = [...new Set(recipes.map(r => r.owner_id))]
  if (!ids.length) return []
  const { data, error } = await db.from('profiles').select('id,display_name').in('id', ids)
  if (error) throw error
  const names = new Map((data || []).map(p => [p.id, p.display_name]))
  return recipes.map(r => ({...r, creator_name: names.get(r.owner_id) || 'RecipeVault member'}))
 }
 async function discover(search = ''): Promise<SharedRecipe[]> {
  const id = await myId()
  let q = db.from('recipes').select('*').eq('visibility','public').neq('owner_id',id).order('updated_at',{ascending:false}).limit(60)
  if (search.trim()) q = q.ilike('title',`%${search.trim().replace(/[%_,]/g,'').slice(0,60)}%`)
  const { data, error } = await q
  if (error) throw error
  return withCreators((data || []) as Recipe[])
 }
 async function friendsRecipes(): Promise<SharedRecipe[]> {
  const id = await myId()
  const { data: f, error: fe } = await db.from('friendships').select('user_low,user_high').or(`user_low.eq.${id},user_high.eq.${id}`)
  if (fe) throw fe
  const ids = (f || []).map(x => x.user_low===id ? x.user_high : x.user_low)
  if (!ids.length) return []
  const { data, error } = await db.from('recipes').select('*').in('owner_id',ids).order('updated_at',{ascending:false}).limit(100)
  if (error) throw error
  return withCreators((data || []) as Recipe[])
 }
 async function saved() {
  const id = await myId()
  const { data, error } = await db.from('saved_recipes').select('recipe_id,created_at').eq('user_id',id).order('created_at',{ascending:false})
  if (error) throw error
  const ids = (data || []).map(x => x.recipe_id)
  if (!ids.length) return { recipes:[] as SharedRecipe[], unavailable:[] as string[] }
  const { data: visible, error: re } = await db.from('recipes').select('*').in('id',ids)
  if (re) throw re
  const recipes = await withCreators((visible || []) as Recipe[])
  const present = new Set(recipes.map(x=>x.id))
  return {recipes, unavailable: ids.filter(x=>!present.has(x))}
 }
 async function saveLink(recipeId:string) {
  const user_id = await myId()
  const {error} = await db.from('saved_recipes').insert({user_id,recipe_id:recipeId})
  if (error) throw error
 }
 async function removeLink(recipeId:string) {
  const id=await myId()
  const {error}=await db.from('saved_recipes').delete().eq('user_id',id).eq('recipe_id',recipeId)
  if (error) throw error
 }
 async function selectedFriends(recipeId:string) {
  const {data,error}=await db.from('recipe_selected_friends').select('friend_id').eq('recipe_id',recipeId)
  if(error) throw error
  return (data||[]).map(x=>x.friend_id)
 }
 async function addSelected(recipeId:string,friendId:string) {
  const {error}=await db.from('recipe_selected_friends').insert({recipe_id:recipeId,friend_id:friendId})
  if(error) throw error
 }
 async function removeSelected(recipeId:string,friendId:string) {
  const {error}=await db.from('recipe_selected_friends').delete().eq('recipe_id',recipeId).eq('friend_id',friendId)
  if(error) throw error
 }
 return {myId,discover,friendsRecipes,saved,saveLink,removeLink,selectedFriends,addSelected,removeSelected}
}
