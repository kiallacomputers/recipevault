<template><div class="space-y-5"><NuxtLink :to="`/recipes/${id}`" class="text-red-800">← Recipe</NuxtLink><h1 class="text-3xl font-bold">Edit Recipe</h1><p v-if="error" class="error">{{error}}</p><p v-else-if="!draft">Loading…</p><RecipeEditor v-else :initial="draft" :recipe-id="id" @saved="savedId=>navigateTo(`/recipes/${savedId}`)"/></div></template>
<script setup lang="ts">
definePageMeta({middleware:'auth'});import type {RecipeDraft} from '~/types/recipe'
const id=String(useRoute().params.id),repo=useRecipeRepository(),draft=ref<RecipeDraft|null>(null),error=ref('')
onMounted(async()=>{try{const {recipe,ingredients,steps}=await repo.get(id);draft.value={title:recipe.title,description:recipe.description||'',category:recipe.category,servings:recipe.servings,prep_minutes:recipe.prep_minutes,cook_minutes:recipe.cook_minutes,visibility:recipe.visibility,ingredients,steps}}catch(e:any){error.value=e.message||'Unable to load recipe'}})
</script>
