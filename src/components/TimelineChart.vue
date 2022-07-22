<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserStats } from '../stores/useUser'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(BarElement, Title, Legend, CategoryScale, LinearScale)

const props = defineProps<{
  timeline: UserStats['timeline']
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
]

const chartOptions = {
  title: 'Upcoming Reviews',
  scales: {
    y: {
      stacked: true,
    },
    x: {
      stacked: true,
    },
  },
  aspectRatio: 2,
}

const timeframe = ref(12)

const chartLabels = computed(() => {
  return range(0, timeframe.value).map((i) => hoursToReadable(i))
})

const chartDatasets = computed(() => {
  const timeline = props.timeline.slice(0, timeframe.value) ?? []
  const numLevels = timeline[0]?.length ?? 0
  const datasets = []

  for (let i = 0; i < numLevels; i++) {
    const dataset = {
      backgroundColor: colors[i],
      data: timeline.map((t) => t[i] ?? 0),
      label: labels[i],
    }
    datasets.push(dataset)
  }

  return datasets
})

const chartData = computed(() => {
  return {
    labels: chartLabels.value,
    datasets: chartDatasets.value,
  }
})

function range(start: number, end: number) {
  return Array.from({ length: end - start }, (_, i) => i + start)
}

function hoursToReadable(hours: number) {
  const hoursInDay = 24
  const days = Math.floor(hours / hoursInDay)
  const hoursLeft = hours % hoursInDay

  if (hours === 0) {
    return 'Due'
  }

  if (days === 0) {
    return `${hoursLeft}H`
  } else if (hoursLeft === 0) {
    return `${days}D`
  } else {
    return `${days}D:${hoursLeft}H`
  }
}
</script>

<template>
  <div
    class="is-flex justify-center"
    style="flex-direction: column; align-items: center"
  >
    <Bar :chart-data="chartData" :chart-options="chartOptions" />
    <input
      type="range"
      min="6"
      :max="24 * 7"
      v-model="timeframe"
      class="slider"
      step="1"
    />
  </div>
</template>
