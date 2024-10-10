<script setup lang="ts">

import {randomPitch, toNotation, toPitch} from "@/support/notes"
import {ref} from "vue"
import {play, player} from "@/support/audioplay";

const rangeMin = toPitch("C3")
const rangeMax = toPitch("C5")

// https://surikov.github.io/webaudiofont/#catalog-of-instruments
const firstInstrumentNum = ref(258)
const secondInstrumentNum = ref(1)
const firstInstrumentInfo = ref(player.loader.instrumentInfo(firstInstrumentNum.value));
const secondInstrumentInfo = ref(player.loader.instrumentInfo(secondInstrumentNum.value));

const firstPitch = ref(0)
const secondPitch = ref(0)

const gap = ref(8)
const sameOption = ref(false)
const justAnswered = ref("")

function newQuestion() {
  firstPitch.value = randomPitch(rangeMin, rangeMax)

  let coefficient: number
  if (sameOption.value) {
    coefficient = Math.floor(Math.random() * 3) - 1
  } else {
    coefficient = Math.floor(Math.random() * 2) === 0 ? -1 : 1
  }

  secondPitch.value = firstPitch.value + gap.value * coefficient
}

newQuestion()

function playQuestion() {
  play(firstInstrumentInfo.value, firstPitch.value, 1)
  play(secondInstrumentInfo.value, secondPitch.value, 1, 1)
}

function answer(correct: boolean) {
  if (correct) {
    justAnswered.value = "+"
    newQuestion()
    playQuestion()
  } else {
    justAnswered.value = "-"
  }
  setTimeout(() => justAnswered.value = "", 1000)
}

function answerHigher() {
  answer(firstPitch.value < secondPitch.value)
}

function answerLower() {
  answer(firstPitch.value > secondPitch.value)
}

function answerSame() {
  answer(firstPitch.value === secondPitch.value)
}

</script>

<template>
  <div class="panel">
    <button @click="playQuestion()">Replay</button>
    <span v-if="justAnswered === '+'" class="correct">Correct</span>
    <span v-if="justAnswered === '-'" class="incorrect">Incorrect</span>
  </div>

  <div class="panel">
    <button @click="answerLower()">Lower</button>
    <button @click="answerSame()" :disabled="!sameOption">Same</button>
    <button @click="answerHigher()">Higher</button>
  </div>

  <div class="panel">
    <div>Gap: <input type="number" v-model="gap" /></div>
    <div>Same: <input type="checkbox" v-model="sameOption" /></div>
  </div>

  <div class="panel">
    <div>Answer: <span class="show-on-hover">{{ toNotation(firstPitch) }} {{ toNotation(secondPitch) }}</span></div>
  </div>
</template>

<style scoped>

.panel {
  margin-top: 1em;
}

.correct {
  color: green;
}

.incorrect {
  color: red;
}

.show-on-hover {
  opacity: 0;
}

.show-on-hover:hover {
  opacity: 1;
}

</style>
