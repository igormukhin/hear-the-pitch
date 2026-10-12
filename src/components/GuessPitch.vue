<script setup lang="ts">

import {randomPitch, toNotation, toPitch} from "@/support/notes"
import {reactive, ref} from "vue"
import {play, playSequence} from "@/support/audioplay";
import {brightPiano, steelGuitar} from "@/support/instruments";

const referencePitch = toPitch("C3")
const answerButtons = [ "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4" ];

function getRandomPitch() {
  const rangeMin = toPitch(answerButtons[0])
  const rangeMax = toPitch(answerButtons[answerButtons.length - 1])
  return randomPitch(rangeMin, rangeMax)
}

const questionInstrumentInfo = steelGuitar;
const answerInstrumentInfo = brightPiano;
let lastQuestionPitch = referencePitch
let questionPitch = getRandomPitch()
let answerPitch = ref(referencePitch)
let answerState = reactive({
  displayCorrect: false,
  displayIncorrect: false
})
let hint = ref('')

async function confirmAnswer() {
  const correct = questionPitch === answerPitch.value
  const nextPitch = correct ? getRandomPitch() : questionPitch
  const notes = [
    {instrument: answerInstrumentInfo, note: answerPitch.value},
    {instrument: questionInstrumentInfo, note: questionPitch, delay: 1}
  ]
  if (correct) {
    notes.push(
      {instrument: questionInstrumentInfo, note: questionPitch, delay: 3},
      {instrument: questionInstrumentInfo, note: nextPitch, delay: 4}
    )
  }
  await playSequence(notes)

  if (correct) {
    lastQuestionPitch = questionPitch
    questionPitch = nextPitch
    answerState.displayCorrect = true
    setTimeout(() => answerState.displayCorrect = false, 1000)
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
  <section class="pitch-card">
    <header>
      <p class="eyebrow">Find the note</p>
      <h1>Guess the pitch</h1>
      <p class="description">Listen, compare, and choose a note below.</p>
    </header>

    <div class="listening-row">
      <button type="button" class="listen-button" @click="play(questionInstrumentInfo, referencePitch)" title="Play the reference note">
        <span class="listen-label">Reference</span>
        <span class="listen-note">{{ toNotation(referencePitch) }} <span class="play-icon">▶</span></span>
      </button>
      <button type="button" class="listen-button" @click="play(questionInstrumentInfo, lastQuestionPitch)" title="Play the last question">
        <span class="listen-label">Previous</span>
        <span class="listen-note">{{ toNotation(lastQuestionPitch) }} <span class="play-icon">▶</span></span>
      </button>
      <button type="button" class="listen-button question" @click="play(questionInstrumentInfo, questionPitch)" title="Play the question note">
        <span class="listen-label">Question</span>
        <span class="listen-note">? <span class="play-icon">▶</span></span>
      </button>
    </div>

    <section class="note-section">
      <div class="section-heading">
        <h2>Your answer</h2>
        <span :title="answerInstrumentInfo.title">Bright piano</span>
      </div>
      <div class="note-grid">
        <button v-for="pitch in answerButtons" :key="pitch" type="button"
          :class="{ accidental: pitch.includes('#'), selected: answerPitch === toPitch(pitch) }"
          :title="'Select and play ' + pitch"
          @click="answerPitch = toPitch(pitch); play(answerInstrumentInfo, pitch)">{{ pitch }}</button>
      </div>
      <div class="answer-row">
        <button type="button" class="answer-preview"
          :class="{ correct: answerState.displayCorrect, incorrect: answerState.displayIncorrect }"
          @click="play(answerInstrumentInfo, answerPitch)" title="Play your selected answer">
          {{ toNotation(answerPitch) }} <span class="play-icon">▶</span>
        </button>
        <button type="button" class="check-button" @click="confirmAnswer()">Check answer</button>
        <button type="button" class="hint-button" @click="showHint()">Hint <span class="hint">{{ hint || '·' }}</span></button>
      </div>
      <div class="feedback">
        <span v-if="answerState.displayCorrect" class="correct-text">✓ Correct! Listen to the next note.</span>
        <span v-else-if="answerState.displayIncorrect" class="incorrect-text">Try another note and compare again.</span>
        <span v-else>Tap a note to select it and hear it.</span>
      </div>
    </section>

    <section class="note-section comparison">
      <div class="section-heading">
        <h2>Compare by ear</h2>
        <span :title="questionInstrumentInfo.title">Steel guitar</span>
      </div>
      <div class="note-grid">
        <button v-for="pitch in answerButtons" :key="pitch" type="button"
          :class="{ accidental: pitch.includes('#') }" :title="'Play ' + pitch + ' on the question instrument'"
          @click="play(questionInstrumentInfo, pitch)">{{ pitch }}</button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.pitch-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 34rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #fff;
  color: #0f172a;
  box-shadow: 0 4px 20px #0f172a06;
}

.pitch-card * {
  box-sizing: border-box;
}

header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.375rem;
  color: #2563eb;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.description {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 0.8125rem;
  line-height: 1.5;
}

