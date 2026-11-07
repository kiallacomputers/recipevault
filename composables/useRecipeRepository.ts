import type {RecipeDraft,Recipe,Ingredient,Step} from '~/types/recipe'
export function useRecipeRepository(){
 const client=useSupabaseClient();const user=useSupabaseUser()
 function requireUser(){if(!user.value)throw new Error('Please sign in');return user.value.id}
 async function list(search=''){
  let query=client.from('recipes').select('*').eq('owner_id',requireUser()).order('updated_at',{ascending:false})
  if(search.trim())query=query.ilike('title',`%${search.trim().replace(/[%_,]/g,'')}%`)
  const {data,error}=await query;if(error)throw error;return data as Recipe[]
 }
 async function get(id:string){
  const {data,error}=await client.from('recipes').select('*').eq('id',id).eq('owner_id',requireUser()).single();if(error)throw error
  const [ingredients,steps]=await Promise.all([
   client.from('recipe_ingredients').select('*').eq('recipe_id',id).order('position'),
   client.from('recipe_steps').select('*').eq('recipe_id',id).order('position')
  ]);if(ingredients.error)throw ingredients.error;if(steps.error)throw steps.error
  return {recipe:data as Recipe,ingredients:ingredients.data as Ingredient[],steps:steps.data as Step[]}
 }
 async function save(draft:RecipeDraft,id?:string){
  const owner_id=requireUser();const payload={owner_id,title:draft.title.trim(),description:draft.description.trim()||null,category:draft.category.trim()||'Other',servings:draft.servings,prep_minutes:draft.prep_minutes,cook_minutes:draft.cook_minutes,visibility:draft.visibility}
  if(!payload.title)throw new Error('Recipe title is required')
  // RPC writes parent, ingredients and steps in one database transaction.
  const {data,error}=await client.rpc('save_my_recipe',{p_recipe_id:id||null,p_title:payload.title,p_description:payload.description,p_category:payload.category,p_servings:payload.servings,p_prep_minutes:payload.prep_minutes,p_cook_minutes:payload.cook_minutes,p_visibility:payload.visibility,p_ingredients:draft.ingredients.filter(i=>i.name.trim()),p_steps:draft.steps.filter(s=>s.instruction.trim())})
  if(error)throw error;return data as string
 }
 async function remove(id:string){const {error}=await client.from('recipes').delete().eq('id',id).eq('owner_id',requireUser());if(error)throw error}
 async function uploadCover(id:string,file:File){
  const uid=requireUser();if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Please choose a JPG, PNG or WebP image')
  if(file.size>5*1024*1024)throw new Error('Image must be 5 MB or less')
  const ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'} as Record<string,string>)[file.type]
  const path=`${uid}/${id}/${crypto.randomUUID()}.${ext}`
  const {error:up}=await client.storage.from('recipe-images').upload(path,file,{contentType:file.type,upsert:false});if(up)throw up
  const {error:db}=await client.from('recipes').update({cover_image_path:path}).eq('id',id).eq('owner_id',uid)
  if(db){await client.storage.from('recipe-images').remove([path]);throw db}
 }
 async function imageUrl(path:string){const {data,error}=await client.storage.from('recipe-images').createSignedUrl(path,120);if(error)throw error;return data.signedUrl}
 return {list,get,save,remove,uploadCover,imageUrl}
}
