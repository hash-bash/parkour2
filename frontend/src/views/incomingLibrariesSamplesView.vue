<template>
  <div class="parent-container">
    <!-- Loading overlay -->
    <LoadingOverlay :visible="loading || fakeLoading" :fakeLoading="fakeLoading">
      <div v-if="!fakeLoading" class="spinner"></div>
      <p v-if="!fakeLoading">
        Loading <span style="font-weight: bold">Incoming Libraries</span> and
        <span style="font-weight: bold">Samples</span>...
      </p>
    </LoadingOverlay>

    <!-- Header -->
    <ViewHeader :icon="iconIncomingHeader" title="Incoming Libraries and Samples">
      <SearchBar v-model="searchQuery" />

      <div class="button-popup-wrapper">
        <button
          class="header-button"
          id="toggleAdvancedFiltersButton"
          @click="toggleAdvancedFilters"
        >
          <font-awesome-icon icon="fa-solid fa-filter" style="color: white" />
          <span> Advanced Filters </span>
        </button>
        <div
          id="advancedFiltersPopup"
          v-if="showAdvancedFilters"
          class="button-popup-container"
          style="width: 250px; left: -50px"
        >
          <label>
            <div
              style="
                display: flex;
                justify-content: center;
                text-align: center;
              "
            >
              <input type="checkbox" v-model="filters.showLibraries" />
            </div>
            <div><span style="font-weight: bold">Show</span> Libraries</div>
          </label>
          <label>
            <div
              style="
                display: flex;
                justify-content: center;
                text-align: center;
              "
            >
              <input type="checkbox" v-model="filters.showSamples" />
            </div>
            <div><span style="font-weight: bold">Show</span> Samples</div>
          </label>
          <label>
            <div
              style="
                display: flex;
                justify-content: center;
                text-align: center;
              "
            >
              <input type="checkbox" v-model="filters.onlySamplesSubmitted" />
            </div>
            <div>
              <span style="font-weight: bold">Filter Requests</span> with
              Samples Submitted
            </div>
          </label>
          <label>
            <div
              style="
                display: flex;
                justify-content: center;
                text-align: center;
              "
            >
              <input type="checkbox" v-model="filters.onlyGmo" />
            </div>
            <div>
              <span style="font-weight: bold">Filter Requests</span> with
              Propagable &amp; GMO ➜ Yes
            </div>
          </label>
        </div>
      </div>

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
        groupBy="request_name"
        :groupSort="{ field: 'request_name', order: 'desc' }"
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
      @yes="popupContents.onYes"
      @no="popupContents.onNo"
      @close="showPopupWindow = false"
    />

    <!-- Popup for Export Options -->
    <ExportPopup
      :show="showExportPopup"
      :templates="fetchedIncomingLibrariesAndSamplesTemplates"
      :hasSelectedRows="hasSelectedRows"
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
  createExcelExportBlob
} from "../utilities/utilityFunctions";
import {
  incomingLibrariesSamplesGroupHeader,
  incomingLibrariesSamplesColumnDefs,
  incomingLibrariesSamplesExportColumns
} from "../constants/incomingLibrariesSamplesConsts";
import iconIncomingHeader from "../assets/icons/header_incoming.svg";
import iconConfirmationAlert from "../assets/icons/alert_confirmation.svg";

const axiosRef = createAxiosObject();
const urlStringStart = urlStringStartsWith();

