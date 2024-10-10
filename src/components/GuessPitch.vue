<script setup lang="ts">

import {randomPitch, toNotation, toPitch} from "@/support/notes"
import {computed, reactive, ref} from "vue"
import {play, player} from "@/support/audioplay";

const referencePitch = toPitch("C3")
const answerButtons = [ "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4" ];

function getRandomPitch() {
  const rangeMin = toPitch(answerButtons[0])
  const rangeMax = toPitch(answerButtons[answerButtons.length - 1])
  return randomPitch(rangeMin, rangeMax)
}

// https://surikov.github.io/webaudiofont/#catalog-of-instruments
let questionInstrumentNum = ref(258)
let answerInstrumentNum = ref(1)

let questionInstrumentInfo = computed(() => player.loader.instrumentInfo(questionInstrumentNum.value));
let answerInstrumentInfo = ref(player.loader.instrumentInfo(player.loader.findInstrument(answerInstrumentNum.value)));
let lastQuestionPitch = referencePitch
let questionPitch = getRandomPitch()
let answerPitch = ref(referencePitch)
let answerState = reactive({
  displayCorrect: false,
  displayIncorrect: false
})
let hint = ref('')

async function confirmAnswer() {
  await play(answerInstrumentInfo.value, answerPitch.value)
  await play(questionInstrumentInfo.value, questionPitch, 1, 1)

  if (questionPitch === answerPitch.value) {
    lastQuestionPitch = questionPitch
    questionPitch = getRandomPitch()
    answerState.displayCorrect = true
    setTimeout(() => answerState.displayCorrect = false, 1000)

    await play(questionInstrumentInfo.value, lastQuestionPitch, 1, 3)
    await play(questionInstrumentInfo.value, questionPitch, 1, 4)
  } else {
    answerState.displayIncorrect = true
    setTimeout(() => answerState.displayIncorrect = false, 1000)
  }
}

async function showHint() {
  hint.value = questionPitch === answerPitch.value ? '='
      : questionPitch > answerPitch.value ? '↑'
      : '↓'
  setTimeout(() => hint.value = '', 1000);
}

</script>

<template>
  <div class="label-row">
    <span class="label">Reference:</span>
    <span class="value">{{ toNotation(referencePitch) }}</span>
    <button @click="play(questionInstrumentInfo, referencePitch)">Play</button>
  </div>
  <div class="label-row">
    <span class="label">Last question:</span>
    <span class="value">{{ toNotation(lastQuestionPitch) }}</span>
    <button @click="play(questionInstrumentInfo, lastQuestionPitch)">Play</button>
  </div>
  <div class="label-row">
    <span class="label">Question:</span>
    <span class="value">?</span>
    <button @click="play(questionInstrumentInfo, questionPitch)">Play</button>
  </div>
  <div class="label-row">
    <span class="label">Answer: </span>
    <span class="value"
          :class="{ 'flash-correct': answerState.displayCorrect, 'flash-incorrect': answerState.displayIncorrect }">
      {{ toNotation(answerPitch) }}
    </span>
    <button @click="play(answerInstrumentInfo, answerPitch)">Play</button>
    <button @click="confirmAnswer()">Answer</button>
    <button @click="showHint()">Hint</button><span>{{ hint }}</span>
  </div>
  <div class="keyboard-row">
    <div>
      <button v-for="pitch in answerButtons" @click="answerPitch = toPitch(pitch); play(answerInstrumentInfo, pitch)">{{ pitch }}</button>
    </div>
  </div>
  <div class="label-row">
    <span class="label">Answer instrument: {{ answerInstrumentInfo.title }} {{ answerInstrumentNum }}</span>
  </div>
  <div class="keyboard-row">
    <div>
      <button v-for="pitch in answerButtons" @click="play(questionInstrumentInfo, pitch)">{{ pitch }}</button>
    </div>
  </div>
  <div class="label-row">
    <span class="label">Question instrument: {{ questionInstrumentInfo.title }} {{ questionInstrumentNum }}</span>
  </div>
</template>

<style scoped>

  .label-row {
    margin-top: 0.5em;
  }

  .label-row .label {
    display: inline-block;
    min-width: 7em;
  }

  .label-row .value {
    display: inline-block;
    min-width: 2em;
    font-weight: bold;
    text-align: center;
    margin-right: 1em;
  }

  .label-row .value.flash-correct {
    background-color: lightgreen;
    transition: background-color 1s;
  }

  .label-row .value.flash-incorrect {
    background-color: red;
    transition: background-color 1s;
  }

  .label-row button {
    margin-right: 1em;
  }

  .keyboard-row {
    margin-top: 1em;
  }

  .keyboard-row button {
    display: inline-block;
    padding-left: 0;
    padding-right: 0;
    width: 2.5em;
    margin-right: 0.2em;
    background-color: white;
    border: 1px solid gray;
    border-radius: 0.2em;
    height: 3em;
  }

  .keyboard-row button:hover {
    background-color: lightgray;
  }
</style>
