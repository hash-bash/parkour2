import {
  applyContextMenuToColumns,
  cellContextMenu,
  ellipsisContainer,
  showNotification,
  createColumn,
} from "../utilities/utilityFunctions";
import iconSelectAll from "../assets/icons/action_select_all.svg";
import iconDeselectAll from "../assets/icons/action_deselect_all.svg";
import iconQualityPassed from "../assets/icons/status_quality_passed.svg";
import iconQualityFailed from "../assets/icons/status_quality_failed.svg";

export function libraryPreparationGroupHeader(value, count) {
  return `
  <div style="display: flex; justify-content: space-between; align-items: center;">
<div style="display: flex; justify-content: space-between; align-items: center;">
  <div>
    <span style="font-weight: bold; font-size: 12px; color: #333;">${value}</span>
    <span style="font-weight: normal; font-size: 12px; margin-left: 2px; color: black;">
      (# of Libraries: ${count})
    </span>
  </div>
</div>
    <div class="group-action-buttons-container" style="position: sticky; gap: 5px;">
      <div title="Select All" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'selectAll')">
        <img src="${iconSelectAll}" alt="Select All" width="24" height="24" />
      </div>
      <div title="Deselect All" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'deselectAll')">
        <img src="${iconDeselectAll}" alt="Deselect All" width="24" height="24" />
      </div>
      <div title="Mark selected as Quality Checked: Passed" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'qualityPassed')">
        <img src="${iconQualityPassed}" alt="Quality Passed" width="24" height="24" />
      </div>
      <div title="Mark selected as Quality Checked: Failed" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'qualityFailed')">
        <img src="${iconQualityFailed}" alt="Quality Failed" width="24" height="24" />
      </div>
    </div>
  </div>
`;
}

