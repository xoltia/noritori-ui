<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from '@vue/reactivity'
import type { Note } from '../stores/useNotes'

const emit = defineEmits<{
  (event: 'start-reviews'): void
}>()

const props = defineProps<{
  notes: Note[]
}>()

const numWordNotes = computed(
  () => props.notes.filter((note) => note.type === 'word').length
)

const numKanjiNotes = computed(
  () => props.notes.filter((note) => note.type === 'kanji').length
)
</script>

<template>
  <div class="box p-6 has-text-centered">
    <h1 class="title has-text-dark">
      <span class="icon mr-3">
        <i class="fa-solid fa-repeat"></i>
      </span>
      <span>Reviews</span>
    </h1>
    <div class="notification is-primary is-light">
      <div class="block has-text-centered">
        <h1 class="title has-text-weight-bold is-2">
          {{ notes.length }}
        </h1>
        <h2 class="subtitle">Notes are ready for review.</h2>
      </div>
    </div>
    <div class="columns">
      <div class="column is-half">
        <div class="notification is-info is-light">
          <div class="block has-text-centered">
            <h1 class="title has-text-weight-bold">{{ numWordNotes }}</h1>
            <h2 class="subtitle">Vocabulary</h2>
          </div>
        </div>
      </div>
      <div class="column is-half">
        <div class="notification is-warning is-light">
          <div class="block has-text-centered">
            <h1 class="title has-text-weight-bold">
              {{ numKanjiNotes }}
            </h1>
            <h2 class="subtitle">Kanji</h2>
          </div>
        </div>
      </div>
    </div>
    <div class="has-text-centered">
      <button
        class="button is-medium is-primary is-outlined m-2"
        :disabled="notes.length === 0"
        @click="emit('start-reviews')"
      >
        Start Reviewing
      </button>
      <RouterLink to="/" class="button is-link is-outlined is-medium m-2">
        Do Later
      </RouterLink>
    </div>
  </div>
</template>
