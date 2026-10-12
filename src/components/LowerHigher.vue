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
  <section class="exercise">
    <div class="practice-card">
      <div class="playback">
        <button type="button" class="replay-button" @click="playQuestion()" data-shortcut="R" title="Replay both notes (R)">
          <span class="play-icon">▶</span>
          Replay notes
          <kbd>R</kbd>
        </button>
        <div class="feedback">
          <span v-if="justAnswered === '+'" class="correct">✓ Correct! Here’s the next pair.</span>
          <span v-else-if="justAnswered === '-'" class="incorrect">Try again. You’ve got this.</span>
          <span v-else>Listen to both notes, then choose their direction.</span>
        </div>
      </div>

      <div class="answer-buttons">
        <button type="button" @click="answerLower()" data-shortcut="M" title="Answer lower (M)">
          <span class="direction">↘</span>
          <span class="answer-label">Lower</span>
          <kbd>M</kbd>
        </button>
        <button type="button" @click="answerSame()" data-shortcut="K" :disabled="!sameOption" title="Answer same (K)">
          <span class="direction">→</span>
          <span class="answer-label">Same</span>
          <kbd>K</kbd>
        </button>
        <button type="button" @click="answerHigher()" data-shortcut="O" title="Answer higher (O)">
          <span class="direction">↗</span>
          <span class="answer-label">Higher</span>
          <kbd>O</kbd>
        </button>
      </div>

      <details :key="`${firstPitch}:${secondPitch}`" class="answer-reveal">
        <summary>Reveal the notes</summary>
        <p>{{ toNotation(firstPitch) }} <span class="note-direction">{{ secondPitch > firstPitch ? '↗' : secondPitch < firstPitch ? '↘' : '→' }}</span> {{ toNotation(secondPitch) }}</p>
      </details>
    </div>

    <fieldset class="options">
      <legend>Options</legend>
      <div class="option-row">
        <label class="option-label" for="pitch-gap">Gap <span>Distance in semitones</span></label>
        <input id="pitch-gap" type="number" min="1" step="1" v-model="gap" />
      </div>
      <div class="option-row">
        <label class="option-label" for="same-notes">Same notes <span>Include pairs with equal pitch</span></label>
        <input id="same-notes" type="checkbox" v-model="sameOption" />
      </div>
    </fieldset>
  </section>
</template>

<style scoped>
.exercise {
  width: 100%;
  max-width: 34rem;
  color: #0f172a;
}

.exercise * {
  box-sizing: border-box;
}

.practice-card {
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px #0f172a06;
}

.playback {
  padding: 0 0 1rem;
  text-align: center;
}

button {
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms, box-shadow 150ms;
}

.replay-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  border: 1px solid #2563eb;
  border-radius: 0.75rem;
  background: #2563eb;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  box-shadow: 0 3px 8px #2563eb26;
}

.replay-button:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.play-icon {
  font-size: 0.75rem;
}

kbd {
  display: inline-grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.6875rem;
  font-weight: 500;
}

.replay-button kbd {
  background: #ffffff1a;
  border-color: #ffffff4d;
  color: #fff;
}

.feedback {
  min-height: 2.25rem;
  padding-top: 0.625rem;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.5;
}

.correct {
  color: #15803d;
}

.incorrect {
  color: #b45309;
}

.answer-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.answer-buttons button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  padding: 0.75rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.875rem;
  background: #f8fafc;
  color: #334155;
}

.answer-buttons button:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
  box-shadow: 0 2px 8px #2563eb0d;
}

.answer-buttons button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.direction {
  color: #2563eb;
  font-size: 1.625rem;
  line-height: 1;
}

.answer-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.answer-reveal {
  margin-top: 1rem;
  padding-top: 0.875rem;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.answer-reveal summary {
  width: fit-content;
  margin: auto;
  color: #64748b;
  font-size: 0.75rem;
  cursor: pointer;
}

.answer-reveal p {
  margin: 0.375rem 0 0;
  font-size: 1rem;
  font-weight: 600;
}

.note-direction {
  margin: 0 0.75rem;
  color: #2563eb;
}

.options {
  min-width: 0;
  margin: 1rem 0 0;
  padding: 0.25rem 1.25rem 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
}

.options legend {
  padding: 0 0.5rem;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
}

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 0;
}

.option-row + .option-row {
  border-top: 1px solid #e2e8f0;
}

.option-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.option-label span {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
}

input[type="number"] {
  width: 4.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  color: #334155;
  font-size: 0.875rem;
}

input[type="checkbox"] {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  accent-color: #2563eb;
  cursor: pointer;
}

button:focus-visible, input:focus-visible, summary:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}

@media (max-width: 420px) {
  .practice-card {
    padding: 1rem;
  }

  .answer-buttons {
    gap: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}

@media (max-height: 700px) {
  .practice-card {
    padding: 1rem;
  }

  .playback {
    padding-bottom: 0.75rem;
  }

  .replay-button {
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
  }

  .feedback {
    min-height: 2rem;
  }

  .options {
    margin-top: 0.75rem;
  }

  .option-row {
    padding: 0.5rem 0;
  }
}
</style>
