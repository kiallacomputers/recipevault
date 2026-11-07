<template>
  <div class="min-h-screen">
    <header class="bg-white border-b border-stone-200"><div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
      <NuxtLink to="/" class="text-2xl font-bold text-red-800">🍲 RecipeVault</NuxtLink>
      <nav class="flex flex-wrap items-center gap-4 text-sm" aria-label="Main navigation">
        <NuxtLink to="/recipes">My Recipes</NuxtLink><NuxtLink to="/recipes/new">Add Recipe</NuxtLink>
        <template v-if="user"><NuxtLink to="/friends">Friends</NuxtLink><NuxtLink to="/profile">My Profile</NuxtLink><button class="text-red-800" @click="signOut">Sign out</button></template>
        <NuxtLink v-else to="/auth/login">Sign in</NuxtLink>
      </nav>
    </div></header>
    <main class="max-w-6xl mx-auto px-4 py-8"><NuxtPage /></main>
  </div>
</template>
<script setup lang="ts">
const user=useSupabaseUser(),client=useSupabaseClient()
async function signOut(){await client.auth.signOut();await navigateTo('/auth/login')}
</script>