export function libraryPreparationColumnDefs(getTabulatorInstance) {
  const checkboxColumn = {
    field: "selected",
    visible: true,
    headerVertical: false,
    frozen: true,
    resizable: false,
    formatter: (cell) => {
      const row = cell.getRow();
      const rowData = row.getData();
      return `<input type="checkbox" title="Select" style="top:-4px" ${
        rowData.selected ? "checked" : ""
      } />`;
    },
    hozAlign: "center",
    width: 30,
    minWidth: 30,
    cssClass: "checkbox-column right-border",
    contextMenu: () =>
      cellContextMenu(false, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellClick: function (e, cell) {
      const clickedRow = cell.getRow();
      const rowData = clickedRow.getData();
      const checkbox = e.target;
      rowData.selected = checkbox.checked;
    },
  };

  const requestColumn = createColumn("request_name", "Request", {
    minWidth: 140,
    frozen: true,
    cssClass: "right-border",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-", false),
  });

  const barcodeColumn = createColumn("barcode", "Barcode", {
    width: 95,
    minWidth: 95,
    frozen: true,
    cssClass: "right-border",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
    formatter: (cell) =>
      ellipsisContainer(cell.getValue() + "*" || "-", false),
  });

  const nameColumn = createColumn("name", "Name", {
    width: 110,
    minWidth: 60,
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-", false),
  });

  const dateColumn = createColumn("create_time", "Date", {
    width: 90,
    minWidth: 60,
    headerTooltip: "Date (Since)",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const protocolColumn = createColumn("library_protocol_name", "Protocol", {
    width: 110,
    minWidth: 60,
    headerTooltip: "Library Preparation Protocol",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
    formatter: (cell) =>
      ellipsisContainer(cell.getValue() || "No Protocol"),
  });

  const commentColumn = createColumn("comments_library_sample", "Comment Library/Input", {
    width: 140,
    minWidth: 60,
    headerVertical: false,
    headerTooltip: "Comment (User)",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const poolColumn = createColumn("pool_name", "Pool", {
    width: 84,
    minWidth: 60,
    headerVertical: false,
    headerTooltip: "Pool ID",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const indexTypeColumn = createColumn("index_type", "Index Type", {
    width: 96,
    minWidth: 60,
    headerVertical: false,
    headerTooltip: "Index Type",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const indexI7Column = createColumn("index_i7_id", "I7 ID", {
    width: 105,
    minWidth: 60,
    headerVertical: false,
    headerTooltip: "Index I7 ID",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const indexI5Column = createColumn("index_i5_id", "I5 ID", {
    width: 105,
    minWidth: 60,
    headerVertical: false,
    headerTooltip: "Index I5 ID",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const coordinateColumn = createColumn("coordinate", "Coordinate", {
    width: 40,
    headerVertical: false,
    headerTooltip: "Index Pair Coordinate",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const valueColumn = createColumn("measured_value_facility", "Value", {
    minWidth: 60,
    width: "4%",
    editor: "number",
    headerVertical: false,
    headerTooltip: "Measured Value",
    cssClass: "regular-column",
    editorParams: { min: 0, step: 0.1 },
    validator: ["min:0"],
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = Number(cell.getValue());
      return ellipsisContainer(
        isNaN(val) || val === -1 ? "-" : val.toFixed(2),
      );
    },
  });

  const unitColumn = createColumn("measuring_unit_facility", "Unit", {
    minWidth: 80,
    width: "6%",
    editor: "list",
    headerVertical: false,
    headerTooltip: "Measurement Unit",
    cssClass: "regular-column",
    editorParams: (cell) => {
      const options = [
        { label: "ng/µl (Concentration)", value: "ng/µl" },
        { label: "M (Cells)", value: "M" },
        { label: "k (Cells)", value: "k" },
        { label: "Unknown", value: "Unknown" },
      ];
      return {
        values: options,
        autocomplete: true,
        listOnEmpty: true,
        freetext: false,
      };
    },
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = cell.getValue();
      const map = {
        "ng/µl": "ng/µl (Concentration)",
        M: "M (Cells)",
        k: "k (Cells)",
        Unknown: "Unknown",
      };
      return ellipsisContainer(map[val] || val || "Select");
    },
  });

  const bpSampleColumn = createColumn("size_distribution_facility", "bp Sample", {
    minWidth: 60,
    width: "4%",
    editor: "number",
    headerVertical: false,
    headerTooltip: "Sample Average Fragment Size (bp)",
    cssClass: "regular-column",
    editorParams: { min: 0, step: 1 },
    validator: ["min:0"],
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = Number(cell.getValue());
      return ellipsisContainer(
        isNaN(val) ? "-" : Math.round(val).toString(),
      );
    },
  });

  const startingAmountColumn = createColumn("starting_amount", "Starting Amount", {
    minWidth: 60,
    width: "4%",
    editor: "number",
    headerVertical: false,
    headerTooltip: "Starting Amount (ng or fmol)",
    cssClass: "regular-column",
    editorParams: { min: 0, step: 0.1 },
    validator: ["min:0"],
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = Number(cell.getValue());
      return ellipsisContainer(
        isNaN(val) ? "-" : val.toFixed(1),
      );
    },
  });

  const cyclesColumn = createColumn("pcr_cycles", "Cycles", {
    minWidth: 60,
    width: "4%",
    editor: "number",
    headerVertical: false,
    headerTooltip: "PCR Cycles",
    cssClass: "regular-column",
    editorParams: { min: 0, step: 1 },
    validator: ["integer", "min:0"],
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = Number(cell.getValue());
      return ellipsisContainer(
        isNaN(val) ? "-" : Math.round(val).toString(),
      );
    },
  });

  const concentrationColumn = createColumn("concentration_library", "ng/µl", {
    minWidth: 60,
    width: "4%",
    editor: "number",
    headerVertical: false,
    headerTooltip: "Concentration Library (ng/µl)",
    cssClass: "regular-column",
    editorParams: { min: 0, step: 0.1 },
    validator: ["min:0"],
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = Number(cell.getValue());
      return ellipsisContainer(
        isNaN(val) ? "-" : val.toFixed(2),
      );
    },
  });

  const bpLibraryColumn = createColumn("mean_fragment_size", "bp Library", {
    minWidth: 60,
    width: "4%",
    editor: "number",
    headerVertical: false,
    headerTooltip: "Library Average Fragment Size (bp)",
    cssClass: "regular-column",
    editorParams: { min: 0, step: 1 },
    validator: ["integer", "min:0"],
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = Number(cell.getValue());
      return ellipsisContainer(
        isNaN(val) ? "-" : Math.round(val).toString(),
      );
    },
  });

  const percentTotalColumn = createColumn("smear_analysis", "% Total", {
    minWidth: 60,
    width: "4%",
    editor: "number",
    headerVertical: false,
    headerTooltip: "Smear Analysis (% Total)",
    cssClass: "regular-column",
    editorParams: { min: 0, max: 100, step: 0.1 },
    validator: ["min:0", "max:100"],
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const val = Number(cell.getValue());
      return ellipsisContainer(
        isNaN(val) ? "-" : val.toFixed(1),
      );
    },
  });

  const facilityCommentColumn = createColumn("comments_facility", "Comment", {
    width: 140,
    minWidth: 60,
    editor: "input",
    headerVertical: false,
    headerTooltip: "Comment (Facility)",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, true, true, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
  });

  const columns = [
    checkboxColumn,
    requestColumn,
    barcodeColumn,
    nameColumn,
    dateColumn,
    protocolColumn,
    commentColumn,
    poolColumn,
    indexTypeColumn,
    indexI7Column,
    indexI5Column,
    coordinateColumn,
    valueColumn,
    unitColumn,
    bpSampleColumn,
    startingAmountColumn,
    cyclesColumn,
    concentrationColumn,
    bpLibraryColumn,
    percentTotalColumn,
    facilityCommentColumn,
  ];

  return applyContextMenuToColumns(columns, getTabulatorInstance, {
    allowCopy: true,
    allowEdit: false,
    allowApplyToAll: false,
    blockActionsOnDisabledCells: true,
    overrideExisting: true,
    skipFields: new Set(["selected"]),
  });
}

export function libraryPreparationExportColumns() {
  return [
    { header: "Request", key: "request_name", width: 25 },
    { header: "Barcode", key: "barcode", width: 15 },
    { header: "Name", key: "name", width: 20 },
    { header: "Date", key: "create_time", width: 15 },
    { header: "Protocol", key: "library_protocol_name", width: 20 },
    {
      header: "Comment Library/Sample",
      key: "comments_library_sample",
      width: 25,
    },
    { header: "Pool", key: "pool_name", width: 10 },
    { header: "Index Type", key: "index_type", width: 20 },
    { header: "I7 ID", key: "index_i7_id", width: 20 },
    { header: "I5 ID", key: "index_i5_id", width: 20 },
    { header: "Coordinate", key: "coordinate", width: 10 },
    { header: "Value", key: "measured_value_facility", width: 15 },
    { header: "Unit", key: "measuring_unit_facility", width: 15 },
    { header: "bp Sample", key: "size_distribution_facility", width: 15 },
  ];
}
