<script lang="ts" setup>
import { ref, computed } from 'vue'
import TagInput from './TagInput.vue'
import MultiInput from './MultiInput.vue'
import { useNotes, type Note } from '../stores/useNotes'

defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const notes = useNotes()
const creatingNote = ref(false)

const text = ref('')
const meanings = ref<string[]>([])
const readings = ref<string[]>([])
const tags = ref<string[]>([])
const sentences = ref<string[]>([])
const noteType = ref<'word' | 'kanji'>('word')

const canSubmit = computed(() => {
  return !!text.value && meanings.value.length > 0 && readings.value.length > 0
})

const reset = () => {
  text.value = ''
  meanings.value = []
  readings.value = []
  tags.value = []
  sentences.value = []
  noteType.value = 'word'
}

const close = () => {
  emit('update:show', false)
  reset()
}

const submit = async () => {
  if (!canSubmit.value) return

  const note = {
    text: text.value,
    meanings: meanings.value,
    readings: readings.value,
    tags: tags.value,
    exampleSentences: sentences.value,
    type: noteType.value,
  }

  creatingNote.value = true
  await notes.createNote(note)
  creatingNote.value = false
  reset()
}
</script>

<template>
  <div class="modal" :class="{ 'is-active': show }">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">New Note</p>
        <button class="delete" aria-label="close" @click="close"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Subject</label>
          <div class="control">
            <input v-model="text" type="text" class="input" />
          </div>
        </div>

        <div class="field">
          <label class="label">Meaning(s)</label>
          <div class="control">
            <TagInput v-model="meanings" placeholder="Meaning" split-char=";" />
          </div>
        </div>

        <div class="field">
          <label class="label">Reading(s)</label>
          <div class="control">
            <TagInput v-model="readings" placeholder="Reading" split-char=";" />
          </div>
        </div>

        <div class="field">
          <label class="label">Tags</label>
          <div class="control">
            <TagInput v-model="tags" placeholder="Tag" split-char=";" />
          </div>
        </div>

        <div class="field">
          <label class="label">Example Sentences</label>
          <div class="control">
            <MultiInput v-model="sentences" />
          </div>
        </div>

        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <textarea type="text" class="textarea"></textarea>
          </div>
        </div>

        <div class="field">
          <label class="label">Note Type</label>
          <div class="control">
            <label class="radio">
              <input type="radio" v-model="noteType" value="word" />
              Word
            </label>
            <label class="radio">
              <input type="radio" v-model="noteType" value="kanji" />
              Kanji
            </label>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-success"
          @click="submit"
          :disabled="creatingNote || !canSubmit"
        >
          Create
        </button>
        <button class="button" @click="close">Cancel</button>
      </footer>
    </div>
  </div>
</template>
