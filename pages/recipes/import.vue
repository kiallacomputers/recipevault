<template>
  <div class="rv-import-page space-y-5">
    <NuxtLink to="/recipes" class="rv-back-link">← My Recipes</NuxtLink>
    <section class="rv-import-hero">
      <div class="rv-import-intro"><span class="rv-eyebrow">✦ RECIPEVAULT IMPORTER</span><h1>Found a recipe <span>you love?</span></h1><p>Import from a website or paste the recipe text. Review everything before adding it to your cookbook.</p></div>
      <div class="rv-import-art" aria-hidden="true"><span class="rv-import-art-globe">🌐</span><span class="rv-import-art-arrow">➜</span><span class="rv-import-art-book">📖</span><span class="rv-import-art-sparkle">✦</span></div>
    </section>
    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Import method">
      <button type="button" role="tab" :aria-selected="mode === 'url'" :class="mode === 'url' ? 'btn' : 'btn btn-secondary'" @click="switchMode('url')">🔗 From Website</button>
      <button type="button" role="tab" :aria-selected="mode === 'text'" :class="mode === 'text' ? 'btn' : 'btn btn-secondary'" @click="switchMode('text')">📋 Paste Recipe Text</button>
    </div>
    <form v-if="mode === 'url'" class="card rv-import-form space-y-3" @submit.prevent="importUrl">
      <label for="recipe-url">Recipe website URL</label>
      <div class="rv-import-input-wrap"><span aria-hidden="true">🔗</span><input id="recipe-url" v-model.trim="url" type="url" required maxlength="2048" placeholder="https://example.com/chocolate-cake" /></div>
      <button class="btn" type="submit" :disabled="busy">{{ busy ? 'Importing…' : 'Import Recipe →' }}</button>
      <div v-if="error" role="alert" class="space-y-2"><p class="error">{{ error }}</p><button v-if="blocked" type="button" class="btn btn-secondary" @click="switchMode('text')">Try Paste Recipe Text instead</button></div>
      <p class="rv-import-hint">✦ Some recipe websites block automatic imports. You can still paste their recipe text.</p>
    </form>
    <form v-else class="card rv-import-form space-y-3" @submit.prevent="importText">
      <label for="recipe-text">Recipe text</label>
      <p class="text-sm">Copy the title, ingredients and instructions from the website. Use headings as shown below.</p>
      <textarea id="recipe-text" v-model="recipeText" rows="13" maxlength="30000" required placeholder="Chocolate Cake&#10;&#10;Ingredients&#10;2 cups flour&#10;1 cup sugar&#10;2 eggs&#10;&#10;Instructions&#10;Preheat oven to 180°C.&#10;Mix ingredients together.&#10;Bake for 30 minutes." />
      <button class="btn" type="submit" :disabled="busy || !recipeText.trim()">{{ busy ? 'Processing…' : 'Review Pasted Recipe →' }}</button>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <p class="rv-import-hint">✦ Ingredients and Instructions headings are required. Check the parsed details before saving.</p>
    </form>
    <div v-if="imported && draft" class="space-y-3">
      <div class="card space-y-1"><h2 class="text-xl font-bold">✓ Review imported recipe</h2><p class="text-sm">Check ingredient quantities, units, instructions, servings and timings before saving. Your recipe will be private by default.</p><p v-if="imported.sourceUrl" class="text-xs break-all">Source: <a :href="imported.sourceUrl" target="_blank" rel="noopener noreferrer" class="underline">{{ imported.sourceUrl }}</a></p></div>
      <RecipeEditor :key="revision" :initial="draft" @saved="id => navigateTo(`/recipes/${id}`)" />
    </div>
    <div v-else class="rv-import-steps"><div><span>01</span><strong>Import or paste</strong><small>Use a URL or copy recipe text</small></div><div><span>02</span><strong>Review the details</strong><small>Correct quantities and instructions</small></div><div><span>03</span><strong>Save to your cookbook</strong><small>Keep it private until you're ready</small></div></div>
  </div>
</template>
<script setup lang="ts">
import type { RecipeDraft } from '~/types/recipe'
definePageMeta({ middleware: 'auth' })
type Imported = Omit<RecipeDraft, 'visibility'> & { sourceUrl: string }
const mode = ref<'url' | 'text'>('url')
const url = ref(''), recipeText = ref(''), busy = ref(false), error = ref(''), blocked = ref(false)
const imported = ref<Imported | null>(null), draft = ref<RecipeDraft | null>(null), revision = ref(0)
function switchMode(next: 'url' | 'text') { mode.value = next; error.value = ''; blocked.value = false }
function applyResult(result: Imported) {
  imported.value = result
  draft.value = { ...result, visibility: 'private', category: result.category || 'Other' }
  revision.value++
}
function reportError(e: any) {
  error.value = e?.data?.statusMessage || e?.message || 'Unable to import this recipe.'
  blocked.value = /blocks automated|HTTP 403|HTTP 429|automated access/i.test(error.value)
}
async function importUrl() {
  busy.value = true; error.value = ''; blocked.value = false; imported.value = null; draft.value = null
  try { applyResult(await $fetch<Imported>('/api/recipes/import', { method: 'POST', body: { url: url.value } })) }
  catch (e: any) { reportError(e) }
  finally { busy.value = false }
}
async function importText() {
  busy.value = true; error.value = ''; blocked.value = false; imported.value = null; draft.value = null
  try { applyResult(await $fetch<Imported>('/api/recipes/import-text', { method: 'POST', body: { text: recipeText.value } })) }
  catch (e: any) { reportError(e) }
  finally { busy.value = false }
}
</script>
