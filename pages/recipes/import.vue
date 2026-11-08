<template>
  <div class="rv-import-page space-y-5">
    <NuxtLink to="/recipes" class="rv-back-link">← My Recipes</NuxtLink>
    <section class="rv-import-hero">
      <div class="rv-import-intro"><span class="rv-eyebrow">✦ RECIPEVAULT IMPORTER</span><h1>Found a recipe <span>you love?</span></h1><p>Paste a link and we'll gather the recipe details for you. Review everything before adding it to your cookbook.</p></div>
      <div class="rv-import-art" aria-hidden="true"><span class="rv-import-art-globe">🌐</span><span class="rv-import-art-arrow">➜</span><span class="rv-import-art-book">📖</span><span class="rv-import-art-sparkle">✦</span></div>
    </section>
    <form class="card rv-import-form space-y-3" @submit.prevent="importRecipe">
      <label for="recipe-url">Recipe website URL</label>
      <div class="rv-import-input-wrap"><span aria-hidden="true">🔗</span><input id="recipe-url" v-model.trim="url" type="url" required maxlength="2048" placeholder="https://example.com/chocolate-cake" /></div>
      <button class="btn" type="submit" :disabled="busy">{{ busy ? 'Importing…' : 'Import Recipe →' }}</button>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p class="rv-import-hint">✦ Works best with recipe websites that provide structured recipe information.</p>
    </form>
    <div v-if="imported" class="space-y-3"><div class="card space-y-1"><h2 class="text-xl font-bold">✓ Review imported recipe</h2><p class="text-sm">Check ingredient quantities, units, instructions and timings before saving. The recipe will be private by default.</p><p class="text-xs break-all">Source: <a :href="imported.sourceUrl" target="_blank" rel="noopener noreferrer" class="underline">{{ imported.sourceUrl }}</a></p></div><RecipeEditor :key="revision" :initial="draft!" @saved="id => navigateTo(`/recipes/${id}`)" /></div>
    <div v-else class="rv-import-steps"><div><span>01</span><strong>Paste a link</strong><small>Copy a recipe URL from the web</small></div><div><span>02</span><strong>Review the details</strong><small>Make any changes you need</small></div><div><span>03</span><strong>Save to your cookbook</strong><small>Keep it private until you're ready</small></div></div>
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
