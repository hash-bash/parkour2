<template>
  <div v-if="visible" class="popup-overlay" @mousedown.self="cancel">
    <div
      class="popup-container confirmation-popup"
      :style="{
        height: height ? height + 'px' : 'auto',
        width: width ? width + 'px' : '680px'
      }"
    >
      <div class="popup-header">
        <img
          :src="iconConfirmationAlert"
          alt="Confirmation"
          width="42"
          height="42"
          style="display: block"
        />
        <span class="popup-title">{{ title }}</span>
        <button class="popup-close-button" @click="cancel">
          &times;
        </button>
      </div>
      <div class="popup-body">
        <div v-html="description"></div>
        <div
          v-if="list && list.length > 0"
          class="popup-scrollable-content"
        >
          <div class="popup-scrollable-content-inner">
            <ol style="padding-left: 25px">
              <li v-for="(item, index) in list" :key="index">
                <span style="font-weight: bold">{{ item.barcode }}</span>
                <span>{{ " - " + item.name }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
      <div class="popup-footer">
        <button class="popup-button yes-button" ref="confirmBtn" @click="confirm">
          Confirm
        </button>
        <button class="popup-button secondary" @click="cancel">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import iconConfirmationAlert from "../../assets/icons/alert_confirmation.svg";

export default {
  name: "ConfirmationPopup",
  props: {
    visible: { type: Boolean, required: true },
    title: { type: String, default: "Are you sure?" },
    description: { type: String, default: "" },
    list: { type: Array, default: () => [] },
    height: { type: Number, default: 240 },
    width: { type: Number, default: 680 },
  },
  data() {
    return {
      iconConfirmationAlert,
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.confirmBtn?.focus();
        });
      }
    }
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
    },
  },
};
</script>
