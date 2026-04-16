<script setup>
import { ref } from 'vue'
import { useSearch } from '../composables/useSearch.js'
import { useFilters } from '../composables/useFilters.js'
import { FUEL_TYPES, RADIUS_OPTIONS } from '../config/constants.js'

const emit = defineEmits(['go'])

const { query, suggestions, selectedCoords, search, select, clear } = useSearch()
const { filters, toggleCarburant, setRayon } = useFilters()

const showDropdown = ref(false)
const inputRef = ref(null)

function onInput(e) {
  // Clear coords when user edits the address field
  if (selectedCoords.value) clear()
  search(e.target.value)
  showDropdown.value = true
}

function onSelectSuggestion(suggestion) {
  select(suggestion)        // sets selectedCoords + query internally
  showDropdown.value = false
}

function onGo() {
  if (!selectedCoords.value) return
  emit('go', { coords: selectedCoords.value, filters })
  showDropdown.value = false
}

function onBlur() {
  // slight delay so click on suggestion registers first
  setTimeout(() => { showDropdown.value = false }, 150)
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    showDropdown.value = false
    inputRef.value?.blur()
  }
}
</script>

<template>
  <div class="search-form">
    <div class="search-form__inner">
      <!-- Address search -->
      <div class="search-field">
        <label class="label" for="address-input">Adresse</label>
        <div class="search-field__wrapper">
          <input
            id="address-input"
            ref="inputRef"
            class="input search-field__input"
            type="text"
            :value="query"
            placeholder="Ex : 12 rue de Rivoli, Paris"
            autocomplete="off"
            @input="onInput"
            @focus="showDropdown = suggestions.length > 0"
            @blur="onBlur"
            @keydown="onKeydown"
          />
          <!-- Autocomplete dropdown -->
          <ul v-if="showDropdown && suggestions.length > 0" class="dropdown" role="listbox">
            <li
              v-for="(s, i) in suggestions"
              :key="i"
              class="dropdown__item"
              role="option"
              @mousedown.prevent="onSelectSuggestion(s)"
            >
              <span class="dropdown__icon">📍</span>
              {{ s.label }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Fuel filter -->
      <div class="fuel-field">
        <span class="label">Carburant</span>
        <div class="pill-group">
          <button
            v-for="fuel in FUEL_TYPES"
            :key="fuel"
            type="button"
            class="pill"
            :class="{ 'pill--active': filters.carburants.includes(fuel) }"
            @click="toggleCarburant(fuel)"
          >
            {{ fuel }}
          </button>
        </div>
      </div>

      <!-- Radius selector -->
      <div class="radius-field">
        <label class="label" for="radius-select">Rayon</label>
        <select id="radius-select" :value="filters.rayon" class="select" @change="setRayon(Number($event.target.value))">
          <option v-for="r in RADIUS_OPTIONS" :key="r" :value="r">{{ r }} km</option>
        </select>
      </div>

      <!-- GO button -->
      <div class="go-field">
        <button
          type="button"
          class="btn btn--accent btn--go"
          :disabled="!selectedCoords"
          @click="onGo"
        >
          Rechercher
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-form {
  background-color: var(--color-surface);
  box-shadow: var(--shadow-md);
  padding: 14px 16px;
  z-index: 1000;
  position: relative;
}

.search-form__inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ≥768px: horizontal layout */
@media (min-width: 768px) {
  .search-form__inner {
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 12px 16px;
  }

  .search-field {
    flex: 1 1 260px;
    min-width: 200px;
  }

  .fuel-field {
    flex: 1 1 auto;
  }

  .radius-field {
    flex: 0 0 auto;
  }

  .go-field {
    flex: 0 0 auto;
  }
}

/* Address field */
.search-field__wrapper {
  position: relative;
}

.search-field__input {
  padding-right: 36px;
}

/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  list-style: none;
  z-index: 2000;
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
}

.dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text);
  transition: background-color var(--transition);
}

.dropdown__item:hover {
  background-color: var(--color-bg);
}

.dropdown__icon {
  font-size: 12px;
  flex-shrink: 0;
}

/* Pill group */
.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* GO button full-width on mobile */
.btn--go {
  width: 100%;
  padding: 11px 24px;
}

@media (min-width: 768px) {
  .btn--go {
    width: auto;
  }
}
</style>
