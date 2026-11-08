export type RecipeVaultTheme = 'light' | 'dark'

// A shared Nuxt state ensures all components observe the same selection.
export function useRecipeVaultTheme() {
  const theme = useState<RecipeVaultTheme>('recipevault-theme', () => 'light')

  function apply(value: RecipeVaultTheme) {
    theme.value = value
    if (import.meta.client) {
      document.documentElement.dataset.theme = value
      document.documentElement.style.colorScheme = value
      try { localStorage.setItem('recipevault-theme', value) } catch { /* storage disabled */ }
    }
  }

  function toggleTheme() { apply(theme.value === 'dark' ? 'light' : 'dark') }

  onMounted(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem('recipevault-theme') } catch { /* storage disabled */ }
    const preferred = saved === 'dark' || saved === 'light'
      ? saved
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    apply(preferred)
  })

  return { theme: readonly(theme), toggleTheme, setTheme: apply }
}
