<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  splitChar?: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const currentValue = ref('')
const removeTag = (index: number) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index)
  )
}
const addCurrentValueAsMultiple = () => {
  if (!currentValue.value) return

  if (props.splitChar) {
    const values = currentValue.value.split(';').map((v) => v.trim())
    emit('update:modelValue', [...props.modelValue, ...values])
  } else {
    emit('update:modelValue', [...props.modelValue, currentValue.value])
  }

  currentValue.value = ''
}
</script>

<template>
  <div class="input tag-input-container">
    <div v-for="(tag, index) in modelValue" class="tag m-1" :key="index">
      {{ tag }}
      <i @click="removeTag(index)" class="delete is-small"></i>
    </div>
    <input
      class="tag-input m-1"
      type="text"
      :placeholder="placeholder || 'New Value'"
      v-model="currentValue"
      @keydown.enter="addCurrentValueAsMultiple"
    />
  </div>
</template>

<style scoped>
.tag-input-container {
  display: block;
  height: auto;
}

.tag-input {
  border: none;
  width: fit-content;
}
</style>
