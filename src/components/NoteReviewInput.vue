<script lang="ts" setup>
import { watch } from 'vue'
import { Correctness } from './NoteReviewer.vue'
import { bind as bindWanakana, unbind as unbindWanakana } from 'wanakana'

const props = defineProps<{
  modelValue: string
  correctness: Correctness
  useIME: boolean
  onSubmit: () => void
}>()

const emit = defineEmits(['update:modelValue'])

watch(
  () => props.useIME,
  (newValue) => {
    const inputElement = document.getElementById('reading-input')
    if (!inputElement || !(inputElement instanceof HTMLInputElement)) {
      throw new Error('Could not find input element')
    }

    if (newValue) {
      bindWanakana(inputElement)
    } else {
      unbindWanakana(inputElement)
    }
  }
)
</script>

<template>
  <input
    type="text"
    class="box answer-input mx-auto"
    id="reading-input"
    placeholder="答え"
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLInputElement)?.value)"
    :disabled="correctness !== Correctness.Unanswered"
    :class="{
      'has-background-danger': correctness === Correctness.Incorrect,
      'has-background-success': correctness === Correctness.Correct,
      'has-text-light': correctness !== Correctness.Unanswered,
    }"
    @keyup.enter="onSubmit()"
    autocomplete="off"
  />
</template>

<style>
.answer-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1.5rem;
  padding: 1rem;
  text-align: center;
}
</style>
