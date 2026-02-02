<template>
  <div class="header">
    <div class="header-logo" style="display: inline; margin-right: 10px">
      <img
        :src="icon"
        :alt="title"
        width="42"
        height="42"
        style="display: block"
      />
    </div>
    <div class="header-title" style="display: inline">
      {{ title }}
    </div>
    <div class="sticky-actions" v-if="$slots.default">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewHeader",
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }
};
</script>
