<template>
  <div v-if="visible" class="loading-overlay">
    <slot>
      <div v-if="!fakeLoading" class="spinner"></div>
      <p v-if="!fakeLoading && message" v-html="message"></p>
    </slot>
  </div>
</template>

<script>
export default {
  name: "LoadingOverlay",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    fakeLoading: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ""
    }
  }
};
</script>
