import {
  applyContextMenuToColumns,
  cellContextMenu,
  ellipsisContainer,
  createColumn,
} from "../utilities/utilityFunctions";
import iconSelectAll from "../assets/icons/action_select_all.svg";
import iconDeselectAll from "../assets/icons/action_deselect_all.svg";
import iconQualityPassed from "../assets/icons/status_quality_passed.svg";
import iconQualityFailed from "../assets/icons/status_quality_failed.svg";
import iconEditComment from "../assets/icons/action_pool_edit_comment.svg";
import iconDestroyPool from "../assets/icons/action_pool_destroy.svg";

export function poolingGroupHeader(
  value,
  count,
  headerClass,
  totalDepth,
  pool_size,
  comment,
) {
  return `
  <div class="${headerClass}" style="display: flex; justify-content: space-between; align-items: center; padding: 5px;">
<div style="display: flex; justify-content: space-between; align-items: center;">
  <div>
    <span style="font-weight: bold; font-size: 12px; color: #333;">${value}</span>
    <span style="font-weight: normal; font-size: 12px; margin-left: 1px; color: black;">
        | Pool Size: ${totalDepth}M reads (${pool_size}) ${
          comment ? "| Comment: " + comment : ""
        }
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
      <div title="Edit Comment" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'editComment')">
        <img src="${iconEditComment}" alt="Edit Comment" width="24" height="24" />
      </div>
      <div title="Destroy Pool" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'destroyPool')">
        <img src="${iconDestroyPool}" alt="Destroy Pool" width="24" height="24" />
      </div>
    </div>
  </div>
`;
}

