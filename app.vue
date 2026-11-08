<template>
  <div class="min-h-screen">
    <header class="bg-white border-b border-stone-200">
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-red-800">🍲 RecipeVault</NuxtLink>
        <nav class="flex flex-wrap items-center gap-4 text-sm" aria-label="Main navigation">
          <NuxtLink to="/recipes">My Recipes</NuxtLink>
          <NuxtLink to="/recipes/new">Add Recipe</NuxtLink>
          <NuxtLink v-if="user" to="/friends/recipes">Friends Recipes</NuxtLink>
          <NuxtLink v-if="user" to="/discover">Discover</NuxtLink>
          <NuxtLink v-if="user" to="/saved">Saved</NuxtLink>
          <template v-if="user">
            <NuxtLink to="/friends">Friends</NuxtLink>
            <NuxtLink to="/profile">My Profile</NuxtLink>
            <button class="text-red-800" @click="signOut">Sign out</button>
          </template>
          <NuxtLink v-else to="/auth/login">Sign in</NuxtLink>
          <button type="button" class="theme-toggle" :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" :aria-pressed="theme === 'dark'" @click="toggleTheme">
            <span aria-hidden="true">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
            <span>{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
          </button>
        </nav>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-8"><NuxtPage /></main>
  </div>
</template>
<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()
const { theme, toggleTheme } = useRecipeVaultTheme()
async function signOut() { await client.auth.signOut(); await navigateTo('/auth/login') }
</script>
