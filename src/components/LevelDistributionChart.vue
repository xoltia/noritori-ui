<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

const props = defineProps<{
  notesPerLevel: number[]
}>()

const colors = [
  '#ba8cff',
  '#9450fa',
  '#7e2df7',
  '#38008c',
  '#f74d4d',
  '#bf0404',
  '#f5e105',
  '#0595f5',
  '#000000',
]

const labels = [
  'Apprentice I',
  'Apprentice II',
  'Apprentice III',
  'Apprentice IV',
  'Guru I',
  'Guru II',
  'Master',
  'Enlightened',
  'Burned',
]

const chartDatasets = computed(() => {
  return [{ backgroundColor: colors, data: props.notesPerLevel }]
})

const chartData = computed(() => {
  return {
    labels,
    datasets: chartDatasets.value,
  }
})

const chartOptions = {
  title: 'Level Distribution',
  aspectRatio: 2,
  tooltips: {
    enabled: true,
  },
}
</script>

<template>
  <div
    class="is-flex justify-center"
    style="flex-direction: column; align-items: center"
  >
    <Pie :chart-data="chartData" :chart-options="chartOptions" />
  </div>
</template>
