<template><div class="space-y-5"><h1 class="text-3xl font-bold">Friends' Recipes</h1><p>Recipes your friends have shared with you.</p><p v-if="error" class="error">{{error}}</p><p v-else-if="loading">Loading…</p><p v-else-if="!recipes.length">No shared recipes yet.</p><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><NuxtLink v-for="r in recipes" :key="r.id" :to="`/recipes/${r.id}`" class="card"><h2 class="font-bold text-lg">{{r.title}}</h2><p class="text-sm opacity-70">By {{r.creator_name}} · {{r.visibility}}</p><p class="mt-2">{{r.description}}</p></NuxtLink></div></div></template>
<script setup lang="ts">
definePageMeta({middleware:'auth'})
const sharing=useRecipeSharing(),recipes=ref<Awaited<ReturnType<typeof sharing.friendsRecipes>>>([]),error=ref(''),loading=ref(true)
onMounted(async()=>{try{recipes.value=await sharing.friendsRecipes()}catch(e:any){error.value=e.message}finally{loading.value=false}})
</script>
