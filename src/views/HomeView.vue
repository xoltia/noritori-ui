<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useUser } from '../stores/useUser'

const user = useUser()
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
    <RouterLink to="/review" class="button is-warning mx-1">Review</RouterLink>
  </div>
</template>