export function poolingColumnDefs(getTabulatorInstance) {
  const checkboxColumn = {
    field: "selected",
    visible: true,
    headerVertical: false,
    frozen: true,
    resizable: false,
    formatter: (cell) => {
      const rowData = cell.getRow().getData();
      const shouldShowCheckbox = !(
        rowData.record_type === "Sample" &&
        (rowData.status === 2 || rowData.status === -2)
      );
      if (!shouldShowCheckbox) {
        return "";
      }
      return `<input type="checkbox" title="Select" style="top:-4px" ${
        rowData.selected ? "checked" : ""
      } />`;
    },
    hozAlign: "center",
    width: 30,
    minWidth: 30,
    cssClass: "checkbox-column right-border",
    contextMenu: () =>
      cellContextMenu(false, false, false, getTabulatorInstance),
    cellClick: function (e, cell) {
      const row = cell.getRow();
      const rowData = row.getData();
      const checkbox = e.target;
      if (checkbox && checkbox.type === "checkbox") {
        rowData.selected = checkbox.checked;
      }
    },
  };

  const requestColumn = createColumn("request_name", "Request", {
    minWidth: 140,
    headerFilter: true,
    headerTooltip: "Request ID",
    frozen: true,
    cssClass: "right-border",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => {
      const pool_name = cell.getRow().getData().pool_name;
      const name = cell.getValue();
      const tabulatorInstance = getTabulatorInstance();
      const tableGroupsToggleState =
        tabulatorInstance.getTableGroupsToggleState();
      return `
              <div style="padding: 4px 12px; display: flex; align-items: center;">
                <span title="${name}" style="padding: 8px 0px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${
                  (tableGroupsToggleState == 2 ? pool_name + " ➜ " : "") + name
                }</span>
              </div>`;
    },
  });

  const nameColumn = createColumn("name", "Name", {
    minWidth: 60,
    headerFilter: true,
    headerTooltip: "Library Name",
    frozen: true,
    cssClass: "right-border",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-", false),
  });

  const barcodeColumn = createColumn("barcode", "Barcode", {
    width: 95,
    minWidth: 95,
    headerFilter: true,
    headerTooltip: "Barcode",
    frozen: true,
    cssClass: "right-border",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => {
      const rowData = cell.getRow().getData();
      const value = cell.getValue();
      const barcode = value || "-";
      const barcodeSuffix = value?.[2] ?? "";
      const finalString =
        rowData.record_type === "Sample" && barcodeSuffix === "L"
          ? barcode + "*"
          : barcode;
      return ellipsisContainer(finalString);
    },
  });

  const dateColumn = createColumn("create_time", "Date", {
    width: 90,
    minWidth: 60,
    headerFilter: true,
    headerTooltip: "Date",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-"),
  });

  const concentrationColumn = createColumn("concentration_library", "ng/µl", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Concentration Library (ng/µl)",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => {
      const rawValue = cell.getValue();
      const value = Number(rawValue);
      const finalString =
        rawValue === "" || rawValue === undefined || isNaN(value)
          ? "-"
          : value === 0
            ? "0.0"
            : value.toFixed(1);
      return ellipsisContainer(finalString);
    },
  });

  const percentTotalColumn = createColumn("combined_smear_analysis", "% Total", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Smear Analysis (% Total)",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => {
      const rawValue = cell.getValue();
      return ellipsisContainer(rawValue + "%" || "-");
    },
  });

  const meanFragmentSizeColumn = createColumn("mean_fragment_size", "bp", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Mean Fragment Size (bp)",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => {
      const rawValue = cell.getValue();
      const value = Number(rawValue);
      let finalString;
      if (rawValue === "" || rawValue === undefined || isNaN(value)) {
        finalString = "-";
      } else {
        finalString = Math.round(value).toString();
      }
      return ellipsisContainer(finalString);
    },
  });

  const depthColumn = createColumn("sequencing_depth", "Depth (M)", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Sequencing Depth (M)",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => {
      const rawValue = cell.getValue();
      const value = Number(rawValue);
      let finalString;
      if (rawValue === "" || rawValue === undefined || isNaN(value)) {
        finalString = "-";
      } else {
        finalString = Math.round(value).toString();
      }
      return ellipsisContainer(finalString);
    },
  });

  const percentageLibraryColumn = createColumn("percentage_library", "%", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "% Library in Pool",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => {
      const rawValue = cell.getValue();
      return ellipsisContainer(rawValue + "%" || "-");
    },
  });

  const coordinateColumn = createColumn("coordinate", "Coord", {
    width: 80,
    headerVertical: false,
    headerTooltip: "Index Pair Coordinate",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-"),
  });

  const i7IdColumn = createColumn("index_i7_id", "I7 ID", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Index I7 ID",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-"),
  });

  const indexI7Column = createColumn("index_i7", "Index I7", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Index I7 ID",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-"),
  });

  const i5IdColumn = createColumn("index_i5_id", "I5 ID", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Index I5 ID",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-"),
  });

  const indexI5Column = createColumn("index_i5", "Index I5", {
    minWidth: 60,
    width: "6%",
    headerVertical: false,
    headerTooltip: "Index I5 ID",
    cssClass: "regular-column",
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance),
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-"),
  });

  const columns = [
    checkboxColumn,
    requestColumn,
    nameColumn,
    barcodeColumn,
    dateColumn,
    concentrationColumn,
    percentTotalColumn,
    meanFragmentSizeColumn,
    depthColumn,
    percentageLibraryColumn,
    coordinateColumn,
    i7IdColumn,
    indexI7Column,
    i5IdColumn,
    indexI5Column,
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

export function poolingExportColumns() {
  return [
    { header: "Pool", key: "pool_name", width: 20 },
    { header: "Request", key: "request_name", width: 25 },
    { header: "Name", key: "name", width: 25 },
    { header: "Barcode", key: "barcode", width: 15 },
    { header: "Date", key: "create_time", width: 15 },
    {
      header: "Concentration Library",
      key: "concentration_library",
      width: 20,
    },
    { header: "% Total", key: "combined_smear_analysis", width: 20 },
    { header: "bp", key: "mean_fragment_size", width: 20 },
    { header: "Depth (M)", key: "sequencing_depth", width: 20 },
    { header: "%", key: "percentage_library", width: 20 },
    { header: "Coord", key: "coordinate", width: 10 },
    { header: "I7 ID", key: "index_i7_id", width: 20 },
    { header: "Index I7", key: "index_i7", width: 20 },
    { header: "I5 ID", key: "index_i5_id", width: 20 },
    { header: "Index I5", key: "index_i5", width: 20 },
  ];
}
