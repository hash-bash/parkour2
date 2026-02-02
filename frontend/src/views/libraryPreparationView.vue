<template>
  <div class="parent-container">
    <!-- Loading overlay -->
    <LoadingOverlay :visible="loading || fakeLoading" :fakeLoading="fakeLoading">
      <div v-if="!fakeLoading" class="spinner"></div>
      <p v-if="!fakeLoading">
        Loading <span style="font-weight: bold">Library Preparation</span>...
      </p>
    </LoadingOverlay>

    <!-- Header -->
    <ViewHeader :icon="iconLibraryPrepHeader" title="Library Preparation">
      <SearchBar v-model="searchQuery" />

      <ColumnSelector
        :columns="columnsList"
        @toggle-visibility="toggleColumnVisibility"
        @reset-visibility="resetColumnVisibility"
        @reset-widths="resetColumnWidths"
      />

      <div class="button-popup-wrapper">
        <button class="header-button" @click="toggleGroups">
          <font-awesome-icon
            icon="fa-solid fa-layer-group"
            style="color: white"
          />
          <span> Toggle Views </span>
        </button>
      </div>
      <button
        class="header-button"
        id="openExportPopupButton"
        @click="handleExportClick"
      >
        <font-awesome-icon icon="fa-solid fa-file-excel" style="color: white" />
        <span> Export to Excel </span>
      </button>
    </ViewHeader>

    <!-- Main content section with table -->
    <div class="table-container">
      <TabulatorTable
        v-if="!loading"
        ref="tabulatorTableRef"
        :rowData="librariesSamplesList"
        :columnDefs="columnsList"
        groupBy="library_protocol_name"
        :groupSort="{ field: 'library_protocol_name', order: 'asc' }"
        :groupStartOpen="false"
        :tableOptions="{
          ...tableOptions,
          onBatchCellValueChanged,
          fakeLoadingStart,
          fakeLoadingStop,
          handleColumnResized,
          handleColumnVisibilityChanged
        }"
      />
    </div>

    <!-- Popup window -->
    <ConfirmationPopup
      :show="showPopupWindow"
      :title="popupContents.popupTitle"
      :description="popupContents.popupDescription"
      :list="popupContents.popupList"
      :icon="iconConfirmationAlert"
      :height="popupContents.popupHeight"
      :width="popupContents.popupWidth"
      yesButtonText="Yes"
      noButtonText="No"
      @yes="popupContents.onYes"
      @no="popupContents.onNo"
      @close="showPopupWindow = false"
    />

    <!-- Popup for Export Options -->
    <ExportPopup
      :show="showExportPopup"
      :templates="fetchedLibraryPreparationTemplates"
      :hasSelectedRows="true"
      :initialExportSelection="'selected'"
      :isStaffUser="true"
      @close="showExportPopup = false"
      @export="handleExportAction"
      @upload="handleFileUpload"
      @download-template="downloadExportTemplate"
      @remove-template="removeExportTemplate"
    />
  </div>
</template>

<script lang="jsx">
import TabulatorTable from "../components/TabulatorTable.vue";
import ViewHeader from "../components/ViewHeader.vue";
import LoadingOverlay from "../components/LoadingOverlay.vue";
import SearchBar from "../components/SearchBar.vue";
import ConfirmationPopup from "../components/ConfirmationPopup.vue";
import ExportPopup from "../components/ExportPopup.vue";
import ColumnSelector from "../components/ColumnSelector.vue";
import { saveAs } from "file-saver";
import {
  showNotification,
  handleError,
  createAxiosObject,
  urlStringStartsWith,
  createExcelExportBlob,
  loadColumnSettings,
  saveColumnSettings,
  resetColumnSettings
} from "../utilities/utilityFunctions";
import {
  libraryPreparationColumnDefs,
  libraryPreparationExportColumns,
  libraryPreparationGroupHeader
} from "../constants/libraryPreparationConsts";
import iconLibraryPrepHeader from "../assets/icons/header_library_prep.svg";
import iconConfirmationAlert from "../assets/icons/alert_confirmation.svg";

const axiosRef = createAxiosObject();
const urlStringStart = urlStringStartsWith();

