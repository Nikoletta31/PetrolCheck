<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="landing">
    <!-- Navigation -->
    <nav class="landing-nav">
      <div class="landing-nav__inner">
        <span class="landing-nav__logo">PetrolCheck</span>
        <RouterLink to="/app" class="landing-nav__cta">
          Accéder à l'application
        </RouterLink>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">
          Trouvez le carburant<br />
          <span class="hero__title--accent">au meilleur prix</span>
        </h1>
        <p class="hero__subtitle">
          Comparez les prix des stations autour de vous en temps réel et économisez sur chaque plein.
        </p>
        <RouterLink to="/app" class="btn btn--accent btn--lg">
          Commencer maintenant
        </RouterLink>
      </div>
      <div class="hero__decoration" aria-hidden="true"></div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2 class="features__title">Pourquoi PetrolCheck ?</h2>
      <div class="features__grid">
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3 class="feature-card__title">Carte interactive</h3>
          <p class="feature-card__desc">
            Visualisez toutes les stations autour de vous sur une carte claire et intuitive.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3 class="feature-card__title">Prix en temps réel</h3>
          <p class="feature-card__desc">
            Données mises à jour quotidiennement pour des comparaisons fiables et actuelles.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <h3 class="feature-card__title">Multi-carburants</h3>
          <p class="feature-card__desc">
            SP95, SP98, E10, Diesel, GPL — filtrez selon le carburant qui vous convient.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <h3 class="feature-card__title">Rapide et simple</h3>
          <p class="feature-card__desc">
            Entrez votre adresse, choisissez votre carburant, et trouvez les stations les moins chères en quelques secondes.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta__content">
        <h2 class="cta__title">Prêt à économiser ?</h2>
        <p class="cta__desc">
          Trouvez dès maintenant les stations les moins chères près de chez vous.
        </p>
        <RouterLink to="/app" class="btn btn--accent btn--lg">
          Ouvrir la carte
        </RouterLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <p>PetrolCheck &copy; 2026 — Données fournies par le Ministère de la Transition Écologique</p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.landing-nav__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.landing-nav__logo {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: -0.02em;
}

.landing-nav__cta {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-accent);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-accent);
  transition: background-color var(--transition), color var(--transition);
}

.landing-nav__cta:hover {
  background-color: var(--color-accent);
  color: #fff;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 140px 24px 100px;
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg) 0%, #fff 100%);
}

.hero__content {
  position: relative;
  z-index: 2;
  max-width: 680px;
  margin: 0 auto;
}

.hero__title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin-bottom: 20px;
}

.hero__title--accent {
  color: var(--color-accent);
}

.hero__subtitle {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: var(--color-muted);
  line-height: 1.6;
  margin-bottom: 36px;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}

.btn--lg {
  padding: 14px 32px;
  font-size: 1rem;
  border-radius: var(--radius-lg);
}

.hero__decoration {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(29, 158, 117, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.features {
  padding: 80px 24px;
  background: #fff;
}

.features__title {
  text-align: center;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 48px;
  color: var(--color-text);
}

.features__grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  transition: transform var(--transition), box-shadow var(--transition);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(29, 158, 117, 0.1);
  color: var(--color-accent);
  margin-bottom: 16px;
}

.feature-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text);
}

.feature-card__desc {
  font-size: 0.9rem;
  color: var(--color-muted);
  line-height: 1.55;
}

.cta {
  padding: 80px 24px;
  text-align: center;
  background: linear-gradient(135deg, var(--color-accent) 0%, #178a63 100%);
  color: #fff;
}

.cta__title {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.cta__desc {
  font-size: 1.05rem;
  opacity: 0.9;
  margin-bottom: 32px;
  max-width: 460px;
  margin-left: auto;
  margin-right: auto;
}

.cta .btn--accent {
  background: #fff;
  color: var(--color-accent);
}

.cta .btn--accent:hover {
  background: #f0f0f0;
}

.landing-footer {
  padding: 24px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-muted);
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 600px) {
  .hero {
    padding: 120px 20px 80px;
  }

  .features {
    padding: 60px 20px;
  }

  .features__grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .cta {
    padding: 60px 20px;
  }
}
</style>
