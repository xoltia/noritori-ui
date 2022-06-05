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
import { computed, watch, ref, reactive, onMounted, onUnmounted } from 'vue'
import type { Note } from '../stores/useNotes'
import * as wanakana from 'wanakana'

// Enum to define the different review types
enum ReviewType {
  Meaning = 'meaning',
  Reading = 'reading',
}

interface Command {
  action(): void
  name: string
  key: string
  color?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'light'
    | 'dark'
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
// const showingReading = computed(() => currentPart.value === ReviewType.Reading)
const hasTags = computed(
  () => currentNote.value && currentNote.value?.tags?.length > 0
)
const hasExampleSetences = computed(
  () => currentNote.value && currentNote.value?.exampleSentences?.length > 0
)
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

onMounted(() => {
  // when the current note part being reviewed changes, check if it needs wanakana input (is the reading part)
  watch(currentPart, (part) => {
    const inputElement = document.getElementById('reading-input')
    if (!inputElement || !(inputElement instanceof HTMLInputElement)) {
      throw new Error('Could not find input element')
    }

    if (part === 'reading') {
      wanakana.bind(inputElement)
    } else {
      wanakana.unbind(inputElement)
    }

    inputElement.focus()
  })

  window.addEventListener('keydown', commandListener)
})

onUnmounted(() => {
  window.removeEventListener('keydown', commandListener)
})

function resetState() {
  answer.value = ''
  currentCorrectness.value = Correctness.Unanswered
  showNoteProperties.value = false
}

function commandListener(e: KeyboardEvent) {
  if (!commandsAreAvailable.value) {
    return
  }
  const command = postAnswerCommands.find((c) => c.key === e.key)
  if (command) {
    e.preventDefault()
    command.action()
  }
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
  <div :class="['hero', showingMeaning ? 'is-primary' : 'is-link']">
    <div class="hero-body has-text-centered" style="padding: 100px">
      <h1 class="title" style="font-size: 80px">{{ currentNote?.text }}</h1>
      <p class="subtitle">
        {{ showingMeaning ? 'Meaning' : 'Reading' }}
      </p>
    </div>
  </div>
  <div class="container is-fullhd p-2">
    <input
      type="text"
      class="box answer-input mx-auto mt-2"
      id="reading-input"
      placeholder="答え"
      v-model.lazy="answer"
      :disabled="currentCorrectness !== Correctness.Unanswered"
      :class="{
        'has-background-danger': currentCorrectness === Correctness.Incorrect,
        'has-background-success': currentCorrectness === Correctness.Correct,
        'has-text-light': currentCorrectness !== Correctness.Unanswered,
      }"
      @keyup.enter="updateCorrectness()"
      autocomplete="off"
    />
    <div class="columns px-5 box" v-show="showNoteProperties">
      <div class="column is-one-quarter">
        <h5 class="title is-5">
          {{ showingMeaning ? 'Meanings' : 'Readings' }}
        </h5>
        <p class="subtitle">
          {{
            (showingMeaning
              ? currentNote?.meanings
              : currentNote?.readings
            )?.join('; ')
          }}
        </p>
        <div v-show="hasTags">
          <h5 class="title is-5 mt-1">Tags</h5>
          <div class="subtitle">
            <span v-for="(tag, index) in currentNote?.tags" :key="index">
              <span class="tag is-primary">{{ tag }}</span>
            </span>
          </div>
        </div>
      </div>
      <div class="column">
        <h5 class="title is-5" v-show="!!currentNote?.description">
          Explanation
        </h5>
        <p class="subtitle" v-show="!!currentNote?.description">
          {{ currentNote?.description }}
        </p>
        <div v-show="hasExampleSetences">
          <h5
            class="title is-5 mb-2"
            v-show="
              !!currentNote?.exampleSentences &&
              currentNote?.exampleSentences.length > 0
            "
          >
            Example Sentences
          </h5>
          <ul>
            <li
              v-for="(sentence, index) in currentNote?.exampleSentences"
              :key="index"
              class="my-1"
            >
              {{ index + 1 }}. {{ sentence }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="section has-text-centered" v-show="commandsAreAvailable">
      <button
        v-for="command in postAnswerCommands"
        :key="command.key"
        @click="command.action"
        :class="['button', 'm-2', command.color ? 'is-' + command.color : '']"
      >
        {{ command.name }}&nbsp;
        <small>[{{ command.key }}]</small>
      </button>
    </div>
  </div>
</template>

<style scoped>
.answer-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1.5rem;
  padding: 1rem;
  text-align: center;
}
</style>