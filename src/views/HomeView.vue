<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUser, type UserStats } from '../stores/useUser'
import TimelineChart from '../components/TimelineChart.vue'
import LevelDistributionChart from '../components/LevelDistributionChart.vue'
import NoteCreationModal from '../components/NoteCreationModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = useUser()
const showNoteModal = ref(false)
const loadingUserStats = ref(true)
const userStats = ref<UserStats | null>(null)

onMounted(async () => {
  userStats.value = await user.getStats()
  loadingUserStats.value = false
})

user.$subscribe(() => {
  if (!user.isAuthenticated) {
    // redirect to login
    router.push('/login')
  }
})
</script>

<template>
  <nav class="navbar px-5" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <span class="navbar-item">
        <img src="../assets/logo.png" width="112" height="28">
      </span>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <a class="button is-primary" @click="user.logout()">Log out</a>
        </div>
      </div>
    </div>
  </nav>
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
    <div class="my-5">
      <a @click="showNoteModal = true" class="button is-link mx-1 is-large">
        New Note
      </a>
      <RouterLink to="/review" class="button is-warning mx-1 is-large">
        Review
      </RouterLink>
    </div>
    <div class="box">
      <h1 class="title is-4 my-4">Upcoming Reviews</h1>
      <TimelineChart v-if="userStats" :timeline="userStats?.timeline" />
      <div v-else class="has-text-centered">
        <p>Loading...</p>
      </div>

      <h1 class="title is-4 my-4">Level Distribution</h1>
      <LevelDistributionChart
        v-if="userStats"
        :notes-per-level="userStats?.notesPerLevel"
      />
      <div v-else class="has-text-centered">
        <p>Loading...</p>
      </div>
    </div>
  </div>
  <NoteCreationModal v-model:show="showNoteModal" />
</template>
