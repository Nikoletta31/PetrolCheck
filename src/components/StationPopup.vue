<script setup>
import { computed } from 'vue'

const props = defineProps({
  station: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function formatPrice(prix) {
  if (prix == null) return null
  return Number(prix).toFixed(3) + ' €/L'
}

const fuels = computed(() => {
  if (!props.station?.carburants) return []
  return props.station.carburants
})
</script>

<template>
  <Transition name="popup">
    <div v-if="station" class="popup-overlay" @click.self="emit('close')">
      <div class="popup" role="dialog" aria-modal="true" :aria-label="station.nom">
        <!-- Header -->
        <div class="popup__header">
          <div class="popup__title-block">
            <h2 class="popup__name">{{ station.nom }}</h2>
            <p class="popup__address">{{ station.adresse }}, {{ station.ville }}</p>
          </div>
          <button
            type="button"
            class="popup__close btn btn--ghost"
            aria-label="Fermer"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <p class="popup__updated">Mis à jour le {{ formatDate(station.maj) }}</p>

        <hr class="divider" />

        <!-- Fuel table -->
        <table class="fuel-table">
          <thead>
            <tr>
              <th class="fuel-table__th">Carburant</th>
              <th class="fuel-table__th fuel-table__th--right">Prix</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fuel in fuels" :key="fuel.type" class="fuel-table__row">
              <td class="fuel-table__td fuel-table__type">{{ fuel.type }}</td>
              <td class="fuel-table__td fuel-table__td--right">
                <span v-if="fuel.dispo === false || fuel.prix == null" class="rupture">
                  Rupture
                </span>
                <span v-else class="fuel-table__price">
                  {{ formatPrice(fuel.prix) }}
                </span>
              </td>
            </tr>
            <tr v-if="fuels.length === 0">
              <td colspan="2" class="fuel-table__empty">Aucune information disponible</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Overlay — only on mobile */
.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
}

@media (max-width: 767px) {
  .popup-overlay {
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: all;
    display: flex;
    align-items: flex-end;
  }
}

@media (min-width: 768px) {
  .popup-overlay {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 16px;
    pointer-events: none;
  }
}

/* Panel */
.popup {
  background-color: var(--color-surface);
  width: 100%;
  pointer-events: all;
  padding: 20px 20px 28px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-lg);
  max-height: 70vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .popup {
    width: 340px;
    border-radius: var(--radius-lg);
    max-height: calc(100vh - 160px);
    margin-top: 80px;
  }
}

/* Header */
.popup__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.popup__title-block {
  flex: 1;
  min-width: 0;
}

.popup__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popup__address {
  font-size: 12px;
  color: var(--color-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popup__close {
  padding: 4px 8px;
  font-size: 13px;
  flex-shrink: 0;
}

.popup__updated {
  font-size: 11px;
  color: var(--color-muted);
  margin-top: 6px;
}

/* Fuel table */
.fuel-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 4px;
}

.fuel-table__th {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-muted);
  text-align: left;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
}

.fuel-table__th--right,
.fuel-table__td--right {
  text-align: right;
}

.fuel-table__row {
  border-bottom: 1px solid var(--color-border);
}

.fuel-table__row:last-child {
  border-bottom: none;
}

.fuel-table__td {
  padding: 9px 0;
  font-size: 13px;
}

.fuel-table__type {
  font-weight: 600;
  color: var(--color-text);
}

.fuel-table__price {
  font-weight: 700;
  color: var(--color-accent);
  font-size: 14px;
}

.fuel-table__empty {
  padding: 12px 0;
  color: var(--color-muted);
  font-size: 13px;
  text-align: center;
}

/* Transitions */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 200ms ease;
}

.popup-enter-active .popup,
.popup-leave-active .popup {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .popup-enter-from .popup,
  .popup-leave-to .popup {
    transform: translateY(100%);
  }
}

@media (min-width: 768px) {
  .popup-enter-from .popup,
  .popup-leave-to .popup {
    transform: translateX(40px);
    opacity: 0;
  }
}
</style>
