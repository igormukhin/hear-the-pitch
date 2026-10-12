<script setup lang="ts">
import {onMounted, onUnmounted} from "vue"

function handleShortcut(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || event.repeat ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (event.target instanceof HTMLElement &&
      (event.target.isContentEditable || event.target.closest('input, textarea, select'))) return

  const key = event.key.toLowerCase()
  const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-shortcut]')
  for (const button of buttons) {
    if (button.dataset.shortcut?.toLowerCase() !== key || button.matches(':disabled')) continue
    if (button.closest('[hidden], [inert]') || !button.getClientRects().length) continue
    const visibility = window.getComputedStyle(button).visibility
    if (visibility === "hidden" || visibility === "collapse") continue

    event.preventDefault()
    button.click()
    return
  }
}

onMounted(() => window.addEventListener("keyup", handleShortcut))
onUnmounted(() => window.removeEventListener("keyup", handleShortcut))
</script>

<template>
  <slot />
</template>
