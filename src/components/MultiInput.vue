<script lang="ts" setup>
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits(['update:modelValue'])
const updateModelValue = (at: number, value: string) => {
  emit(
    'update:modelValue',
    props.modelValue.map((v, i) => (i === at ? value : v))
  )
}
const addAdditionalValue = () => {
  emit('update:modelValue', [...props.modelValue, ''])
}
</script>

<template>
  <input
    v-for="(value, index) in modelValue"
    class="input my-1"
    :key="index"
    :value="value"
    @change="updateModelValue(index, ($event.target as HTMLInputElement).value)"
  />
  <button class="button" @click="addAdditionalValue">Add</button>
</template>
