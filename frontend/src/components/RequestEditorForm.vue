<template>
  <section class="request-form-panel" :class="{ collapsed: isCollapsed }">
    <div class="request-form-actions">
      <div class="controls-group" :class="{ 'view-only': isEditMode }">
        <label
          class="record-type-switch"
          title="Switch between Library and Sample entry modes"
        >
          <input
            type="checkbox"
            :checked="mode === 'sample'"
            :disabled="!canEdit"
            @change="$emit('switch-mode', $event)"
          />
          <span class="slider">
            <span class="option" :class="{ active: mode === 'library' }">
              Library
            </span>
            <span class="option" :class="{ active: mode === 'sample' }">
              Sample
            </span>
          </span>
        </label>
      </div>
      <div v-if="mode === 'sample' && !isEditMode" class="download-buttons">
        <a
          class="download-button"
          :href="gmoFormUrl"
          target="_blank"
          rel="noopener"
          title="Download Formblatt S1 (GMO)"
        >
          <font-awesome-icon icon="fa-solid fa-download" />
          <span>Formblatt S1</span>
        </a>
        <a
          class="download-button"
          :href="relacsDownloadUrl"
          target="_blank"
          rel="noopener"
          title="Download RELACS Pellets Abs form"
        >
          <font-awesome-icon icon="fa-solid fa-download" />
          <span>RELACS Pellets Abs</span>
        </a>
      </div>
    </div>

    <label class="field-block">
      <span> Cost Unit<span v-if="!isStaffUser" class="required">*</span> </span>
      <select
        :value="modelValue.cost_unit"
        @input="updateField('cost_unit', $event.target.value)"
        :disabled="!canEdit"
        :class="[
          costUnitError ? 'input-error' : '',
          !modelValue.cost_unit ? 'placeholder' : '',
        ]"
      >
        <option value="" disabled>Select Cost Unit</option>
        <option v-for="cu in costUnits" :key="cu.id" :value="cu.id">
          {{ cu.name }}
        </option>
      </select>
      <div v-if="costUnitError" class="field-error">
        {{ costUnitError }}
      </div>
    </label>

    <label class="field-block">
      <span> Description<span class="required">*</span> </span>
      <textarea
        :value="modelValue.description"
        @input="updateField('description', $event.target.value)"
        class="description-textarea"
        rows="6"
        :placeholder="
          isEditMode
            ? 'Description not provided'
            : 'Provide a brief description of your project, including any details important for handling and documentation. Indicate whether you have a backup of your study material (Yes/No).'
        "
        :class="{ 'input-error': descriptionError }"
        :readonly="!canEdit"
      ></textarea>
      <div v-if="descriptionError" class="field-error">
        {{ descriptionError }}
      </div>
    </label>

    <slot name="files"></slot>
  </section>
</template>

<script>
export default {
  name: "RequestEditorForm",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    costUnits: {
      type: Array,
      default: () => [],
    },
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
    isStaffUser: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "library",
    },
    costUnitError: String,
    descriptionError: String,
    gmoFormUrl: String,
    relacsDownloadUrl: String,
  },
  emits: ["update:modelValue", "switch-mode"],
  methods: {
    updateField(field, value) {
      this.$emit("update:modelValue", { ...this.modelValue, [field]: value });
    },
  },
};
</script>
