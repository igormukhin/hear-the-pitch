<script setup lang="ts">

import {randomPitch, toNotation, toPitch} from "@/support/notes"
import {ref} from "vue"
import {playSequence, playWrongAnswer} from "@/support/audioplay";
import {grandPiano, steelGuitar} from "@/support/instruments";
import {useStoredOptions} from "@/support/storedoptions";

const rangeMin = toPitch("C3")
const rangeMax = toPitch("C5")

const firstInstrumentInfo = steelGuitar;
const secondInstrumentInfo = grandPiano;

const firstPitch = ref(0)
const secondPitch = ref(0)

const {gap, sameOption} = useStoredOptions<{gap: number; sameOption: boolean}>("hear-the-pitch.lower-higher.options", {
  gap: 2,
  sameOption: true
}, {
  gap: (value): value is number => typeof value === "number" && Number.isInteger(value) && value > 0,
  sameOption: (value): value is boolean => typeof value === "boolean"
})
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
  return playSequence([
    {instrument: firstInstrumentInfo, note: firstPitch.value},
    {instrument: secondInstrumentInfo, note: secondPitch.value, delay: 1}
  ])
}

function answer(correct: boolean) {
  if (correct) {
    justAnswered.value = "+"
    newQuestion()
    playQuestion()
  } else {
    justAnswered.value = "-"
    playWrongAnswer()
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
  <fieldset class="panel">
    <legend>Options</legend>
    <div>Gap: <input type="number" v-model="gap" /></div>
    <div>Same: <input type="checkbox" v-model="sameOption" /></div>
  </fieldset>

  <div class="panel button-row">
    <button @click="playQuestion()" data-shortcut="R">Replay (R)</button>
    <span v-if="justAnswered === '+'" class="correct">Correct</span>
    <span v-if="justAnswered === '-'" class="incorrect">Incorrect</span>
  </div>

  <div class="panel button-row">
    <button @click="answerLower()" data-shortcut="M">Lower (M)</button>
    <button @click="answerSame()" data-shortcut="K" :disabled="!sameOption">Same (K)</button>
    <button @click="answerHigher()" data-shortcut="O">Higher (O)</button>
  </div>

  <div class="panel">
    <div>Answer: <span class="show-on-hover">{{ toNotation(firstPitch) }} {{ secondPitch > firstPitch ? '↗' : secondPitch < firstPitch ? '↘' : '→' }} {{ toNotation(secondPitch) }}</span></div>
  </div>
</template>

<style scoped>

.panel {
  margin-top: 1em;
}

.button-row {
  display: flex;
  gap: 0.5rem;
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
