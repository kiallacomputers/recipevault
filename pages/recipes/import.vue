<template>
  <div class="space-y-5">
    <NuxtLink to="/recipes" class="text-blue-600">← My Recipes</NuxtLink>
    <h1 class="text-3xl font-bold">Import Recipe from Website</h1>
    <p>Paste a public recipe page URL. RecipeVault reads structured recipe data where available. Review and edit everything before saving.</p>
    <form class="card space-y-3" @submit.prevent="importRecipe">
      <label for="recipe-url">Recipe website URL</label>
      <input id="recipe-url" v-model.trim="url" type="url" required maxlength="2048" placeholder="https://example.com/chocolate-cake" />
      <button class="btn" type="submit" :disabled="busy">{{ busy ? 'Importing…' : 'Import Recipe' }}</button>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </form>
    <div v-if="imported" class="space-y-3">
      <div class="card space-y-1"><h2 class="text-xl font-bold">Review imported recipe</h2><p class="text-sm">Check ingredient quantities, units, instructions and timings before saving. The recipe will be private by default.</p><p class="text-xs break-all">Source: <a :href="imported.sourceUrl" target="_blank" rel="noopener noreferrer" class="underline">{{ imported.sourceUrl }}</a></p></div>
      <RecipeEditor :key="revision" :initial="draft!" @saved="id => navigateTo(`/recipes/${id}`)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { RecipeDraft } from '~/types/recipe'
definePageMeta({ middleware: 'auth' })
type Imported = Omit<RecipeDraft, 'visibility'> & { sourceUrl: string }
const url = ref(''), busy = ref(false), error = ref(''), imported = ref<Imported | null>(null), draft = ref<RecipeDraft | null>(null), revision = ref(0)
async function importRecipe() {
  busy.value = true; error.value = ''; imported.value = null; draft.value = null
  try {
    const result = await $fetch<Imported>('/api/recipes/import', { method: 'POST', body: { url: url.value } })
    imported.value = result
    draft.value = { ...result, visibility: 'private', category: result.category || 'Other' }
    revision.value++
  } catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'Unable to import this recipe.' }
  finally { busy.value = false }
}
</script>
