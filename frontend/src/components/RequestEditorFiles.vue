<template>
  <div class="files-section">
    <div class="files-header">
      <div>
        <span>Files</span>
        <small>Upload request related documents.</small>
      </div>
      <button
        v-if="canEdit"
        class="header-button ghost"
        type="button"
        :disabled="!canEdit"
        @click="triggerUpload"
      >
        <font-awesome-icon
          icon="fa-solid fa-square-plus"
          style="color: white"
        />
        <span>Add Files</span>
      </button>
      <input
        ref="fileInput"
        type="file"
        multiple
        @change="handleFileChange"
        style="display: none"
      />
    </div>
    <div class="files-table-wrapper">
      <table
        class="files-table"
        :class="{ 'files-table-empty': !files.length }"
      >
        <thead>
          <tr>
            <th style="width: 46%">Name</th>
            <th style="width: 27%">Size</th>
            <th style="width: 27%"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!files.length">
            <td colspan="3" class="empty-cell">No files uploaded yet.</td>
          </tr>
          <tr v-for="file in files" :key="file.id">
            <td class="file-name-cell">
              <span class="file-name-text" :title="file.name">{{
                file.name
              }}</span>
            </td>
            <td class="file-size-cell" :title="formatFileSize(file.size)">
              {{ formatFileSize(file.size) }}
            </td>
            <td class="actions-cell">
              <button
                type="button"
                class="icon-action"
                :title="
                  file.path ? `Download ${file.name}` : 'Download unavailable'
                "
                :disabled="!file.path"
                @click="$emit('download', file)"
              >
                <font-awesome-icon icon="fa-solid fa-download" />
              </button>
              <button
                v-if="canEdit"
                type="button"
                class="icon-action danger"
                :title="`Remove ${file.name}`"
                :disabled="!canEdit"
                @click="$emit('remove', file)"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "RequestEditorFiles",
  props: {
    files: {
      type: Array,
      default: () => [],
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["upload", "download", "remove"],
  methods: {
    triggerUpload() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const files = Array.from(event.target.files || []);
      this.$emit("upload", files);
      event.target.value = "";
    },
    formatFileSize(size) {
      if (size === undefined || size === null) return "-";
      const value = Number(size);
      if (Number.isNaN(value)) return "-";
      if (value >= 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
      }
      if (value >= 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
      }
      return `${value} B`;
    },
  },
};
</script>
