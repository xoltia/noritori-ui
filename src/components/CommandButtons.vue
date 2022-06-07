<script lang="ts">
export interface Command {
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
  disabled?: boolean
}
</script>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  commands: Command[]
  disabled: boolean
}>()

onMounted(() => {
  window.addEventListener('keydown', commandListener)
})

onUnmounted(() => {
  window.removeEventListener('keydown', commandListener)
})

function commandListener(e: KeyboardEvent) {
  if (props.disabled) {
    return
  }
  const command = props.commands.find((c) => c.key === e.key)
  if (command) {
    e.preventDefault()
    command.action()
  }
}
</script>

<template>
  <div class="section has-text-centered">
    <button
      v-for="command in commands"
      :key="command.key"
      @click="command.action"
      :disabled="disabled || !!command.disabled"
      :class="['button', 'm-2', command.color ? 'is-' + command.color : '']"
    >
      {{ command.name }}&nbsp;
      <small>[{{ command.key }}]</small>
    </button>
  </div>
</template>
