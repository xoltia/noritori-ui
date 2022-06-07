<script lang="ts">
// Enum containing the various state a card can have for a review type
export enum Correctness {
  Incorrect = -1,
  Unanswered = 0,
  Correct = 1,
}

// Represnetaiton of a given notes state
export type NoteState = {
  readingCorrectness: Correctness
  meaningCorrectness: Correctness
}
</script>

<script setup lang="ts">
import { computed, watch, ref, reactive } from 'vue'
import type { Note } from '../stores/useNotes'
import type { Command } from './CommandButtons.vue'
import NoteReviewHeader from './NoteReviewHeader.vue'
import NoteReviewInput from './NoteReviewInput.vue'
import NoteReviewDetails from './NoteReviewDetails.vue'
import CommandButtons from './CommandButtons.vue'

// Enum to define the different review types
enum ReviewType {
  Meaning = 'meaning',
  Reading = 'reading',
}

// Events that this component can emit
const emit = defineEmits<{
  (event: 'finished-note', id: string, finalState: NoteState): void
  (event: 'finished-reviews'): void
}>()

// Componenet props, all notes passed in are the notes to review
const props = defineProps<{
  notes: Note[]
}>()

const commandsAreAvailable = computed(
  () =>
    currentCorrectness.value !== Correctness.Unanswered &&
    currentNote.value !== null
)

// These commands are available once and answer has been input
const postAnswerCommands: Command[] = [
  {
    name: 'Next',
    key: 'Enter',
    action() {
      updateCurrentNoteState(currentCorrectness.value)
      resetState()
    },
    color: 'success',
  },
  {
    name: 'Undo',
    key: 'Backspace',
    action: resetState,
    color: 'warning',
  },
  {
    name: 'Explanation',
    key: 'Tab',
    action() {
      showNoteProperties.value = !showNoteProperties.value
    },
    color: 'info',
  },
]

// Map of note ids to their state
const noteStates = reactive(
  new Map<string, NoteState>(
    props.notes.map((note) => [
      note._id,
      {
        readingCorrectness: Correctness.Unanswered,
        meaningCorrectness: Correctness.Unanswered,
      },
    ])
  )
)

// Computed list of notes that are not yet answered
const unfinishedNotes = computed(() =>
  props.notes.filter(
    ({ _id: noteId }) =>
      noteStates.get(noteId)?.meaningCorrectness === Correctness.Unanswered ||
      noteStates.get(noteId)?.readingCorrectness === Correctness.Unanswered
  )
)

// Computed boolean indicating if all notes have been answered
const allNotesAnswered = computed(() => unfinishedNotes.value.length === 0)

const percentCorrect = computed(() => {
  const correctnesses = Array.from(noteStates.values())
  const numAnswered = correctnesses.reduce(
    (acc, { readingCorrectness, meaningCorrectness }) =>
      acc +
      (readingCorrectness !== Correctness.Unanswered ? 1 : 0) +
      (meaningCorrectness !== Correctness.Unanswered ? 1 : 0),
    0
  )
  const correctCount = correctnesses.reduce(
    (acc, { readingCorrectness, meaningCorrectness }) =>
      acc +
      (readingCorrectness === Correctness.Correct ? 1 : 0) +
      (meaningCorrectness === Correctness.Correct ? 1 : 0),
    0
  )
  if (numAnswered === 0) {
    return 0
  }
  return Math.round((correctCount / numAnswered) * 100)
})

const numPromptsAnswered = computed(() => {
  const correctnesses = Array.from(noteStates.values())
  return correctnesses.reduce(
    (acc, { readingCorrectness, meaningCorrectness }) =>
      acc +
      (readingCorrectness !== Correctness.Unanswered ? 1 : 0) +
      (meaningCorrectness !== Correctness.Unanswered ? 1 : 0),
    0
  )
})

const numTotalPrompts = computed(() => props.notes.length * 2)

// Computed value for current note, currently the first note in the list or null if there are no notes
const currentNote = computed(() =>
  !allNotesAnswered.value ? unfinishedNotes.value[0] : null
)

