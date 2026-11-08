<template>
  <div class="rv-landing">
    <section class="rv-hero">
      <div class="rv-hero-copy">
        <span class="rv-eyebrow">✦ YOUR DIGITAL RECIPE COLLECTION</span>
        <h1>Every recipe has <span>a story.</span></h1>
        <p>Keep the dishes you love, discover new favourites and share a little kitchen magic with friends and family.</p>
        <div class="rv-hero-actions">
          <NuxtLink to="/recipes" class="btn">Open My Cookbook <span aria-hidden="true">→</span></NuxtLink>
          <NuxtLink to="/recipes/import" class="btn btn-secondary">↗ Import a Recipe</NuxtLink>
        </div>
        <div class="rv-hero-note"><span aria-hidden="true">✦</span> Your recipes, beautifully organised and always within reach.</div>
      </div>
      <div class="rv-hero-art" aria-label="Illustration of a collection of recipes and ingredients" role="img">
        <div class="rv-art-orbit rv-orbit-one"></div><div class="rv-art-orbit rv-orbit-two"></div>
        <span class="rv-art-floating rv-floating-tomato" aria-hidden="true">🍅</span>
        <span class="rv-art-floating rv-floating-herb" aria-hidden="true">🌿</span>
        <span class="rv-art-floating rv-floating-lemon" aria-hidden="true">🍋</span>
        <div class="rv-recipe-illustration">
          <div class="rv-recipe-illustration-top"><span>RECIPEVAULT</span><span>✦</span></div>
          <div class="rv-recipe-illustration-photo">🍝</div>
          <div class="rv-recipe-illustration-body"><span class="rv-recipe-category">FAMILY FAVOURITES</span><strong>Sunday Pasta</strong><div class="rv-recipe-rating">★★★★★ <span>Made with love</span></div><div class="rv-recipe-details"><span>◷ 30 mins</span><span>♨ Easy</span></div></div>
        </div>
        <div class="rv-art-sticker">♥<small>Made with<br/>love</small></div>
      </div>
    </section>
    <section class="rv-feature-section" aria-label="What you can do with RecipeVault">
      <div class="rv-section-heading"><span class="rv-eyebrow">THE JOY OF COOKING</span><h2>Everything in one delicious place</h2><p>From treasured family favourites to something new for tonight.</p></div>
      <div class="rv-feature-grid">
        <NuxtLink to="/recipes" class="rv-feature-card"><div class="rv-feature-icon rv-icon-recipes" aria-hidden="true">📖</div><h3>My Cookbook</h3><p>Keep all your favourite recipes organised in one beautiful collection.</p><span>Explore recipes →</span></NuxtLink>
        <NuxtLink to="/recipes/import" class="rv-feature-card"><div class="rv-feature-icon rv-icon-import" aria-hidden="true">🌐</div><h3>Import from the Web</h3><p>Found something tasty online? Bring it into your recipe collection.</p><span>Import a recipe →</span></NuxtLink>
        <NuxtLink to="/friends" class="rv-feature-card"><div class="rv-feature-icon rv-icon-friends" aria-hidden="true">👩‍🍳</div><h3>Share the Love</h3><p>Connect with friends and enjoy recipes worth passing around.</p><span>Find friends →</span></NuxtLink>
      </div>
    </section>
  </div>
</template>
