<script setup>
const props = defineProps({
  delay: {
    type: Number,
    default: 500,
  },
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <q-tooltip
    anchor="top middle"
    self="bottom middle"
    :offset="[10, 10]"
    :delay="props.delay"
    style="background: #888888aa"
  >
    {{ props.msg }}
  </q-tooltip>
</template>

<style scoped></style>