button {
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms, box-shadow 150ms;
}

.listening-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.listen-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.375rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
  color: #334155;
}

.listen-label {
  color: #64748b;
  font-size: 0.6875rem;
}

.listen-note {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 1.125rem;
  font-weight: 600;
}

.play-icon {
  font-size: 0.625rem;
}

.listen-button:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.question, .check-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #fff;
}

.question .listen-label {
  color: #dbeafe;
}

.question:hover, .check-button:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
}

h2 {
  margin: 0;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 600;
}

.section-heading > span {
  color: #64748b;
  font-size: 0.6875rem;
}

.note-grid {
  display: grid;
  grid-template-columns: repeat(13, minmax(0, 1fr));
  gap: 0.25rem;
}

.note-grid button {
  min-width: 0;
  height: 3.25rem;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background: #fff;
  color: #475569;
  font-size: 0.6875rem;
  font-weight: 600;
  box-shadow: 0 2px 0 #e2e8f0;
}

.note-grid button.accidental {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
  box-shadow: 0 2px 0 #e2e8f0;
}

.note-grid button:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.note-grid button.selected {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  box-shadow: 0 2px 0 #1d4ed8;
}

.answer-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.answer-row button {
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.answer-preview, .hint-button {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
}

.answer-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.check-button {
  flex: 1;
}

.answer-preview:hover, .hint-button:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.hint {
  display: inline-block;
  min-width: 0.75rem;
  color: #2563eb;
}

.answer-preview.correct {
  border-color: #86efac;
  background: #dcfce7;
  color: #15803d;
}

.answer-preview.incorrect {
  border-color: #fcd34d;
  background: #fffbeb;
  color: #b45309;
}

.feedback {
  min-height: 1.875rem;
  padding-top: 0.5rem;
  color: #64748b;
  font-size: 0.6875rem;
  line-height: 1.5;
}

.correct-text {
  color: #15803d;
}

.incorrect-text {
  color: #b45309;
}

.comparison {
  margin-top: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}

@media (max-width: 480px) {
  .pitch-card {
    padding: 1rem;
  }

  .note-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.375rem;
  }

  .note-grid button {
    height: 2rem;
  }

  .listening-row {
    gap: 0.5rem;
  }
}

@media (max-height: 700px) {
  .pitch-card {
    padding: 0.875rem;
  }

  header, .listening-row {
    margin-bottom: 0.75rem;
  }

  .description {
    margin-top: 0.25rem;
  }

  .listen-button {
    padding: 0.5rem 0.625rem;
    gap: 0.25rem;
  }

  .answer-row {
    margin-top: 0.75rem;
  }

  .comparison {
    margin-top: 0.25rem;
    padding-top: 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}

@media (max-width: 480px) and (max-height: 600px) {
  h1 {
    font-size: 1.25rem;
  }

  header {
    margin-bottom: 0.5rem;
  }
}
</style>
