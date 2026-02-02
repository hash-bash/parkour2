<template>
  <div class="button-popup-wrapper" v-click-outside="closePopup">
    <button
      class="header-button"
      id="toggleSelectColumnsButton"
      @click="togglePopup"
    >
      <font-awesome-icon icon="fa-solid fa-columns" style="color: white" />
      <span> Select Columns </span>
    </button>
    <div
      v-if="show"
      class="button-popup-container"
      style="
        left: -50px;
        width: 250px;
        max-height: 473px;
        display: flex;
        flex-direction: column;
        padding: 10px 10px 5px 10px;
      "
    >
      <ul
        style="
          padding: 5px 7px 7px;
          margin: 0;
          flex-grow: 1;
          overflow-y: auto;
        "
      >
        <li
          v-for="(column, index) in columns"
          :key="index"
          style="list-style: none"
        >
          <template
            v-if="
              column.field !== 'selected' ||
              (column.field === 'selected' && column.visible == false)
            "
          >
            <label
              :style="{
                backgroundColor: column.columns ? '#33333310' : 'white',
                cursor: column.columns ? 'default' : 'pointer'
              }"
            >
              <input
                v-if="!column.columns"
                type="checkbox"
                v-model="column.visible"
                @change="onColumnChange(column)"
              />
              <font-awesome-icon
                v-if="column.columns"
                icon="fa-solid fa-caret-down"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 2px solid black;
                  height: 18px;
                  width: 18px;
                  border-radius: 4px;
                  text-align: center;
                  background-color: orange;
                  color: white;
                "
              />
              <span>{{ column.title }}</span>
            </label>
            <ul v-if="column.columns" style="padding-left: 0px">
              <li
                v-for="(subColumn, subIndex) in column.columns"
                :key="subIndex"
                style="list-style: none"
              >
                <label>
                  <input
                    type="checkbox"
                    style="width: 20px !important"
                    :checked="subColumn.visible"
                    @change="
                      subColumn.visible = !subColumn.visible;
                      onColumnChange(subColumn);
                    "
                  />
                  <span style="width: 100%">{{ subColumn.title }}</span>
                </label>
              </li>
            </ul>
          </template>
        </li>
      </ul>
      <div
        style="
          padding-top: 8px;
          border-top: 1px solid #eee;
          display: flex;
          flex-direction: column;
        "
      >
        <button @click="$emit('reset-visibility')" class="reset-button">
          Reset Visibility Settings
        </button>
        <button
          style="margin-bottom: 5px"
          @click="$emit('reset-widths')"
          class="reset-button"
        >
          Reset Width Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ColumnSelector",
  props: {
    columns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      show: false
    };
  },
  emits: [
    "update:columns",
    "toggle-visibility",
    "reset-visibility",
    "reset-widths"
  ],
  methods: {
    togglePopup() {
      this.show = !this.show;
    },
    closePopup() {
      this.show = false;
    },
    onColumnChange(column) {
      this.$emit("toggle-visibility", column);
    }
  },
  directives: {
    clickOutside: {
      mounted(el, binding) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event, el);
          }
        };
        document.body.addEventListener("click", el.clickOutsideEvent);
      },
      unmounted(el) {
        document.body.removeEventListener("click", el.clickOutsideEvent);
      }
    }
  }
};
</script>
