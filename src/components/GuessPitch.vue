<script setup lang="ts">

import {type PresetInfo, type WaveEnvelope, type WavePreset, WebAudioFontPlayer} from '@/support/webaudiofont'
import {toNotation, toPitch} from "@/support/notes"
import {computed, reactive, ref} from "vue"

let audioContext: AudioContext
let player: WebAudioFontPlayer = new WebAudioFontPlayer()

async function getPreset(presetInfo: PresetInfo): Promise<WavePreset> {
  if (!audioContext) audioContext = new window.AudioContext()
  return await player.loader.getPreset(audioContext, presetInfo)
}

async function play(presetInfo: PresetInfo, note: string | number, duration: number = 1, delay: number = 0) : Promise<WaveEnvelope> {
  let preset = await getPreset(presetInfo)
  let pitch = typeof note === "string" ? toPitch(note) : note
  return await player.queueWaveTable(audioContext, audioContext.destination, preset,
      delay, pitch, duration)
}

const referencePitch = toPitch("C3")
const answerButtons = [ "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4" ];

function randomPitch() {
  return toPitch(answerButtons[Math.floor(Math.random() * answerButtons.length)])
}

// https://surikov.github.io/webaudiofont/#catalog-of-instruments
let questionInstrumentNum = ref(258)
let answerInstrumentNum = ref(1)

let questionInstrumentInfo = computed(() => player.loader.instrumentInfo(questionInstrumentNum.value));
let answerInstrumentInfo = ref(player.loader.instrumentInfo(player.loader.findInstrument(answerInstrumentNum.value)));
let lastQuestionPitch = referencePitch
let questionPitch = randomPitch()
let answerPitch = ref(referencePitch)
let answerState = reactive({
  displayCorrect: false,
  displayIncorrect: false
})

async function confirmAnswer() {
  await play(answerInstrumentInfo.value, answerPitch.value)
  await play(questionInstrumentInfo.value, questionPitch, 1, 1)

  if (questionPitch === answerPitch.value) {
    lastQuestionPitch = questionPitch
    questionPitch = randomPitch()
    answerState.displayCorrect = true
    setTimeout(() => answerState.displayCorrect = false, 1000)

    await play(questionInstrumentInfo.value, lastQuestionPitch, 1, 3)
    await play(questionInstrumentInfo.value, questionPitch, 1, 4)
  } else {
    answerState.displayIncorrect = true
    setTimeout(() => answerState.displayIncorrect = false, 1000)
  }
}

</script>

<template>
  <div class="label-row">
    <span class="label">Question instrument: {{ questionInstrumentInfo.title }} {{ questionInstrumentNum }}</span>
  </div>
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
    <button @click="confirmAnswer()">Answer</button>
  </div>
  <div class="keyboard-row">
    <div>
      <button v-for="answer in answerButtons" @click="answerPitch = toPitch(answer); play(answerInstrumentInfo, answerPitch)">{{ answer }}</button>
    </div>
  </div>
  <div class="label-row">
    <span class="label">Answer instrument: {{ answerInstrumentInfo.title }} {{ answerInstrumentNum }}</span>
  </div>
</template>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');

  * {
    font-family: "Noto Sans", sans-serif;
  }

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
</style>