export default {
  name: "LibraryPreparation",
  components: {
    TabulatorTable,
    ViewHeader,
    LoadingOverlay,
    SearchBar,
    ConfirmationPopup,
    ExportPopup,
    ColumnSelector
  },
  data() {
    return {
      iconLibraryPrepHeader,
      iconConfirmationAlert,
      tabulatorInstance: null,
      loading: true,
      fakeLoading: false,
      librariesSamplesList: [],
      columnsList: [],
      showPopupWindow: false,
      showExportPopup: false,
      fetchedLibraryPreparationTemplates: [],
      selectedFile: "without-file",
      pendingEditChanges: {},
      pendingEditTimer: null,
      isSavingEdits: false,
      popupContents: {
        popupTitle: "Are you sure?",
        popupDescription: "",
        popupList: [],
        onYes: null,
        onNo: null,
        popupHeight: 220,
        popupWidth: 600
      },
      tableOptions: {
        index: "barcode",
        placeholder: "No Libraries and Samples to show.",
        initialSort: [
          { column: "library_protocol_name", dir: "asc" },
          { column: "barcode", dir: "asc" },
          {
            column: "request_name",
            dir: "asc",
            sorter: (a, b) => {
              const getNum = (str) => {
                const match = String(str).match(/^(\d+)_/);
                return match ? parseInt(match[1], 10) : 0;
              };
              return getNum(a) - getNum(b);
            }
          }
        ],
        groupHeader: (value, count, data) => {
          return libraryPreparationGroupHeader(value, count);
        },
        getClearValueForField: (field) => {
          if (field === "smear_analysis") return 100;
          return "";
        },
        blockActionsOnDisabledCells: true
      },
      searchQuery: "",
      showSelectColumns: false
    };
  },
  mounted() {
    this.getLibrariesSamples();
    this.setColumns();
    this.fetchExportTemplates();

    document.addEventListener("click", this.handleOutsideClick);
    document.addEventListener("keydown", this.handleKeyDown);
    window.handleGroupButtonClick = this.handleGroupButtonClick.bind(this);
  },
  updated() {
    this.tabulatorInstance = this.$refs.tabulatorTableRef;
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleOutsideClick);
    document.removeEventListener("keydown", this.handleKeyDown);
    if (this.pendingEditTimer) {
      clearTimeout(this.pendingEditTimer);
    }
  },
  watch: {
    searchQuery(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.tabulatorInstance.filterTableData(
          "search_library_preparation",
          newValue === null ? "" : newValue
        );
      }
    },
    showPopupWindow(newVal) {
      if (!newVal) {
        document.getElementsByClassName("tabulator-cell")[1]?.click();
      }
    }
  },
  methods: {
    async getLibrariesSamples() {
      this.loading = true;
      try {
        let response = await axiosRef.get(
          urlStringStart + "/api/library_preparation/"
        );
        let fetchedRows = response.data.map((element) => ({
          pk: element.pk || "",
          name: element.name || "",
          type: element.barcode[2] || "",
          barcode: element.barcode || "",
          is_converted:
            element.is_converted === null ? "" : element.is_converted,
          request_name: element.request_name || "",
          pool_name: element.pool_name || "",
          library_protocol:
            element.library_protocol === 0 ? 0 : element.library_protocol || "",
          library_protocol_name: element.library_protocol_name || "",
          concentration_sample:
            element.concentration_sample === 0
              ? 0
              : element.concentration_sample || "",
          concentration_library:
            element.concentration_library === 0
              ? 0
              : element.concentration_library || "",
          starting_amount:
            element.starting_amount === 0 ? 0 : element.starting_amount || "",
          pcr_cycles: element.pcr_cycles === 0 ? 0 : element.pcr_cycles || "",
          mean_fragment_size:
            element.mean_fragment_size === 0
              ? 0
              : element.mean_fragment_size || "",
          smear_analysis:
            element.smear_analysis === 0 ? 0 : element.smear_analysis || "",
          comments: element.comments || "",
          comments_facility: element.comments_facility || "",
          comments_library_sample: element.comments_library_sample || "",
          coordinate: element.coordinate || "",
          index_type: element.index_type || "",
          index_i7_id: element.index_i7_id || "",
          index_i5_id: element.index_i5_id || "",
          create_time: element.create_time
            ? (() => {
                const date = new Date(element.create_time);
                if (isNaN(date)) return "";
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                return `${day}.${month}.${year}`;
              })()
            : "",
          measuring_unit_facility: element.measuring_unit_facility || "",
          measured_value_facility:
            element.measured_value_facility === 0
              ? 0
              : element.measured_value_facility || "",
          size_distribution_facility:
            element.size_distribution_facility === 0
              ? 0
              : element.size_distribution_facility || ""
        }));
        this.librariesSamplesList = fetchedRows;
      } catch (error) {
        handleError(error);
      } finally {
        this.loading = false;
      }
    },
    setColumns() {
      const columnDefs = libraryPreparationColumnDefs(
        () => this.tabulatorInstance
      );
      this.columnsList = loadColumnSettings(
        "libraryPreparation",
        columnDefs
      );
    },
    handleOutsideClick(event) {
      const selectColumnsPopup = this.$el.querySelector(".button-popup-container");
      const selectColumnsButton = this.$el.querySelector(
        "#toggleSelectColumnsButton"
      );
      const exportPopup = this.$el.querySelector(".export-popup");
      const exportButton = this.$el.querySelector("#openExportPopupButton");
      const confirmationPopup = this.$el.querySelector(".confirmation-popup");
      const clickOnExportButton =
        exportButton &&
        (exportButton === event.target || exportButton.contains(event.target));

      if (
        this.showSelectColumns &&
        selectColumnsPopup &&
        !selectColumnsPopup.contains(event.target) &&
        selectColumnsButton !== event.target &&
        !selectColumnsButton.contains(event.target)
      ) {
        this.showSelectColumns = false;
      }

      if (
        this.showExportPopup &&
        exportPopup &&
        !exportPopup.contains(event.target) &&
        !clickOnExportButton
      ) {
        this.showExportPopup = false;
      }

      if (
        this.showPopupWindow &&
        confirmationPopup &&
        !confirmationPopup.contains(event.target)
      ) {
        this.showPopupWindow = false;
      }
    },
    handleKeyDown(event) {
      const isEscape = event.key === "Escape";
      if (isEscape && (this.showPopupWindow || this.showExportPopup)) {
        this.showPopupWindow = false;
        this.showExportPopup = false;
        return;
      }
      if (isEscape && this.showSelectColumns) {
        this.showSelectColumns = false;
        return;
      }
    },
    fakeLoadingStart() {
      this.fakeLoading = true;
    },
    fakeLoadingStop() {
      setTimeout(() => {
        this.fakeLoading = false;
      }, 300);
    },
    toggleGroups(goToInitial) {
      this.fakeLoadingStart();
      this.tabulatorInstance.toggleGroups(goToInitial);
      this.fakeLoadingStop();
    },
    toggleSelectColumns() {
      this.showSelectColumns = !this.showSelectColumns;
    },
    handleColumnResized(column) {
      const field = column.getField();
      const width = column.getWidth();
      saveColumnSettings("libraryPreparation", field, width, "width");
      this.fakeLoadingStart();
      setTimeout(() => this.fakeLoadingStop(), 50);
    },
    handleColumnVisibilityChanged(field, visible) {
      saveColumnSettings(
        "libraryPreparation",
        field,
        visible,
        "visibility"
      );
      this.fakeLoadingStart();
      setTimeout(() => this.fakeLoadingStop(), 50);
    },
    toggleColumnVisibility(column) {
      if (this.tabulatorInstance) {
        this.tabulatorInstance.getTable().toggleColumn(column.field);
        this.handleColumnVisibilityChanged(column.field, column.visible);
      }
    },
    resetColumnWidths() {
      resetColumnSettings("libraryPreparation", "width");
      this.setColumns();
      this.fakeLoadingStart();
      setTimeout(() => this.fakeLoadingStop(), 300);
    },
    resetColumnVisibility() {
      resetColumnSettings("libraryPreparation", "visibility");
      this.setColumns();
      this.fakeLoadingStart();
      setTimeout(() => this.fakeLoadingStop(), 300);
    },
    handleGroupButtonClick(event, groupValue, action) {
      event.stopPropagation();

      const group = this.tabulatorInstance
        .getTable()
        .getGroups()
        .find((g) => g.getKey() === groupValue);
      const groupRows = group.getRows();
      const groupElement = group.getElement();
      const selectedRows = groupRows.filter((row) => row.getData().selected);
      const type = selectedRows[0] && selectedRows[0].getData().type;
      const requestName = group._group.key;
      const selectedNamesList = selectedRows.map((item) => {
        return { barcode: item.getData().barcode, name: item.getData().name };
      });
      const popupHeight = Math.min(420, 260 + selectedNamesList.length * 22);

      switch (action) {
        case "selectAll":
          groupRows.forEach((row) => {
            row.getData().selected = true;
            row.update({});
            const rowElement = row.getElement();
            const checkbox = rowElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = true;
            }
          });
          if (!group._group.visible) groupElement.click();
          break;

        case "deselectAll":
          groupRows.forEach((row) => {
            row.getData().selected = false;
            row.update({});
            const rowElement = row.getElement();
            const checkbox = rowElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = false;
            }
          });
          if (!group._group.visible) groupElement.click();
          break;

        case "qualityPassed":
          if (selectedRows.length === 0) {
            showNotification(
              "Please select libraries/samples in the request first.",
              "warning"
            );
            break;
          }
          let popupTitleQP = `Are you sure?`;
          let popupDescriptionQP = `Marking the following ${
            type === "L" ? "libraries" : "samples"
          } from the request <span style="font-weight: bold">'${requestName}'</span> as <span style="font-weight: bold">Quality Check: Passed</span>. Confirm your action by pressing the <span style="font-weight: bold">Yes</span> button.`;
          let popupListQP = [...selectedNamesList];
          let onYesQP = () => {
            this.qualityCheckChange(selectedRows, "passed");
            this.showPopupWindow = false;
          };
          let onNoQP = () => {
            this.showPopupWindow = false;
          };
          this.createPopupWindow(
            popupTitleQP,
            popupDescriptionQP,
            popupListQP,
            onYesQP,
            onNoQP,
            popupHeight,
            700
          );
          break;

        case "qualityFailed":
          if (selectedRows.length === 0) {
            showNotification(
              "Please select libraries/samples in the request first.",
              "warning"
            );
            break;
          }
          let popupTitleQF = `Are you sure?`;
          let popupDescriptionQF = `Marking the following ${
            type === "L" ? "libraries" : "samples"
          } from the request <span style="font-weight: bold">'${requestName}'</span> as <span style="font-weight: bold">Quality Check: Failed</span>. Confirm your action by pressing the <span style="font-weight: bold">Yes</span> button.`;
          let popupListQF = [...selectedNamesList];
          let onYesQF = () => {
            this.qualityCheckChange(selectedRows, "failed");
            this.showPopupWindow = false;
          };
          let onNoQF = () => {
            this.showPopupWindow = false;
          };
          this.createPopupWindow(
            popupTitleQF,
            popupDescriptionQF,
            popupListQF,
            onYesQF,
            onNoQF,
            popupHeight,
            700
          );
          break;
      }
    },
    onBatchCellValueChanged(batchChanges) {
      this.queueBatchChanges(batchChanges);
      this.scheduleBatchSave();
    },
    queueBatchChanges(batchChanges) {
      batchChanges.forEach((change) => {
        const key = `${change.record_type}:${change.pk}`;
        if (!this.pendingEditChanges[key]) {
          this.pendingEditChanges[key] = {
            pk: change.pk,
            record_type: change.record_type
          };
        }
        Object.keys(change).forEach((field) => {
          if (field !== "pk" && field !== "record_type") {
            this.pendingEditChanges[key][field] = change[field];
          }
        });
      });
    },
    scheduleBatchSave() {
      if (this.pendingEditTimer) {
        clearTimeout(this.pendingEditTimer);
      }
      this.pendingEditTimer = setTimeout(() => {
        this.flushPendingEdits();
      }, 300);
    },
    async flushPendingEdits() {
      if (this.isSavingEdits) {
        return;
      }
      const pending = Object.values(this.pendingEditChanges);
      if (pending.length === 0) return;

      this.pendingEditChanges = {};
      this.isSavingEdits = true;
      try {
        const payload = {
          data: JSON.stringify(pending)
        };
        await axiosRef.post(
          `${urlStringStart}/api/library_preparation/edit/`,
          payload
        );
      } catch (error) {
        this.queueBatchChanges(pending);
        handleError(error);
      } finally {
        this.isSavingEdits = false;
        if (Object.keys(this.pendingEditChanges).length > 0) {
          this.flushPendingEdits();
        }
      }
    },
    async qualityCheckChange(groupRows, qualityCheck) {
      this.fakeLoadingStart();
      const payload = {
        data: JSON.stringify(
          groupRows.map((row) => ({
            pk: row.getData().pk,
            record_type: row.getData().record_type,
            quality_check: qualityCheck
          }))
        )
      };
      try {
        await axiosRef.post(
          `${urlStringStart}/api/library_preparation/edit/`,
          payload
        );
        showNotification(
          "Quality check status updated successfully.",
          "success"
        );
        await this.getLibrariesSamples();
      } catch (error) {
        handleError(error);
      } finally {
        this.fakeLoadingStop();
      }
    },
    async fetchExportTemplates() {
      try {
        const response = await axiosRef.get(
          `${urlStringStart}/api/library-preparation-templates/`
        );
        this.fetchedLibraryPreparationTemplates = response.data;
      } catch (error) {
        handleError(error);
      }
    },
    async uploadExportTemplate(event) {
      const file = event.target.files[0];
      if (
        file &&
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          await axiosRef.post(
            `${urlStringStart}/api/library-preparation-templates/upload/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data"
              }
            }
          );
          showNotification("File uploaded successfully.", "success");
          this.fetchExportTemplates();
        } catch (error) {
          showNotification("Error uploading file: " + error, "error");
        } finally {
          this.selectedFile = "without-file";
        }
      } else {
        showNotification("Please upload a valid XLSX file.", "error");
      }
    },
    async downloadExportTemplate(file) {
      try {
        const response = await axiosRef.get(
          `${urlStringStart}/api/library-preparation-templates/${file.id}/download/`,
          {
            responseType: "blob"
          }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.name || "Library_Preparation.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        showNotification("Error downloading file: " + error, "error");
      }
    },
    async removeExportTemplate(index) {
      const file = this.fetchedLibraryPreparationTemplates[index];
      try {
        await axiosRef.delete(
          `${urlStringStart}/api/library-preparation-templates/${file.id}/remove/`
        );
        this.fetchedLibraryPreparationTemplates.splice(index, 1);
        showNotification("File removed successfully.", "success");
      } catch (error) {
        showNotification("Error removing file: " + error, "error");
      } finally {
        this.selectedFile = "without-file";
      }
    },
    handleExportClick() {
      const selected = this.librariesSamplesList.filter((row) => row.selected);
      if (selected.length === 0) {
        showNotification(
          "Please select at least one library or sample to export.",
          "warning"
        );
        return;
      }
      const protoSet = new Set(
        selected.map((r) => r.library_protocol_name || r.library_protocol)
      );
      if (protoSet.size > 1) {
        showNotification(
          "Please select rows from a single Library Preparation Protocol.",
          "warning"
        );
        return;
      }
      this.showExportPopup = true;
    },
    handleExportAction({ selection, template }) {
      // Library Prep export is always based on selection (implied by logic above)
      // but ExportPopup sends { selection: 'selected', template: ... }
      this.selectedFile = template;
      this.handleExport();
    },
    async handleExport() {
      try {
        this.fakeLoadingStart();
        const today = new Date();
        const formattedDate = `${today.getFullYear()}${String(
          today.getMonth() + 1
        ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

        let exportRows = this.librariesSamplesList.filter(
          (row) => row.selected
        );

        const sortedExportRows = [...exportRows].sort((a, b) => {
          const getRequestNum = (str) => {
            const match = String(str).match(/^(\d+)_/);
            return match ? parseInt(match[1], 10) : 0;
          };
          const protocolCompare = b.library_protocol_name?.localeCompare(
            a.library_protocol_name
          );
          if (protocolCompare !== 0) return protocolCompare;
          const aNum = getRequestNum(a.request_name);
          const bNum = getRequestNum(b.request_name);
          if (aNum !== bNum) return aNum - bNum;
          return a.barcode?.localeCompare(b.barcode);
        });

        const uniqueRequestIDs = [
          ...new Set(
            sortedExportRows.map((row) => {
              const match = row.request_name.match(/^(\d+)_/);
              return match ? match[1] : row.request_name;
            })
          )
        ]
          .sort()
          .join("_");

        let filename = "";

        filename = `${formattedDate}_${uniqueRequestIDs}_preparation`;

        const exportColumns = libraryPreparationExportColumns();

        const templateDownloadUrl =
          this.selectedFile !== "without-file"
            ? `${urlStringStart}/api/library-preparation-templates/${this.selectedFile.id}/download/`
            : null;

        const blob = await createExcelExportBlob({
          rows: sortedExportRows,
          exportColumns,
          axiosInstance: axiosRef,
          templateDownloadUrl
        });
        saveAs(blob, filename);
      } finally {
        this.fakeLoadingStop();
        this.showExportPopup = false;
        this.selectedFile = "without-file";
      }
    },
    createPopupWindow(
      popupTitle,
      popupDescription,
      popupList,
      onYes,
      onNo,
      popupHeight,
      popupWidth
    ) {
      this.popupContents.popupTitle = popupTitle;
      this.popupContents.popupDescription = popupDescription;
      this.popupContents.popupList = popupList;
      this.popupContents.onYes = onYes;
      this.popupContents.onNo = onNo;
      if (popupWidth && popupHeight) {
        this.popupContents.popupHeight = popupHeight;
        this.popupContents.popupWidth = popupWidth;
      }
      this.showPopupWindow = true;
    }
  }
};
</script>
