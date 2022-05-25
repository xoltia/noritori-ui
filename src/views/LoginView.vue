<script setup lang="ts">
import { ref, computed } from '@vue/reactivity'
import { RouterLink, useRouter } from 'vue-router'
import { useUser } from '../stores/useUser'
import axios from 'axios'

const user = useUser()
const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const register = ref(false)

const usernameModified = computed(() => username.value.length > 0)
const passwordModified = computed(() => password.value.length > 0)
const confirmPasswordModified = computed(() => confirmPassword.value.length > 0)

const validUsername = computed(() => username.value.trim().length >= 3)
const validPassword = computed(() => password.value.trim().length >= 8)
const validConfirmPassword = computed(
  () =>
    confirmPassword.value.trim() === password.value.trim() || !register.value
)
const validRegistration = computed(
  () => validUsername.value && validPassword.value && validConfirmPassword.value
)

const error = ref('')
const loading = ref(false)

const submit = async () => {
  const submitFunction = register.value ? user.register : user.login
  loading.value = true
  try {
    await submitFunction(username.value, password.value)
    router.push('/')
  } catch (e) {
    if (!axios.isAxiosError(e) || !e.response || e.response.status >= 500) {
      error.value = 'An unexpected error occurred'
      return
    }

    const errorResponse = (e.response.data as { error?: string }).error
    if (errorResponse) {
      error.value = errorResponse
      return
    } else {
      error.value = 'An unexpected error occurred'
      return
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="box mt-6 mx-auto p-6" style="max-width: 500px">
    <img
      src="@/assets/logo.png"
      alt="Noritori"
      class="image mx-auto mb-6"
      width="350"
    />

    <div v-show="error" class="notification is-danger is-light">
      {{ error }}
    </div>

    <div class="field">
      <label class="label">Username</label>
      <div class="control">
        <input
          :class="{
            'is-danger': !validUsername && usernameModified,
          }"
          class="input"
          v-model="username"
          type="text"
          placeholder="Username"
        />
      </div>
    </div>

    <div class="field">
      <label class="label">Password</label>
      <div class="control">
        <input
          :class="{
            'is-danger': !validPassword && passwordModified,
          }"
          class="input"
          v-model="password"
          type="password"
          placeholder="Password"
        />
      </div>
    </div>

    <div class="field" v-show="register">
      <label class="label">Confirm Password</label>
      <div class="control">
        <input
          :class="{
            'is-danger': !validConfirmPassword && confirmPasswordModified,
          }"
          class="input"
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm Password"
        />
      </div>
    </div>

    <div class="field">
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="register" />
          Register
        </label>
      </div>
    </div>

    <button
      v-show="!loading"
      class="button is-primary is-fullwidth"
      :disabled="!validRegistration || loading"
      @click="submit"
    >
      {{ register ? 'Register' : 'Login' }}
    </button>
    <progress v-show="loading" class="progress is-small is-primary"></progress>
    <div class="mt-2 has-text-centered">
      <RouterLink to="/" class="is-link">Home</RouterLink>
    </div>
  </div>
</template>
