<template><div class="min-h-screen"><header class="bg-white border-b border-stone-200"><div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between"><NuxtLink to="/" class="text-2xl font-bold text-red-800">🍲 My Recipe Vault</NuxtLink><nav class="flex items-center gap-4 text-sm"><NuxtLink to="/recipes">My Recipes</NuxtLink><NuxtLink to="/recipes/new">Add Recipe</NuxtLink><template v-if="user"><button @click="signOut" class="text-red-800">Sign out</button></template><NuxtLink v-else to="/auth/login">Sign in</NuxtLink></nav></div></header><main class="max-w-6xl mx-auto px-4 py-8"><NuxtPage/></main></div></template>
<script setup lang="ts">
const user=useSupabaseUser();const client=useSupabaseClient()
async function signOut(){await client.auth.signOut();await navigateTo('/auth/login')}
</script>
