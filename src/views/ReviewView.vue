<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useNotes, type Note } from '../stores/useNotes'
import ReviewLanding from '../components/ReviewLanding.vue'
import NoteReviewer from '@/components/NoteReviewer.vue'
import type { NoteState } from '../components/NoteReviewer.vue'

const notes = useNotes()
const dueNotes = ref<Note[]>([])
const loadingNotes = ref(true)
const reviewing = ref(false)

onMounted(async () => {
  dueNotes.value = await notes.getDueNotes()
  loadingNotes.value = false
})

async function handleNoteReviewed(noteId: string, correctnesses: NoteState) {
  const { readingCorrectness, meaningCorrectness } = correctnesses
  // If both are correct, then plus 1
  const overallCorrectness =
    readingCorrectness + meaningCorrectness === 0
      ? -1
      : Math.min(1, readingCorrectness + meaningCorrectness)
  await notes.progressNote(noteId, overallCorrectness)
}

function handleAllNotesReviewed() {
  // console.log('handleAllNotesReviewed')
  reviewing.value = false
  dueNotes.value = []
}
</script>

<template>
  <div v-if="loadingNotes" class="narrow-page">Loading...</div>
  <ReviewLanding
    v-else-if="!reviewing"
    class="narrow-page"
    :notes="dueNotes"
    @start-reviews="reviewing = true"
  />
  <NoteReviewer
    v-else
    :notes="dueNotes"
    @finished-note="handleNoteReviewed"
    @finished-reviews="handleAllNotesReviewed"
  />
</template>
