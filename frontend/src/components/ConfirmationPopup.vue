<template>
  <div v-if="show" class="popup-overlay" @click.self="$emit('close')">
    <div
      class="popup-container confirmation-popup"
      :style="{
        height: height + 'px',
        width: width + 'px'
      }"
    >
      <div class="popup-header">
        <img
          v-if="icon"
          :src="icon"
          alt="Confirmation"
          width="42"
          height="42"
          style="display: block; margin-right: 10px"
        />
        <span class="popup-title">{{ title }}</span>
        <button class="popup-close-button" @click="$emit('close')">
          &times;
        </button>
      </div>
      <div class="popup-body">
        <div v-if="description" v-html="description"></div>
        <div v-if="list && list.length > 0" class="popup-scrollable-content">
          <div class="popup-scrollable-content-inner">
            <ol style="padding-left: 25px">
              <li v-for="item in list" :key="item.barcode || item">
                <span style="font-weight: bold">{{ item.barcode }}</span>
                <span v-if="item.name">{{ " - " + item.name }}</span>
              </li>
            </ol>
          </div>
        </div>
        <slot></slot>
      </div>
      <div class="popup-footer">
        <button
          ref="yesButton"
          class="popup-button yes-button"
          @click="$emit('yes')"
        >
          {{ yesButtonText }}
        </button>
        <button class="popup-button secondary" @click="$emit('no')">
          {{ noButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ConfirmationPopup",
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: "Are you sure?" },
    description: { type: String, default: "" },
    list: { type: Array, default: () => [] },
    icon: { type: String, default: "" },
    yesButtonText: { type: String, default: "Confirm" },
    noButtonText: { type: String, default: "Cancel" },
    height: { type: Number, default: 240 },
    width: { type: Number, default: 680 }
  },
  emits: ["close", "yes", "no"],
  watch: {
    show(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.yesButton?.focus();
        });
      }
    }
  }
};
</script>
