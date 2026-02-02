<template>
  <div class="search-bar">
    <input
      ref="searchInput"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      @keyup.enter="$emit('search')"
    />
    <font-awesome-icon
      icon="fa-solid fa-magnifying-glass"
      style="color: darkgrey; cursor: pointer"
      @click="$emit('search')"
    />
  </div>
</template>

<script>
export default {
  name: "SearchBar",
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: "Search"
    }
  },
  emits: ["update:modelValue", "search"],
  methods: {
    focus() {
      this.$refs.searchInput.focus();
    }
  }
};
</script>
