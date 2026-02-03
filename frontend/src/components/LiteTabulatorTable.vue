<template>
  <!-- This Tabulator table is specially optimized for handling large numbers of records. -->
  <!-- Table Element -->
  <div class="custom-tabulator-table lite" style="height: 100%">
    <div :id="tableId" ref="tabulatorTableRef"></div>
  </div>
</template>

<script>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import * as XLSX from "xlsx";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css";
import { markRaw } from "vue";

export default {
  name: "LiteTabulatorTable",
  props: {
    rowData: {
      type: Array
    },
    tableId: {
      type: String,
      default: "tabulatorTable"
    },
    columnDefs: {
      type: Array,
      required: true
    },
    groupBy: {
      type: [String, Function, Boolean],
      required: false,
      default: null
    },
    groupSort: {
      type: Object,
      required: false,
      default: null
    },
    groupStartOpen: {
      type: Boolean,
      required: false,
      default: true
    },
    tableOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tabulatorInstance: null,
      tableGroupsConfig: {
        groupBy: this.groupBy ?? false,
        noGroupByClass: false
      },
      scrollPosition: 0,
      lastGroupValues: []
    };
  },
  watch: {
    rowData(newData, oldData) {
      if (newData !== oldData) {
        this.updateTableData();
      }
    },
    columnDefs(newColumns, oldColumns) {
      if (newColumns !== oldColumns) {
        this.updateTableColumns();
      }
    }
  },
  mounted() {
    this.initializeTable();
  },
  methods: {
    initializeTable() {
      if (this.rowData && this.columnDefs) {
        let options = {
          data: this.rowData,
          columns: this.columnDefs,
          layout: "fitColumns",
          columnDefaults: {
            headerSort: false,
            headerFilter: false,
            editor: false,
            headerHozAlign: "center",
            resizable: "header",
            headerContextMenu: []
          },
          renderVertical: "basic",
          tooltips: true,
          resizableColumns: true,
          selectable: true,
          selectableRange: 1,
          selectableRangeColumns: false,
          selectableRangeRows: false,
          selectableRangeClearCells: false,
          editTriggerEvent: "dblclick",
          clipboard: "copy",
          clipboardCopyStyled: false,
          clipboardCopyConfig: {
            formatCells: false,
            rowHeaders: false,
            columnHeaders: false
          },
          clipboardCopyRowRange: "range",
          clipboardCopyFormatter: function (type, output) {
            if (type == "plain") {
              output += "\n";
            }
            return output;
          },
          dependencies: {
            XLSX: XLSX
          },
          downloadConfig: {},
          groupToggleElement: "header",
          groupContextMenu: [],
          groupBy: this.tableGroupsConfig.groupBy || false,
          groupStartOpen: this.groupStartOpen,

          ...this.tableOptions
        };

        this.tabulatorInstance = markRaw(
          new Tabulator(`#${this.tableId}`, options)
        );

        this.tabulatorInstance.on("tableBuilt", () => {
          this.tabulatorInstance.blockRedraw();
          const tabulatorElement = this.getTabulatorElement();
          if (this.tableGroupsConfig.noGroupByClass) {
            tabulatorElement.classList.add("no-group-by");
          } else {
            tabulatorElement.classList.remove("no-group-by");
          }
          this.tabulatorInstance.restoreRedraw();
        });

        this.tabulatorInstance.on("renderComplete", () => {
          const rows = this.tabulatorInstance?.rowManager?.activeRows || [];
          this.updateGroupValuesFromRows(rows);
          if (this.tableOptions.handleRenderComplete) {
            this.tableOptions.handleRenderComplete();
          }
        });

        this.tabulatorInstance.on("columnResized", (column) => {
          if (this.tableOptions.handleColumnResized) {
            this.tableOptions.handleColumnResized(column);
          }
        });

        this.tabulatorInstance.on(
          "columnVisibilityChanged",
          (column, visible) => {
            if (this.tableOptions.handleColumnVisibilityChanged) {
              this.tableOptions.handleColumnVisibilityChanged(
                column.getField(),
                visible
              );
            }
          }
        );

        this.tabulatorInstance.on("clipboardCopied", () => {
          this.tableOptions.fakeLoadingStart();
          this.refreshTable();
          this.tableOptions.fakeLoadingStop();
        });

        this.tabulatorInstance.on("groupClick", (e, group) => {
          const scrollElement = this.tabulatorInstance.rowManager.element;
          this.scrollPosition = scrollElement.scrollTop;
        });

        this.tabulatorInstance.on(
          "groupVisibilityChanged",
          (group, visible) => {
            requestAnimationFrame(() => {
              const scrollElement = this.tabulatorInstance.rowManager.element;
              scrollElement.scrollTop = this.scrollPosition;
            });
            if (!visible) {
              this.refreshTable();
            }
          }
        );
      }
    },

    getTabulatorElement() {
      return document.getElementById(this.tableId);
    },

    updateGroupValuesFromRows(rows) {
      if (!this.tabulatorInstance || !this.groupBy || !rows) return;
      const uniqueGroups = new Set();
      rows.forEach((row) => {
        const val =
          row?._row?.data?.[this.groupBy] ?? row?.getData?.()?.[this.groupBy];
        if (val) uniqueGroups.add(val);
      });
      const sortedGroupValues = Array.from(uniqueGroups).sort((a, b) => {
        const getNum = (val) => parseInt(val?.split("_")[0], 10) || 0;
        return getNum(b) - getNum(a);
      });
      const isSameOrder =
        this.lastGroupValues.length === sortedGroupValues.length &&
        this.lastGroupValues.every((v, i) => v === sortedGroupValues[i]);
      if (!isSameOrder) {
        this.lastGroupValues = sortedGroupValues;
        this.tabulatorInstance.setGroupValues([sortedGroupValues]);
      }
    },

    updateTableData() {
      if (this.tabulatorInstance) {
        this.tabulatorInstance.replaceData(this.rowData);
      }
    },

    updateTableColumns() {
      if (this.tabulatorInstance) {
        this.tabulatorInstance.setColumns(this.columnDefs);
        this.tabulatorInstance.setGroupBy(this.groupBy || false);
        this.refreshTable();
      }
    },

    refreshTable() {
      if (this.tabulatorInstance) {
        this.tabulatorInstance.redraw();
      }
    },

    getTable() {
      return this.tabulatorInstance;
    }
  }
};
</script>

<!--
Add VirtualDOM support
Allow opening only 3 groups at a time
-->
