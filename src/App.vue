<script setup lang="ts">
import {useStoredOptions} from "@/support/storedoptions";
import GuessPitch from "@/components/GuessPitch.vue"
import HigherLower from "@/components/LowerHigher.vue";
import KeyboardShortcuts from "@/components/KeyboardShortcuts.vue";

type Exercise = "guessPitch" | "lowerHigher"

const {exercise} = useStoredOptions<{exercise: Exercise}>("hear-the-pitch.navigation", {
  exercise: "guessPitch"
}, {
  exercise: (value): value is Exercise => value === "guessPitch" || value === "lowerHigher"
})

</script>

<template>
  <KeyboardShortcuts />
  <nav>
    <a href="#" @click="exercise = 'guessPitch'" :class="{selected: exercise === 'guessPitch'}">Guess the pitch</a>
    <a href="#" @click="exercise = 'lowerHigher'" :class="{selected: exercise === 'lowerHigher'}">Lower Higher</a>
  </nav>

  <main>
    <GuessPitch v-if="exercise === 'guessPitch'" />
    <HigherLower v-if="exercise === 'lowerHigher'" />
  </main>
</template>

<style scoped>
  nav {
    background-color: #f8f9fa;
    margin-bottom: 2em;
  }

  nav a {
    margin-right: 1em;
  }

  nav a.selected {
    background-color: #dbeafe;
    color: #1e40af;
    font-weight: bold;
  }
</style>
