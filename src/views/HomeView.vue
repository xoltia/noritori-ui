<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUser, type UserStats } from '../stores/useUser'
import TimelineChart from '../components/TimelineChart.vue'
import NoteCreationModal from '../components/NoteCreationModal.vue'

const user = useUser()
const showNoteModal = ref(false)
const loadingUserStats = ref(true)
const userStats = ref<UserStats | null>(null)

onMounted(async () => {
  userStats.value = await user.getStats()
  loadingUserStats.value = false
})
</script>

<template>
  <div class="narrow-page has-text-centered">
    <div class="level box">
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Total Notes</p>
          <p class="title">{{ userStats?.notes }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Due Notes</p>
          <p class="title">{{ userStats?.dueNotes }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Burned notes</p>
          <p class="title">{{ userStats?.burnedNotes }}</p>
        </div>
      </div>
    </div>
    <div class="box">
      <h1 class="title is-4 my-4">Upcoming Reviews</h1>
      <TimelineChart v-if="userStats" :timeline="userStats?.timeline" />
      <div v-else class="has-text-centered">
        <p>Loading...</p>
      </div>
    </div>

    <div class="mt-5">
      <a
        v-show="user.isAuthenticated"
        @click="showNoteModal = true"
        class="button is-link mx-1 is-large"
      >
        New Note
      </a>
      <RouterLink to="/review" class="button is-warning mx-1 is-large">
        Review
      </RouterLink>
    </div>
  </div>
  <NoteCreationModal v-model:show="showNoteModal" />
</template>