export default {
  name: "IncomingLibrariesAndSamples",
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
      iconIncomingHeader,
      iconConfirmationAlert,
      tabulatorInstance: null,
      loading: true,
      fakeLoading: false,
      librariesSamplesList: [],
      columnsList: [],
      showExportPopup: false,
      showPopupWindow: false,
      fetchedIncomingLibrariesAndSamplesTemplates: [],
      selectedFile: "without-file",
      exportSelection: "selected",
      hasSelectedRows: false,
      pendingEditChanges: {},
      pendingEditTimer: null,
      isSavingEdits: false,
      popupContents: {
        popupTitle: "Are you sure?",
        popupDescription: "",
        popupList: [],
        onYes: null,
        onNo: null,
        popupHeight: 240,
        popupWidth: 680
      },
      tableOptions: {
        index: "barcode",
        placeholder: "No Libraries and Samples to show.",
        initialSort: [
          { column: "barcode", dir: "asc" },
          { column: "name", dir: "desc" }
        ],
        groupHeader: (value, count, data) => {
          const samplesSubmitted = data.some(
            (item) => item.samples_submitted === true
          );
          const gmo = data.some((item) => item.gmo === true);
          let totalDepth = data.reduce(
            (sum, row) => sum + (row.sequencing_depth || 0),
            0
          );
          totalDepth = Number(totalDepth.toFixed(1));
          const readLengthLabels = [
            ...new Set(
              data
                .map((row) =>
                  row.read_length_name !== undefined
                    ? row.read_length_name
                    : row.read_length
                )
                .filter((value) => {
                  if (value === null || value === undefined) {
                    return false;
                  }
                  const trimmedValue = String(value).trim();
                  return trimmedValue.length > 0;
                })
                .map((value) => String(value).trim())
            )
          ];
          const readLengthDisplay = readLengthLabels.length
            ? readLengthLabels.join(", ")
            : "No Read Length";
          const biosafetyLevel =
            [...new Set(data.map((item) => item.biosafety_level))]
              .map((level) => level && level.toUpperCase())
              .join(" and ") || "No BSL";
          return incomingLibrariesSamplesGroupHeader(
            value,
            count,
            samplesSubmitted,
            gmo,
            totalDepth,
            readLengthDisplay,
            biosafetyLevel
          );
        },
        getClearValueForField: (field) => {
          if (field === "percent_total") return 100;
          return "";
        },
        blockActionsOnDisabledCells: true
      },
      searchQuery: "",
      filters: {
        showLibraries: true,
        showSamples: true,
        onlySamplesSubmitted: false,
        onlyGmo: false
      },
      showAdvancedFilters: false,
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
          "search_incoming_libraries_and_samples",
          newValue === null ? "" : newValue
        );
      }
    },
    "filters.showLibraries"(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.tabulatorInstance.filterTableData("showLibraries", newValue);
      }
    },
    "filters.showSamples"(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.tabulatorInstance.filterTableData("showSamples", newValue);
      }
    },
    "filters.onlySamplesSubmitted"(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.tabulatorInstance.filterTableData(
          "onlySamplesSubmitted",
          newValue
        );
      }
    },
    "filters.onlyGmo"(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.tabulatorInstance.filterTableData("onlyGmo", newValue);
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
          urlStringStart + "/api/incoming_libraries/"
        );
        let fetchedRows = response.data.map((element) => ({
          pk: element.pk || "",
          record_type: element.record_type || "",
          request_id: element.request || "",
          request_name: element.request_name || "",
          name: element.name || "",
          type: element.barcode[2] || "",
          barcode: element.barcode || "",
          samples_submitted: element.samples_submitted || "",
          nucleic_acid_type_name: element.nucleic_acid_type_name || "",
          library_protocol_name: element.library_protocol_name || "",
          biosafety_level:
            element.record_type === "Library" ? "BSL1"
              : element.biosafety_level || "",
          percent_total:
            element.percent_total === 0 ? 0 : element.percent_total || "",
          measuring_unit: element.measuring_unit || "",
          measured_value:
            element.measured_value === 0 ? 0 : element.measured_value || "",
          input: (({ measured_value: mv, measuring_unit: mu }) => {
            const isEmpty = (v) => v === null || v === undefined || v === "";
            if (mv === -1 && mu === "Unknown") return "Unknown";
            if (isEmpty(mv) && isEmpty(mu)) return "";
            const val = mv === 0 ? 0 : mv || "";
            const unit = mu || "";
            if (isEmpty(mv) && !isEmpty(mu)) {
              return unit;
            }
            if (unit !== "") return `${val} ${unit}`;
            return `${val}`;
          })(element),
          volume: element.volume === 0 ? 0 : element.volume || "",
          mean_fragment_size:
            element.mean_fragment_size === 0
              ? 0
              : element.mean_fragment_size || "",
          comments: element.comments || "",
          measuring_unit_facility: element.measuring_unit_facility || "",
          measured_value_facility:
            element.measured_value_facility === 0
              ? 0
              : element.measured_value_facility || "",
          sample_volume_facility:
            element.sample_volume_facility === 0
              ? 0
              : element.sample_volume_facility || "",
          size_distribution_facility:
            element.size_distribution_facility === 0
              ? 0
              : element.size_distribution_facility || "",
          sequencing_depth:
            element.sequencing_depth === 0 ? 0 : element.sequencing_depth || "",
          read_length:
            element.read_length === 0 ? 0 : element.read_length || "",
          read_length_name: element.read_length_name || "",
          rna_quality_facility:
            element.rna_quality_facility === 0
              ? 0
              : element.rna_quality_facility || "",
          gmo: element.gmo === null ? "" : element.gmo,
          gmo_facility:
            element.gmo_facility === null
              ? ""
              : element.gmo_facility === true
                ? "Risk Assessment Done"
                : "Not Needed",
          comments_facility: element.comments_facility || ""
        }));
        this.librariesSamplesList = fetchedRows;
      } catch (error) {
        handleError(error);
      } finally {
        this.loading = false;
      }
    },
    setColumns() {
      const storedVisibility = JSON.parse(
        localStorage.getItem("incomingLibrariesAndSamplesColumnVisibility") ||
          "{}"
      );
      const storedWidths = JSON.parse(
        localStorage.getItem("incomingLibrariesAndSamplesColumnWidths") || "{}"
      );

      const applySettings = (columns) => {
        return columns.map((column) => {
          if (column.field) {
            if (storedWidths[column.field]) {
              column.width = storedWidths[column.field];
              if (column.minWidth && column.width < column.minWidth) {
                column.width = column.minWidth;
              }
            }
            column.visible =
              storedVisibility[column.field] ?? column.visible ?? true;
          }
          if (column.columns) {
            column.columns = applySettings(column.columns);
          }
          return column;
        });
      };

      let columnDefs = incomingLibrariesSamplesColumnDefs(
        () => this.tabulatorInstance
      );

      this.columnsList = applySettings(columnDefs);
    },
    handleOutsideClick(event) {
      const advancedFiltersPopup = this.$el.querySelector(
        "#advancedFiltersPopup"
      );
      const advancedFiltersButton = this.$el.querySelector(
        "#toggleAdvancedFiltersButton"
      );
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
        this.showAdvancedFilters &&
        advancedFiltersPopup &&
        !advancedFiltersPopup.contains(event.target) &&
        advancedFiltersButton !== event.target &&
        !advancedFiltersButton.contains(event.target)
      ) {
        this.showAdvancedFilters = false;
      }

      // Column Selector handles its own outside click, but we keep this for consistency if needed
    },
    handleKeyDown(event) {
      const isEscape = event.key === "Escape";
      if (isEscape && (this.showPopupWindow || this.showExportPopup)) {
        this.showPopupWindow = false;
        this.showExportPopup = false;
        return;
      }
      if (isEscape && this.showAdvancedFilters) {
        this.showAdvancedFilters = false;
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
    toggleAdvancedFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters;
      if (this.showAdvancedFilters) {
        this.showSelectColumns = false;
      }
    },
    handleColumnResized(column) {
      const field = column.getField();
      const width = column.getWidth();
      const storedWidths = JSON.parse(
        localStorage.getItem("incomingLibrariesAndSamplesColumnWidths") || "{}"
      );
      const newWidths = {
        ...storedWidths,
        [field]: width
      };
      localStorage.setItem(
        "incomingLibrariesAndSamplesColumnWidths",
        JSON.stringify(newWidths)
      );
      this.fakeLoadingStart();
      setTimeout(() => this.fakeLoadingStop(), 50);
    },
    handleColumnVisibilityChanged(field, visible) {
      if (field !== "from_user" && field !== "from_facility") {
        const storedVisibility = JSON.parse(
          localStorage.getItem("incomingLibrariesAndSamplesColumnVisibility") ||
            "{}"
        );

        const newVisibility = {
          ...storedVisibility,
          [field]: visible
        };

        localStorage.setItem(
          "incomingLibrariesAndSamplesColumnVisibility",
          JSON.stringify(newVisibility)
        );

        this.fakeLoadingStart();
        setTimeout(() => this.fakeLoadingStop(), 50);
      }
    },
    toggleColumnVisibility(column) {
      if (this.tabulatorInstance) {
        this.tabulatorInstance.getTable().toggleColumn(column.field);
        this.handleColumnVisibilityChanged(column.field, column.visible);
      }
    },
    resetColumnWidths() {
      localStorage.removeItem("incomingLibrariesAndSamplesColumnWidths");
      this.setColumns();
      this.fakeLoadingStart();
      setTimeout(() => this.fakeLoadingStop(), 300);
    },
    resetColumnVisibility() {
      localStorage.removeItem("incomingLibrariesAndSamplesColumnVisibility");
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
      const requestId = groupRows[0].getData().request_id;
      const requestName = group._group.key;
      const selectedNamesList = selectedRows.map((item) => {
        return { barcode: item.getData().barcode, name: item.getData().name };
      });
      const popupHeight = Math.min(440, 280 + selectedNamesList.length * 22);

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

        case "samplesSubmitted":
          let newSamplesSubmittedState = groupRows[0].getData()
            .samples_submitted
            ? !groupRows[0].getData().samples_submitted
            : true;
          try {
            this.fakeLoadingStart();
            const payload = {
              data: JSON.stringify({
                result: newSamplesSubmittedState
              })
            };
            const url = `${urlStringStart}/api/requests/${requestId}/samples_submitted/`;
            axiosRef.post(url, payload);
            showNotification(
              "Request successfully marked as 'Samples Submitted'.",
              "success"
            );
            groupRows.forEach((row) => {
              let rowData = row.getData();
              rowData.samples_submitted = rowData.samples_submitted
                ? !rowData.samples_submitted
                : true;
              row.update(rowData);
            });
            const table = this.tabulatorInstance.getTable();
            table?.blockRedraw();
            group._group.generateGroupHeaderContents();
            table?.restoreRedraw();
          } catch (error) {
            handleError(error);
          } finally {
            this.fakeLoadingStop();
          }
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
          } from the request <span style="font-weight: bold">'${requestName}'</span> as <span style="font-weight: bold">Quality Check: Passed</span>. Proceed by pressing the <span style="font-weight: bold">Confirm</span> button.`;
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

        case "qualityCompromised":
          if (selectedRows.length === 0) {
            showNotification(
              "Please select libraries/samples in the request first.",
              "warning"
            );
            break;
          }
          let popupTitleQC = `Are you sure?`;
          let popupDescriptionQC = `Marking the following ${
            type === "L" ? "libraries" : "samples"
          } from the request <span style="font-weight: bold">'${requestName}'</span> as <span style="font-weight: bold">Quality Check: Compromised</span>. Proceed by pressing the <span style="font-weight: bold">Confirm</span> button.`;
          let popupListQC = [...selectedNamesList];
          let onYesQC = () => {
            this.qualityCheckChange(selectedRows, "compromised");
            this.showPopupWindow = false;
          };
          let onNoQC = () => {
            this.showPopupWindow = false;
          };
          this.createPopupWindow(
            popupTitleQC,
            popupDescriptionQC,
            popupListQC,
            onYesQC,
            onNoQC,
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
          } from the request <span style="font-weight: bold">'${requestName}'</span> as <span style="font-weight: bold">Quality Check: Failed</span>. Proceed by pressing the <span style="font-weight: bold">Confirm</span> button.`;
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
          `${urlStringStart}/api/incoming_libraries/edit/`,
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
          `${urlStringStart}/api/incoming_libraries/edit/`,
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
          `${urlStringStart}/api/incoming-libraries-samples-templates/`
        );
        this.fetchedIncomingLibrariesAndSamplesTemplates = response.data;
      } catch (error) {
        handleError(error);
      }
    },
    handleFileUpload(file) {
      if (
        file &&
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const formData = new FormData();
        formData.append("file", file);
        this.uploadExportTemplate(formData);
      } else {
        showNotification("Please upload a valid XLSX file.", "error");
      }
    },
    async uploadExportTemplate(formData) {
      try {
        await axiosRef.post(
          `${urlStringStart}/api/incoming-libraries-samples-templates/upload/`,
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
    },
    async downloadExportTemplate(file) {
      try {
        const response = await axiosRef.get(
          `${urlStringStart}/api/incoming-libraries-samples-templates/${file.id}/download/`,
          {
            responseType: "blob"
          }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          file.name || "IncomingLibrariesAndSamples.xlsx"
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        showNotification("Error downloading file: " + error, "error");
      }
    },
    async removeExportTemplate(index) {
      const file = this.fetchedIncomingLibrariesAndSamplesTemplates[index];
      try {
        await axiosRef.delete(
          `${urlStringStart}/api/incoming-libraries-samples-templates/${file.id}/remove/`
        );
        this.fetchedIncomingLibrariesAndSamplesTemplates.splice(index, 1);
        showNotification("File removed successfully.", "success");
      } catch (error) {
        showNotification("Error removing file: " + error, "error");
      } finally {
        this.selectedFile = "without-file";
      }
    },
    handleExportClick() {
      this.hasSelectedRows = this.librariesSamplesList.some(
        (row) => row.selected
      );
      this.exportSelection = this.hasSelectedRows ? "selected" : "all";
      this.showExportPopup = true;
    },
    handleExportAction({ selection, template }) {
      this.exportSelection = selection;
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

        let exportRows = [];
        if (this.exportSelection === "selected") {
          exportRows = this.librariesSamplesList.filter((row) => row.selected);
        } else {
          exportRows = this.librariesSamplesList;
        }

        const sortedExportRows = [...exportRows].sort((a, b) => {
          const getRequestNum = (str) => {
            const match = String(str).match(/^(\d+)_/);
            return match ? parseInt(match[1], 10) : 0;
          };
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
        if (this.exportSelection === "selected") {
          filename = `${formattedDate}_${uniqueRequestIDs}_incoming`;
        } else {
          filename = `${formattedDate}_incoming`;
        }

        const exportColumns = incomingLibrariesSamplesExportColumns();

        const templateDownloadUrl =
          this.selectedFile !== "without-file"
            ? `${urlStringStart}/api/incoming-libraries-samples-templates/${this.selectedFile.id}/download/`
            : null;

        const blob = await createExcelExportBlob({
          rows: sortedExportRows,
          exportColumns,
          axiosInstance: axiosRef,
          templateDownloadUrl
        });
        saveAs(blob, filename);
      } catch (error) {
        showNotification(
          "Error during export. Please try again.\n" + error,
          "error"
        );
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

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.parent-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.table-container {
  flex: 1;
  overflow: auto;
  position: relative;
}

@media (max-width: 1400px) {
  .header-title {
    min-width: 80px;
  }

  .search-bar {
    width: 280px;
  }

  .search-bar input {
    padding: 8px;
  }

  .header-button {
    padding: 8px 12px;
  }
}

@media (max-width: 1100px) {
  .search-bar {
    width: 250px;
  }

  .search-bar input {
    padding: 6px;
  }

  .header-button span {
    display: none;
  }
}

@media (max-width: 700px) {
  .header-title {
    font-size: 16px;
  }

  .search-bar {
    width: 130px;
  }

  .search-bar input {
    width: 85px;
  }
}

@media (max-width: 550px) {
  .header-logo {
    display: none !important;
  }

  .search-bar {
    display: none;
  }

  .header-button {
    display: none;
  }
}
</style>