// Computed value for the current review type
const currentPart = computed(() => {
  // If there are no notes, return null
  if (!currentNote.value) {
    return null
  }

  // Get correctness state of the current note
  const answerState = getNoteState(currentNote.value)
  // If the note's meaning prompt has not been answered, return meaning
  if (answerState.meaningCorrectness === Correctness.Unanswered) {
    return ReviewType.Meaning
  }
  // Else return reading type
  else if (answerState.readingCorrectness === Correctness.Unanswered) {
    return ReviewType.Reading
  }

  // If both where answered, something has gone wrong in computing the current note
  throw new Error(
    'Unexpected error: fully answered note marked as current note'
  )
})

const showingMeaning = computed(() => currentPart.value === ReviewType.Meaning)
const answer = ref('')
const currentCorrectness = ref(Correctness.Unanswered)
const showNoteProperties = ref(false)

// Watch for all notes to be answered
watch(
  allNotesAnswered,
  (value) => {
    if (value) {
      emit('finished-reviews')
    }
  },
  { immediate: true }
)

function resetState() {
  answer.value = ''
  currentCorrectness.value = Correctness.Unanswered
  showNoteProperties.value = false
}

function getNoteState(note: Note): NoteState {
  // It should not be possible for a note to not have a state, since the only notes this component knows about are in the map
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return noteStates.get(note._id)!
}

function updateCurrentNoteState(correctness: Correctness) {
  // This should never be called if there are no notes
  if (!currentNote.value) {
    throw new Error('No current note')
  }

  // Update the current part of the current note
  const newNoteState = { ...getNoteState(currentNote.value) }
  if (currentPart.value === ReviewType.Meaning) {
    newNoteState.meaningCorrectness = correctness
  } else if (currentPart.value === ReviewType.Reading) {
    newNoteState.readingCorrectness = correctness
  }

  // If note is fully answered, emit event
  if (
    newNoteState.meaningCorrectness !== Correctness.Unanswered &&
    newNoteState.readingCorrectness !== Correctness.Unanswered
  ) {
    emit('finished-note', currentNote.value._id, newNoteState)
  }

  // Update the note state
  noteStates.set(currentNote.value._id, newNoteState)
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) {
    return b.length
  }

  if (b.length === 0) {
    return a.length
  }

  if (a[0] === b[0]) {
    return levenshteinDistance(a.slice(1), b.slice(1))
  }

  return (
    1 +
    Math.min(
      levenshteinDistance(a.slice(1), b),
      levenshteinDistance(a, b.slice(1)),
      levenshteinDistance(a.slice(1), b.slice(1))
    )
  )
}

async function updateCorrectness() {
  if (!currentNote.value) {
    throw new Error('No current note')
  }

  // This means the current note has already been answered, waiting for the user to press enter to continue
  if (currentCorrectness.value !== Correctness.Unanswered) {
    return
  }

  const currentReviewType = currentPart.value
  const answerIsCorrect =
    currentReviewType === ReviewType.Meaning
      ? currentNote.value.meanings.findIndex(
          (meaning) =>
            levenshteinDistance(
              meaning.toLowerCase(),
              answer.value.toLowerCase()
            ) <= Math.floor(meaning.length / 2)
        ) !== -1
      : currentNote.value.readings.includes(answer.value)

  // Give feedback, command handler will handle what to do next
  currentCorrectness.value = answerIsCorrect
    ? Correctness.Correct
    : Correctness.Incorrect
}
</script>

<template>
  <NoteReviewHeader
    :subject="currentNote?.text ?? ''"
    :subtitle="currentPart === 'meaning' ? 'Meaning' : 'Reading'"
    :total-answered-prompts="numPromptsAnswered"
    :total-prompts="numTotalPrompts"
    :percent-correct="percentCorrect"
    :background-color="showingMeaning ? 'primary' : 'link'"
  />
  <div class="container is-fullhd p-2">
    <NoteReviewInput
      v-model="answer"
      :correctness="currentCorrectness ?? Correctness.Unanswered"
      :useIME="currentPart === 'reading'"
      :onSubmit="updateCorrectness"
      class="mt-2"
    />
    <NoteReviewDetails
      v-show="showNoteProperties"
      :note="currentNote!"
      :show-meaning="showingMeaning"
    />
    <CommandButtons
      v-show="commandsAreAvailable"
      :commands="postAnswerCommands"
      :disabled="!commandsAreAvailable"
    />
  </div>
</template>
