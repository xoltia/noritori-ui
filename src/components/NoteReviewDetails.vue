<script lang="ts" setup>
import type { Note } from '../stores/useNotes'
import { computed } from 'vue'

const props = defineProps<{
  showMeaning: boolean
  note: Note
}>()

const hasTags = computed(() => props.note.tags.length > 0)
const hasExampleSetences = computed(
  () => props.note.exampleSentences.length > 0
)
const hasDescription = computed(() => !!props.note.description)
</script>

<template>
  <div class="columns px-5 box">
    <div class="column is-one-quarter">
      <h5 class="title is-5">
        {{ showMeaning ? 'Meanings' : 'Readings' }}
      </h5>
      <p class="subtitle">
        {{ (showMeaning ? note.meanings : note.readings).join('; ') }}
      </p>
      <div v-show="hasTags">
        <h5 class="title is-5 mt-1">Tags</h5>
        <div class="subtitle">
          <span v-for="(tag, index) in note.tags" :key="index">
            <span class="tag is-primary">{{ tag }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="column">
      <h5 class="title is-5" v-show="hasDescription">Explanation</h5>
      <p class="subtitle" v-show="hasDescription">
        {{ note.description }}
      </p>
      <div v-show="hasExampleSetences">
        <h5 class="title is-5 mb-2" v-show="hasExampleSetences">
          Example Sentences
        </h5>
        <ul>
          <li
            v-for="(sentence, index) in note.exampleSentences"
            :key="index"
            class="my-1"
          >
            {{ index + 1 }}. {{ sentence }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
