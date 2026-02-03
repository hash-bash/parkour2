import {
  applyContextMenuToColumns,
  cellContextMenu,
  ellipsisContainer,
  createColumn,
} from "../utilities/utilityFunctions";
import { statusMap, getStatusClass } from "./statusConsts";
import iconEdit from "../assets/icons/action_edit.svg";
import iconDelete from "../assets/icons/action_delete_request.svg";
import iconSolicitApproval from "../assets/icons/action_solicit_approval.svg";
import iconFilePaths from "../assets/icons/action_view_file_paths.svg";
import iconComposeEmail from "../assets/icons/action_compose_email.svg";
import iconSelectAll from "../assets/icons/action_select_all.svg";
import iconDeselectAll from "../assets/icons/action_deselect_all.svg";

const sortedStatusEntries = Object.entries(statusMap).sort(
  ([keyA], [keyB]) => Number(keyA) - Number(keyB),
);

function updateInputDropdownTooltipState(isOpen) {
  document.body.classList.toggle("input-dropdown-open", Boolean(isOpen));
}

function createInputColumnHeader(cellComponent, options = {}) {
  const mode =
    options.inputColumnMode === "mode_facility" ? "mode_facility" : "mode_user";

  const template = document.createElement("div");
  template.innerHTML = `
    <div class="tabulator-input-header" style="display: flex; flex-direction: column; gap: 4px; align-items: stretch; width: 100%;">
      <div class="tabulator-input-header__title" style="font-size: 12px; color: #333;">Input</div>
      <div class="tabulator-header-filter" style="margin-top: -2px;">
        <select class="tabulator-input-header__select" style="height: 24px; font-size: 12px !important; border: 1px solid #d0d0d0 !important; width: 100%; font-size: 12px; font-family: var(--app-font-family, 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif); padding: 2px 4px; border-radius: 4px; background-color: #fff; cursor: pointer; box-sizing: border-box;">
        <option value="mode_user">User</option>
        <option value="mode_facility">Facility</option>
        </select>
      </div>
    </div>
  `;

  const container = template.firstElementChild;
  const select = container.querySelector(".tabulator-input-header__select");
  if (select) {
    select.value = mode;
    select.addEventListener("focus", () =>
      updateInputDropdownTooltipState(true),
    );
    select.addEventListener("blur", () =>
      updateInputDropdownTooltipState(false),
    );
    select.addEventListener("change", (event) => {
      const newMode = event.target.value;
      if (typeof options.onInputColumnModeChange === "function") {
        options.onInputColumnModeChange(newMode);
      }
    });
  }

  return container;
}

function createStatusHeaderTooltip() {
  const rowsHtml = sortedStatusEntries
    .map(
      ([key, label]) => `
      <div style="display: flex; gap: 6px; align-items: center;">
        <span style="font-weight: 600; min-width: 20px; text-align: right;">${key}</span>
        <span>${label}</span>
      </div>`,
    )
    .join("");

  const template = document.createElement("div");
  template.innerHTML = `
    <div style="text-align: left; display: flex; flex-direction: column; gap: 4px;">
      <div style="font-weight: 700; margin-bottom: 2px;">Status Codes</div>
      ${rowsHtml}
    </div>
  `;

  return template.firstElementChild;
}

export function librariesAndSamplesGroupHeader(
  value,
  count,
  totalDepth,
  options = {},
) {
  const {
    showStaffActions = false,
    showSolicitApproval = false,
    allowDelete = true,
    showApprovalTag = false,
  } = options;

  const staffActions = showStaffActions
    ? `
      <div title="View File Paths" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'viewFilePaths')">
        <img class="group-action-icon-img" src="${iconFilePaths}" alt="File Paths" />
      </div>
      <div title="Compose Email" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'composeEmail')">
        <img class="group-action-icon-img" src="${iconComposeEmail}" alt="Compose Email" />
      </div>
    `
    : "";

  const approvalAction = showSolicitApproval
    ? `
      <div title="Solicit Approval via Email" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'solicitApproval')">
        <img class="group-action-icon-img" src="${iconSolicitApproval}" alt="Solicit Approval" />
      </div>
    `
    : "";

  const deleteAction = allowDelete
    ? `
      <div title="Delete Request" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'deleteRequest')">
        <img class="group-action-icon-img" src="${iconDelete}" alt="Delete Request" />
      </div>
    `
    : "";

  const approvalTag = showApprovalTag
    ? `
      <button class="group-action-tag" title="Click here to Request Solicit Approval" onclick="handleGroupButtonClick(event, '${value}', 'requestApproval')">
        <span>Approval Required</span>
      </button>
    `
    : "";

  return `
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: bold; font-size: 12px; color: #333;">${value}</span>
        <span style="font-weight: normal; font-size: 12px; margin-left: 2px; color: black;">
          (#: ${count}, Total Depth: ${totalDepth})
        </span>
        ${approvalTag}
      </div>
    </div>
    <div class="group-action-buttons-container" style="position: sticky; gap: 5px;">
      <div title="View / Edit Request" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'viewRequest')">
        <img class="group-action-icon-img" src="${iconEdit}" alt="View / Edit Request" />
      </div>
      ${deleteAction}
      ${approvalAction}
      ${staffActions}
      ${showStaffActions ? '<span class="group-action-separator"></span>' : ""}
      <div title="Select All" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'selectAll')">
        <img class="group-action-icon-img icon-24" src="${iconSelectAll}" alt="Select All" />
      </div>
      <div title="Deselect All" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'deselectAll')">
        <img class="group-action-icon-img icon-24" src="${iconDeselectAll}" alt="Deselect All" />
      </div>
    </div>
  </div>
`;
}

