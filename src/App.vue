<script setup lang="ts">
import {ref} from "vue";
import GuessPitch from "@/components/GuessPitch.vue"
import HigherLower from "@/components/LowerHigher.vue";

const exercise = ref("guessPitch")

</script>

<template>
  <nav>
    <a href="#" @click="exercise = 'guessPitch'">Guess the pitch</a>
    <a href="#" @click="exercise = 'lowerHigher'">Lower Higher</a>
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
</style>
