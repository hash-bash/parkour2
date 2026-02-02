<template>
  <div
    v-if="visible"
    class="popup-overlay"
    @dragover.prevent="handleDragOver"
    @drop="handleDrop"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    :class="{ 'drag-over': isDragOver }"
    @mousedown.self="close"
  >
    <div class="drag-drop-indicator">
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
      <!-- Header -->
      <div class="popup-header">
        <span class="popup-title">Export Options</span>
        <span
          class="popup-info-button"
          @mouseover="showExportHelpTooltip = true"
          @mouseleave="showExportHelpTooltip = false"
        >
            ?
            <div v-if="showExportHelpTooltip" class="tooltip-box">
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
                  Add new custom sheets to this exported file, which will serve
                  as templates.
                </li>
                <li>
                  Upload the modified file, containing both the original
                  <span style="font-weight: bold">'Parkour'</span> sheet and
                  newly added
                  <span style="font-weight: bold">custom sheets</span>. After
                  uploading the file will appear in the list.
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
        <button class="popup-close-button" @click="close">
          &times;
        </button>
      </div>

      <!-- Body -->
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
              :checked="exportSelection === 'selected'"
              @change="$emit('update:exportSelection', 'selected')"
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
              :checked="exportSelection === 'all'"
              @change="$emit('update:exportSelection', 'all')"
            />
            <label for="export-all"> Export all libraries & samples </label>
          </div>
        </div>
        <div class="export-section" style="height: 100%">
          <div style="font-weight: bold; margin-bottom: 8px">
            Upload additional excel sheet templates to append:
          </div>
          <div class="file-list-section">
            <div class="file-item">
              <div class="file-info">
                <img
                  :src="iconExportTemplateFile"
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
                    :checked="selectedFile === 'without-file'"
                    @change="updateSelectedFile('without-file')"
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
                  :src="iconExportTemplateFileLines"
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
                    :src="iconExportDownload"
                    alt="Download"
                    width="24"
                    height="24"
                    style="display: block"
                  />
                </button>
                <button
                  @click="$emit('remove-template', file.id)"
                  class="remove-button"
                  title="Remove File"
                >
                  <img
                    :src="iconExportRemove"
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
                    :checked="selectedFile === file"
                    @change="updateSelectedFile(file)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="popup-footer">
        <div class="file-upload-section">
          <label
            for="file-upload"
            class="file-upload-label"
            title="Upload additional sheet to append to the exported sheet."
          >
            <img
              :src="iconExportUpload"
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
            @change="onFileUpload"
            style="display: none"
          />
        </div>
        <button class="popup-button yes-button" @click="$emit('export')">
          OK
        </button>
        <button
          class="popup-button"
          @click="close"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import iconExportTemplateFile from "../../assets/icons/export_template.svg";
import iconExportTemplateFileLines from "../../assets/icons/export_template_lines.svg";
import iconExportDownload from "../../assets/icons/export_download.svg";
import iconExportRemove from "../../assets/icons/export_remove.svg";
import iconExportUpload from "../../assets/icons/export_upload.svg";
import { showNotification } from "../../utilities/notifications";

export default {
  name: "ExportPopup",
  props: {
    visible: { type: Boolean, required: true },
    templates: { type: Array, default: () => [] },
    selectedFile: { type: [String, Object], default: "without-file" },
    exportSelection: { type: String, default: "selected" },
    hasSelectedRows: { type: Boolean, default: false },
  },
  data() {
    return {
      iconExportTemplateFile,
      iconExportTemplateFileLines,
      iconExportDownload,
      iconExportRemove,
      iconExportUpload,
      showExportHelpTooltip: false,
      isDragOver: false,
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    updateSelectedFile(file) {
      this.$emit("update:selectedFile", file);
    },
    onFileUpload(event) {
       this.$emit("upload-template", event.target.files[0]);
    },
    handleDragOver(e) {
      e.preventDefault();
      this.isDragOver = true;
    },
    handleDragEnter(e) {
      e.preventDefault();
      this.isDragOver = true;
    },
    handleDragLeave(e) {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        this.isDragOver = false;
      }
    },
    handleDrop(e) {
      e.preventDefault();
      this.isDragOver = false;
      const files = e.dataTransfer.files;
      if (files.length > 1) {
        showNotification(
          "Please upload only one XLSX file at a time.",
          "error"
        );
      } else {
         this.$emit("upload-template", files[0]);
      }
    },
  },
};
</script>
