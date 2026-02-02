<template>
  <div
    v-if="show"
    class="popup-overlay"
    @click.self="close"
    @dragover.prevent="isDragOver = true"
    @drop.prevent="handleDrop"
    @dragenter.prevent="isDragOver = true"
    @dragleave="handleDragLeave"
    :class="{ 'drag-over': isDragOver && isStaffUser }"
  >
    <!-- Drag Drop Indicator -->
    <div v-if="isStaffUser" class="drag-drop-indicator">
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        "
      >
        <p>
          Drop <span style="font-weight: bold">XLSX file</span> here to upload
          as <span style="font-weight: bold">template</span>
        </p>
      </div>
    </div>

    <div
      v-if="!isDragOver"
      class="popup-container export-popup"
      :style="{ width: '670px', height: '500px' }"
    >
      <div class="popup-header">
        <span class="popup-title">Export Options</span>
        <span
          class="popup-info-button"
          @mouseover="showHelp = true"
          @mouseleave="showHelp = false"
        >
          ?
          <div v-if="showHelp" class="tooltip-box">
            <span style="font-weight: bold">INSTRUCTIONS:</span>
            <ol>
              <li>
                To create custom templates, export the original sheet named
                <span style="font-weight: bold">'Parkour'</span> by selecting
                the
                <span style="font-weight: bold"
                  >'Export without any additional sheets'</span
                >
                option.
              </li>
              <li>
                Add new custom sheets to this exported file, which will serve as
                templates.
              </li>
              <li>
                Upload the modified file, containing both the original
                <span style="font-weight: bold">'Parkour'</span> sheet and newly
                added <span style="font-weight: bold">custom sheets</span>.
                After uploading the file will appear in the list.
              </li>
              <li>
                The template is now ready! When you select this modified file
                from the list, the system will replace the
                <span style="font-weight: bold">'Parkour'</span> sheet with
                updated data while keeping all additional sheets intact.
              </li>
            </ol>
          </div>
        </span>
        <button class="popup-close-button" @click="close">&times;</button>
      </div>
      <div class="popup-body">
        <div class="export-section">
          <div style="font-weight: bold; margin-bottom: 8px">
            Export Options:
          </div>
          <div class="export-selection-radio-option">
            <input
              type="radio"
              id="export-selected"
              value="selected"
              v-model="internalExportSelection"
              :disabled="!hasSelectedRows"
            />
            <label
              for="export-selected"
              :class="{ disabled: !hasSelectedRows }"
            >
              Export selected libraries & samples
            </label>
          </div>
          <div class="export-selection-radio-option">
            <input
              type="radio"
              id="export-all"
              value="all"
              v-model="internalExportSelection"
            />
            <label for="export-all"> Export all libraries & samples </label>
          </div>
        </div>

        <div class="export-section" style="height: 100%">
          <div style="font-weight: bold; margin-bottom: 8px">
            Upload additional excel sheet templates to append:
          </div>

          <div
            v-if="isStaffUser"
            class="file-list-section"
            style="height: 280px"
          >
            <div class="file-item">
              <div class="file-info">
                <img
                  :src="iconTemplate"
                  alt="Export without any additional sheets"
                  width="24"
                  height="24"
                  style="display: block"
                />
                <span>Export without any additional sheets</span>
              </div>
              <div class="file-actions">
                <div
                  class="file-actions-radio-button"
                  style="border: none; margin-right: 5px"
                >
                  <input
                    type="radio"
                    title="Select"
                    id="without-file"
                    value="without-file"
                    v-model="selectedFile"
                  />
                </div>
              </div>
            </div>

            <div
              v-for="(file, index) in templates"
              :key="index"
              class="file-item"
            >
              <div class="file-info">
                <img
                  :src="iconTemplateLines"
                  :alt="file.name"
                  width="24"
                  height="24"
                  style="display: block"
                />
                <span>{{ file.name }}</span>
              </div>
              <div class="file-actions">
                <button
                  @click="$emit('download-template', file)"
                  class="download-button"
                  title="Download Original File"
                >
                  <img
                    :src="iconDownload"
                    alt="Download"
                    width="24"
                    height="24"
                    style="display: block"
                  />
                </button>
                <button
                  @click="$emit('remove-template', index)"
                  class="remove-button"
                  title="Remove File"
                >
                  <img
                    :src="iconRemove"
                    alt="Remove"
                    width="24"
                    height="24"
                    style="display: block"
                  />
                </button>
                <div class="file-actions-radio-button">
                  <input
                    type="radio"
                    title="Select File"
                    :id="'file-radio-' + index"
                    :value="file"
                    v-model="selectedFile"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p style="margin: 0; color: #666">
              Additional templates and uploads are limited to staff members.
            </p>
          </div>
        </div>
      </div>
      <div class="popup-footer">
        <div v-if="isStaffUser" class="file-upload-section">
          <label
            for="file-upload"
            class="file-upload-label"
            title="Upload additional sheet to append to the exported sheet."
          >
            <img
              :src="iconUpload"
              alt="Upload"
              width="24"
              height="24"
              style="display: block; margin-right: 4px"
            />
            <span>Upload</span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx"
            @change="handleFileUpload"
            style="display: none"
          />
        </div>
        <button class="popup-button yes-button" @click="handleExport">
          OK
        </button>
        <button class="popup-button" @click="close">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import iconTemplate from "../assets/icons/export_template.svg";
import iconTemplateLines from "../assets/icons/export_template_lines.svg";
import iconDownload from "../assets/icons/export_download.svg";
import iconRemove from "../assets/icons/export_remove.svg";
import iconUpload from "../assets/icons/export_upload.svg";

export default {
  name: "ExportPopup",
  props: {
    show: Boolean,
    templates: Array,
    hasSelectedRows: Boolean,
    isStaffUser: {
      type: Boolean,
      default: true
    },
    initialExportSelection: {
      type: String,
      default: "selected"
    }
  },
  data() {
    return {
      internalExportSelection: this.initialExportSelection,
      selectedFile: "without-file",
      isDragOver: false,
      showHelp: false,
      iconTemplate,
      iconTemplateLines,
      iconDownload,
      iconRemove,
      iconUpload
    };
  },
  watch: {
    initialExportSelection(val) {
      this.internalExportSelection = val;
    },
    show(val) {
      if (!val) {
        this.isDragOver = false;
        this.showHelp = false;
      } else {
        if (!this.hasSelectedRows) {
          this.internalExportSelection = "all";
        } else {
          this.internalExportSelection = "selected";
        }
        this.selectedFile = "without-file";
      }
    }
  },
  emits: ["close", "export", "upload", "download-template", "remove-template"],
  methods: {
    close() {
      this.$emit("close");
    },
    handleExport() {
      this.$emit("export", {
        selection: this.internalExportSelection,
        template: this.selectedFile
      });
    },
    handleFileUpload(event) {
      if (event.target.files && event.target.files.length > 0) {
        this.$emit("upload", event.target.files[0]);
      }
    },
    handleDrop(e) {
      this.isDragOver = false;
      if (!this.isStaffUser) return;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.$emit("upload", files[0]);
      }
    },
    handleDragLeave(e) {
      if (!this.isStaffUser) return;
      if (!e.currentTarget.contains(e.relatedTarget)) {
        this.isDragOver = false;
      }
    }
  }
};
</script>
