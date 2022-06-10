<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUser } from '../stores/useUser'
import NoteCreationModal from '../components/NoteCreationModal.vue';

const user = useUser()

const showNoteModal = ref(false)
</script>

<template>
  <div class="narrow-page">
    <RouterLink to="/" class="button is-primary mx-1">Home</RouterLink>
    <RouterLink
      v-show="!user.isAuthenticated"
      to="/login"
      class="button is-success mx-1"
    >
      Login
    </RouterLink>
    <a
      v-show="user.isAuthenticated"
      @click="user.logout()"
      class="button is-success mx-1"
    >
      Logout
    </a>
    <a
      v-show="user.isAuthenticated"
      @click="showNoteModal = true"
      class="button is-link mx-1"
    >
      New Note
    </a>
    <RouterLink to="/review" class="button is-warning mx-1">Review</RouterLink>
  </div>
  <NoteCreationModal v-model:show="showNoteModal" />
</template>
