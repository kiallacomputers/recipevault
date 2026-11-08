<template><div class="space-y-5"><h1 class="text-3xl font-bold">Discover Recipes</h1><p>Public recipes shared by RecipeVault members.</p><input v-model="search" placeholder="Search public recipes" aria-label="Search public recipes"/><p v-if="error" class="error">{{error}}</p><p v-else-if="loading">Loading…</p><p v-else-if="!recipes.length">No public recipes found.</p><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><NuxtLink v-for="r in recipes" :key="r.id" :to="`/recipes/${r.id}`" class="card"><h2 class="font-bold text-lg">{{r.title}}</h2><p class="text-sm opacity-70">{{r.category}} · By {{r.creator_name}}</p><p class="mt-2">{{r.description}}</p></NuxtLink></div></div></template>
<script setup lang="ts">
definePageMeta({middleware:'auth'})
const sharing=useRecipeSharing(),search=ref(''),recipes=ref<Awaited<ReturnType<typeof sharing.discover>>>([]),error=ref(''),loading=ref(true)
async function load(){loading.value=true;error.value='';try{recipes.value=await sharing.discover(search.value)}catch(e:any){error.value=e.message}finally{loading.value=false}}
watch(search,()=>load());onMounted(load)
</script>
