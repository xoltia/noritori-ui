<script lang="ts" setup>
defineProps<{
  subject: string
  subtitle: string
  backgroundColor: string
  totalPrompts: number
  totalAnsweredPrompts: number
  percentCorrect: number
}>()
</script>

<template>
  <div :class="['hero', 'is-medium', 'is-' + backgroundColor]">
    <div class="hero-head">
      <div class="level px-6 pt-2">
        <div class="level-left">
          <div class="level-item">
            <RouterLink to="/">
              <span class="icon is-large">
                <i class="fas fa-home fa-lg"></i>
              </span>
            </RouterLink>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <span class="has-text-weight-semibold">
              Answered: {{ totalAnsweredPrompts }}/{{ totalPrompts }}
            </span>
          </div>
          <div class="level-item">
            <span class="has-text-weight-semibold">
              Accuracy: {{ percentCorrect }}%
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="hero-body has-text-centered">
      <h1 class="title" style="font-size: 80px">{{ subject }}</h1>
      <p class="subtitle">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
