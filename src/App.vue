<script setup lang="ts">
import {useStoredOptions} from "@/support/storedoptions";
import GuessPitch from "@/components/GuessPitch.vue"
import HigherLower from "@/components/LowerHigher.vue";
import KeyboardShortcuts from "@/components/KeyboardShortcuts.vue";

type Exercise = "guessPitch" | "lowerHigher"

const {exercise} = useStoredOptions<{exercise: Exercise}>("hear-the-pitch.navigation", {
  exercise: "lowerHigher"
}, {
  exercise: (value): value is Exercise => value === "guessPitch" || value === "lowerHigher"
})

</script>

<template>
  <KeyboardShortcuts />
  <nav class="exercise-menu">
    <button type="button" @click="exercise = 'lowerHigher'" :class="{selected: exercise === 'lowerHigher'}">
      <span class="exercise-icon">↗</span>
      <span class="exercise-details">
        <span class="exercise-title">Lower Higher</span>
        <span class="exercise-description">Compare two notes</span>
      </span>
    </button>
    <button type="button" @click="exercise = 'guessPitch'" :class="{selected: exercise === 'guessPitch'}">
      <span class="exercise-icon">♪</span>
      <span class="exercise-details">
        <span class="exercise-title">Guess the pitch</span>
        <span class="exercise-description">Recognize a note</span>
      </span>
    </button>
  </nav>

  <main>
    <GuessPitch v-if="exercise === 'guessPitch'" />
    <HigherLower v-if="exercise === 'lowerHigher'" />
  </main>
</template>

<style scoped>
  .exercise-menu {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    box-sizing: border-box;
    width: 100%;
    max-width: 34rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
  }

  .exercise-menu button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    padding: 0.875rem;
    border: 1px solid transparent;
    border-radius: 0.75rem;
    background: transparent;
    color: #475569;
    text-align: left;
    cursor: pointer;
    transition: background-color 150ms, border-color 150ms, box-shadow 150ms;
  }

  .exercise-menu button:hover {
    background: #e2e8f0;
  }

  .exercise-menu button.selected {
    background: #fff;
    border-color: #bfdbfe;
    color: #1d4ed8;
    box-shadow: 0 2px 6px #0f172a0d;
  }

  .exercise-menu button:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  .exercise-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.625rem;
    background: #e2e8f0;
    font-size: 1.5rem;
  }

  .selected .exercise-icon {
    background: #dbeafe;
  }

  .exercise-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .exercise-title {
    font-size: 0.9375rem;
    font-weight: 650;
    line-height: 1.3;
  }

  .exercise-description {
    color: #64748b;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  @media (max-width: 420px) {
    .exercise-menu button {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .exercise-menu button {
      transition: none;
    }
  }

  @media (max-width: 480px) and (max-height: 600px) {
    .exercise-menu button {
      padding: 0.625rem;
    }

    .exercise-icon, .exercise-description {
      display: none;
    }

    .exercise-title {
      font-size: 0.8125rem;
    }
  }
</style>
