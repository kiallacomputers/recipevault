<template><div class="space-y-5"><h1 class="text-3xl font-bold">Saved Recipes</h1><p>Linked to the original creator. Access may be revoked at any time.</p><p v-if="error" class="error">{{error}}</p><p v-else-if="loading">Loading…</p><template v-else><div v-for="r in recipes" :key="r.id" class="card flex justify-between gap-3 items-center"><div><NuxtLink :to="`/recipes/${r.id}`" class="font-bold">{{r.title}}</NuxtLink><p class="text-sm opacity-70">By {{r.creator_name}}</p></div><button class="btn btn-secondary" @click="remove(r.id)">Remove</button></div><div v-for="id in unavailable" :key="id" class="card flex justify-between gap-3 items-center"><span>Recipe no longer available</span><button class="btn btn-secondary" @click="remove(id)">Remove link</button></div><p v-if="!recipes.length&&!unavailable.length">You haven't saved any recipes yet.</p></template></div></template>
<script setup lang="ts">
definePageMeta({middleware:'auth'})
const sharing=useRecipeSharing(),recipes=ref<Awaited<ReturnType<typeof sharing.saved>>['recipes']>([]),unavailable=ref<string[]>([]),loading=ref(true),error=ref('')
async function load(){loading.value=true;try{const result=await sharing.saved();recipes.value=result.recipes;unavailable.value=result.unavailable}catch(e:any){error.value=e.message}finally{loading.value=false}}
async function remove(id:string){try{await sharing.removeLink(id);await load()}catch(e:any){error.value=e.message}}
onMounted(load)
</script>
