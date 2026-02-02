<template>
  <div v-if="visible" class="loading-overlay">
    <template v-if="!fakeLoading">
      <div class="spinner"></div>
      <p v-html="message"></p>
    </template>
  </div>
</template>

<script>
export default {
  name: "LoadingOverlay",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      default: "Loading...",
    },
    fakeLoading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