export function librariesAndSamplesColumnDefs(
  getTabulatorInstance,
  columnOptions = {},
) {
  const { inputColumnMode = "mode_user", onInputColumnModeChange = () => {} } =
    columnOptions;

  const columns = [
    {
      field: "selected",
      visible: true,
      headerVertical: false,
      frozen: true,
      resizable: false,
      formatter: (cell) => {
        const rowData = cell.getRow().getData();
        return `
              <input
                type="checkbox"
                title="Select"
                style="top: -4px;"
                ${rowData.selected ? "checked" : ""}
              />
            `;
      },
      hozAlign: "center",
      width: 30,
      minWidth: 30,
      cssClass: "checkbox-column right-border",
      contextMenu: () =>
        cellContextMenu(false, false, false, getTabulatorInstance),
      cellClick: (e, cell) => {
        const row = cell.getRow();
        const rowData = row.getData();
        const checkbox = e.target;
        if (checkbox && checkbox.type === "checkbox") {
          rowData.selected = checkbox.checked;
        }
      },
    },
    createColumn("name", "Name", {
      minWidth: 140,
      frozen: true,
      cssClass: "right-border",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const name = cell.getValue();
        return `
          <div style="padding: 4px 12px; display: flex; align-items: center;">
            <span title="${name}" style="padding: 8px 0px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${name}</span>
          </div>
        `;
      },
    }),
    createColumn("status", "Status", {
      width: 50,
      headerTooltip: () => createStatusHeaderTooltip(),
      frozen: true,
      cssClass: "right-border",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const value = cell.getValue();
        const tooltip = statusMap[value];
        const statusClass = `status ${getStatusClass(value)}`;
        return `<div class="${statusClass}" title="${tooltip}"></div>`;
      },
    }),
    createColumn("type", "S/L", {
      width: 45,
      minWidth: 45,
      headerTooltip: "Type",
      frozen: true,
      cssClass: "right-border",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("well_position", "Plate Coord", {
      width: 80,
      minWidth: 60,
      headerTooltip: "Coordinate of Sample in 96-well Plate",
      frozen: true,
      cssClass: "right-border",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("barcode", "Barcode", {
      width: 96,
      minWidth: 96,
      headerTooltip: "Barcode",
      frozen: true,
      cssClass: "right-border",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const { record_type } = cell.getRow().getData();
        const value = cell.getValue();
        const barcode = value || "-";
        const barcodeSuffix = value?.[2] ?? "";
        const finalString =
          record_type === "Sample" && barcodeSuffix === "L"
            ? barcode + "*"
            : barcode;
        return ellipsisContainer(finalString);
      },
    }),
    createColumn("pool_names", "Pool Paths", {
      width: 85,
      minWidth: 60,
      headerTooltip: "Pool Paths",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("gmo", "Propagable & GMO", {
      width: 120,
      minWidth: 60,
      headerTooltip: "Genetically Modified Organism",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("create_time", "Date", {
      width: 90,
      minWidth: 60,
      headerTooltip: "Date",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("nucleic_acid_type_name", "Input Type", {
      minWidth: 80,
      width: "5%",
      headerVertical: false,
      headerTooltip: "Input Type",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) =>
        ellipsisContainer(cell.getValue() || "No Input Type"),
    }),
    createColumn("library_protocol_name", "Protocol", {
      minWidth: 80,
      width: "5%",
      headerTooltip: "Library Preparation Protocol",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => ellipsisContainer(cell.getValue() || "No Protocol"),
    }),
    createColumn("analysis_type_name", "Analysis Type", {
      minWidth: 80,
      width: "5%",
      headerTooltip: "Analysis Type",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) =>
        ellipsisContainer(cell.getValue() || "No Analysis Type"),
    }),
    {
      title: "Input",
      field: "input_display",
      minWidth: 85,
      width: "5%",
      headerVertical: false,
      headerTooltip: "Measured Value with Unit",
      titleFormatter: (cell, formatterParams) =>
        createInputColumnHeader(cell, formatterParams),
      titleFormatterParams: {
        inputColumnMode,
        onInputColumnModeChange,
      },
      visible: true,
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => ellipsisContainer(cell.getValue() || "-"),
    },
    createColumn("starting_amount", "Starting Amount", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Starting Amount (ng or fmol)",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const val = Number(cell.getValue());
        return ellipsisContainer(
          isNaN(val) ? "-" : val === 0 ? "0.0" : val.toFixed(1),
        );
      },
    }),
    createColumn("pcr_cycles", "Cycles", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "PCR Cycles",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const val = Number(cell.getValue());
        return ellipsisContainer(
          isNaN(val) ? "-" : Math.round(val).toString(),
        );
      },
    }),
    createColumn("concentration_library", "ng/µl Library", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Concentration Library (ng/µl)",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const val = Number(cell.getValue());
        return ellipsisContainer(
          isNaN(val) ? "-" : val === 0 ? "0.0" : val.toFixed(1),
        );
      },
    }),
    createColumn("average_fragment_size", "bp", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Library Average Fragment Size",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const val = Number(cell.getValue());
        return ellipsisContainer(
          isNaN(val) ? "-" : Math.round(val).toString(),
        );
      },
    }),
    createColumn("index_type_name", "Index Type", {
      minWidth: 60,
      width: "4%",
      headerVertical: false,
      headerTooltip: "Index Type",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("coordinate", "Coord", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Index Pair Coordinate",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("i7_id", "I7 ID", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Index I7 ID",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("index_i7", "Index I7", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Index I7 ID",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("i5_id", "I5 ID", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Index I5 ID",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("index_i5", "Index I5", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Index I5 ID",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("read_length_name", "Length", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Read Length",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("sequencing_depth", "Depth (M)", {
      minWidth: 60,
      width: "3.5%",
      headerVertical: false,
      headerTooltip: "Sequencing Depth (M)",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
      formatter: (cell) => {
        const val = Number(cell.getValue());
        return ellipsisContainer(
          isNaN(val) ? "-" : Math.round(val).toString(),
        );
      },
    }),
    createColumn("flowcell_ids", "Flowcell IDs", {
      minWidth: 60,
      width: "5.5%",
      headerVertical: false,
      headerTooltip: "Flowcell IDs",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
    createColumn("sequencer_names", "Sequencers", {
      minWidth: 60,
      width: "5.5%",
      headerVertical: false,
      headerTooltip: "Sequencer",
      cssClass: "regular-column",
      contextMenu: () =>
        cellContextMenu(true, false, false, getTabulatorInstance),
    }),
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

export function librariesAndSamplesExportColumns() {
  return [
    { header: "Request Name", key: "request_name", width: 25 },
    { header: "Name", key: "name", width: 25 },
    { header: "Status", key: "status_text", width: 15 },
    { header: "S/L", key: "type", width: 10 },
    { header: "Plate Coord", key: "well_position", width: 10 },
    { header: "Barcode", key: "barcode", width: 15 },
    { header: "Pool Paths", key: "pool_names", width: 20 },
    { header: "Propagable & GMO", key: "gmo", width: 22 },
    { header: "Date", key: "create_time", width: 15 },
    { header: "Input Type", key: "nucleic_acid_type_name", width: 20 },
    { header: "Protocol", key: "library_protocol_name", width: 20 },
    { header: "Analysis Type", key: "analysis_type_name", width: 20 },
    { header: "Input", key: "input_display", width: 15 },
    { header: "Starting Amount", key: "starting_amount", width: 18 },
    { header: "Cycles", key: "pcr_cycles", width: 12 },
    { header: "ng/µl Library", key: "concentration_library", width: 15 },
    { header: "bp", key: "average_fragment_size", width: 12 },
    { header: "Index Type", key: "index_type_name", width: 15 },
    { header: "Coord", key: "coordinate", width: 12 },
    { header: "I7 ID", key: "i7_id", width: 15 },
    { header: "Index I7", key: "index_i7", width: 15 },
    { header: "I5 ID", key: "i5_id", width: 15 },
    { header: "Index I5", key: "index_i5", width: 15 },
    { header: "Length", key: "read_length_name", width: 12 },
    { header: "Depth (M)", key: "sequencing_depth", width: 15 },
    { header: "Flowcell IDs", key: "flowcell_ids", width: 20 },
    { header: "Sequencers", key: "sequencer_names", width: 20 },
  ];
}
