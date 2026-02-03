import {
  applyContextMenuToColumns,
  cellContextMenu,
  ellipsisContainer,
  showNotification,
  createColumn,
} from "../utilities/utilityFunctions";
import iconSamplesSubmitted from "../assets/icons/status_samples_submitted.svg";
import iconSamplesNotSubmitted from "../assets/icons/status_samples_not_submitted.svg";
import iconGmoYes from "../assets/icons/status_gmo_yes.svg";
import iconGmoNo from "../assets/icons/status_gmo_no.svg";
import iconSelectAll from "../assets/icons/action_select_all.svg";
import iconDeselectAll from "../assets/icons/action_deselect_all.svg";
import iconQualityPassed from "../assets/icons/status_quality_passed.svg";
import iconQualityFailed from "../assets/icons/status_quality_failed.svg";
import iconQualityCompromised from "../assets/icons/status_quality_compromised.svg";

export function incomingLibrariesSamplesGroupHeader(
  value,
  count,
  samplesSubmitted,
  gmo,
  totalDepth,
  readLengthDisplay,
  biosafetyLevel,
) {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        ${
          samplesSubmitted
            ? `<div title="Samples Submitted" style="display: flex; align-items: center; cursor: pointer;" onclick="handleGroupButtonClick(event, '${value}', 'samplesSubmitted')">
                <img src="${iconSamplesSubmitted}" alt="Samples Submitted" width="24" height="24" style="cursor: pointer;" />
              </div>`
            : `<div title="Samples not Submitted" style="display: flex; align-items: center; cursor: pointer;" onclick="handleGroupButtonClick(event, '${value}', 'samplesSubmitted')">
                <img src="${iconSamplesNotSubmitted}" alt="Samples not Submitted" width="24" height="24" style="cursor: pointer;" />
              </div>`
        }
    ${
      gmo
        ? `<div title="Propagable and GMO: Yes" style="display: flex; align-items: center;">
                <img src="${iconGmoYes}" alt="Propagable and GMO: Yes" width="24" height="24" style="cursor: auto;" />
              </div>`
        : `<div title="Propagable and GMO: No" style="display: flex; align-items: center;">
                <img src="${iconGmoNo}" alt="Propagable and GMO: No" width="24" height="24" style="cursor: auto;" />
              </div>`
    }
  <div>
    <span style="font-weight: bold; font-size: 12px; color: #333;">${value}</span>
    <span style="font-weight: normal; font-size: 12px; margin-left: 2px; color: black;">
      (#: ${count}, Total Depth: ${totalDepth}M, Read Lengths: ${
        readLengthDisplay || "No Read Length"
      }, ${biosafetyLevel})
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
      <div title="Mark selected as Quality Checked: Compromised" class="group-action-button" onclick="handleGroupButtonClick(event, '${value}', 'qualityCompromised')">
        <img src="${iconQualityCompromised}" alt="Quality Compromised" width="24" height="24" />
      </div>
    </div>
  </div>
`;
}

export function incomingLibrariesSamplesColumnDefs(getTabulatorInstance) {
  const checkboxColumn = {
    field: "selected",
    visible: true,
    headerVertical: false,
    frozen: true,
    resizable: false,
    formatter: (cell) => {
      const rowData = cell.getRow().getData();
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
    cellClick: (e, cell) => {
      const rowData = cell.getRow().getData();
      rowData.selected = e.target.checked;
    },
  };

  const nameColumn = createColumn("name", "Name", {
    minWidth: 100,
    frozen: true,
    cssClass: "name-column right-border",
    sorter: (a, b, aRow, bRow) => {
      return aRow
        .getData()
        .request_name.localeCompare(bRow.getData().request_name);
    },
    contextMenu: () =>
      cellContextMenu(true, false, false, getTabulatorInstance, {
        blockActionsOnDisabledCells: true,
      }),
    formatter: (cell) => {
      const { type, request_name } = cell.getRow().getData();
      const name = cell.getValue();
      const tableGroupsToggleState = getTabulatorInstance().getTableGroupsToggleState();
      return `
        <div style="padding: 4px 8px; display: flex; align-items: center;">
          <span title="${type === "S" ? "Sample" : "Library"}"
            style="
              display: inline-block;
              font-size: 10px;
              font-weight: bold;
              padding: 4px;
              border: 2px solid #333;
              border-radius: 4px;
              margin-right: 8px;
            ">
            ${type}
          </span>
          <span title="${name}" style="padding: 8px 0px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${
            (tableGroupsToggleState == 2 ? request_name + " ➜ " : "") + name
          }</span>
        </div>
      `;
    },
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const barcodeColumn = createColumn("barcode", "Barcode", {
    width: 95,
    minWidth: 95,
    frozen: true,
    cssClass: "details-column barcode-column right-border",
    formatter: (cell) => ellipsisContainer(cell.getValue() || "-", false),
    cellDblClick: () =>
      showNotification("This field is not editable.", "warning"),
  });

  const columns = [
    checkboxColumn,
    nameColumn,
    barcodeColumn,
    {
      title: "From Users",
      field: "from_user",
      headerHozAlign: "left",
      visible: true,
      cssClass: "title-field-group",
      columns: [
        createColumn("nucleic_acid_type_name", "Input Type", {
          minWidth: 80,
          width: "6%",
          headerVertical: false,
          cssClass: "user-entry-column",
          formatter: (cell) =>
            ellipsisContainer(cell.getValue() || "No Input Type"),
          cellDblClick: () =>
            showNotification("This field is not editable.", "warning"),
        }),
        createColumn("library_protocol_name", "Protocol", {
          minWidth: 80,
          width: "6%",
          headerVertical: false,
          cssClass: "user-entry-column",
          formatter: (cell) =>
            ellipsisContainer(cell.getValue() || "No Protocol"),
          cellDblClick: () =>
            showNotification("This field is not editable.", "warning"),
        }),
        createColumn("comments", "Comment Library/Input", {
          minWidth: 100,
          headerVertical: false,
          cssClass: "user-entry-column",
          cellDblClick: () =>
            showNotification("This field is not editable.", "warning"),
        }),
        createColumn("input", "Input", {
          minWidth: 60,
          width: "4%",
          headerVertical: false,
          cssClass: "user-entry-column",
          cellDblClick: () =>
            showNotification("This field is not editable.", "warning"),
        }),
        createColumn("volume", "µl", {
          minWidth: 60,
          width: "4%",
          headerVertical: false,
          cssClass: "user-entry-column",
          formatter: (cell) => {
            const val = Number(cell.getValue());
            return ellipsisContainer(
              isNaN(val) ? "-" : val === 0 ? "0.0" : val.toFixed(1),
            );
          },
          cellDblClick: () =>
            showNotification("This field is not editable.", "warning"),
        }),
        createColumn("mean_fragment_size", "bp", {
          minWidth: 60,
          width: "4%",
          headerVertical: false,
          cssClass: "user-entry-column",
          formatter: (cell) => {
            const val = Number(cell.getValue());
            return ellipsisContainer(
              isNaN(val) ? "-" : Math.round(val).toString(),
            );
          },
          cellDblClick: () =>
            showNotification("This field is not editable.", "warning"),
        }),
      ],
    },
    {
      title: "From Facility",
      field: "from_facility",
      headerHozAlign: "left",
      visible: true,
      cssClass: "title-field-group",
      columns: [
        createColumn("measured_value_facility", "Value", {
          minWidth: 60,
          width: "4%",
          editor: "number",
          headerVertical: false,
          cssClass: "facility-entry-column",
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
        }),
        createColumn("measuring_unit_facility", "Unit", {
          minWidth: 80,
          width: "6%",
          editor: "list",
          headerVertical: false,
          cssClass: "facility-entry-column",
          editorParams: (cell) => {
            const row = cell.getRow().getData();
            const options = [
              { label: "ng/µl (Concentration)", value: "ng/µl" },
              { label: "M (Cells)", value: "M" },
              { label: "k (Cells)", value: "k" },
              { label: "Unknown", value: "Unknown" },
            ];
            const values =
              row.type === "L"
                ? options.filter((o) => o.value !== "M" && o.value !== "k")
                : options;
            return {
              values,
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
        }),
        createColumn("sample_volume_facility", "µl", {
          minWidth: 60,
          width: "4%",
          editor: "number",
          headerVertical: false,
          cssClass: "facility-entry-column",
          editorParams: { min: 0, step: 0.1 },
          validator: ["min:0"],
          contextMenu: () =>
            cellContextMenu(true, true, true, getTabulatorInstance, {
              blockActionsOnDisabledCells: true,
            }),
          formatter: (cell) => {
            const val = Number(cell.getValue());
            return ellipsisContainer(
              isNaN(val) ? "-" : val === 0 ? "0.0" : val.toFixed(1),
            );
          },
        }),
        createColumn("size_distribution_facility", "bp", {
          minWidth: 60,
          width: "4%",
          editor: "number",
          headerVertical: false,
          cssClass: "facility-entry-column",
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
        }),
        createColumn("percent_total", "% Total", {
          minWidth: 60,
          width: "4%",
          editor: "number",
          headerVertical: false,
          cssClass: "facility-entry-column",
          editorParams: { min: 0, max: 100, step: 0.1 },
          validator: ["min:0", "max:100"],
          contextMenu: () =>
            cellContextMenu(true, true, true, getTabulatorInstance, {
              blockActionsOnDisabledCells: true,
            }),
          cellEditing: (cell) => {
            if (cell.getRow().getData().type === "S") {
              showNotification(
                "This field is not available for samples.",
                "warning",
              );
              cell.getTable().modules.edit.currentCell = null;
            }
          },
          formatter: (cell) => {
            const { type } = cell.getRow().getData();
            const val = Number(cell.getValue());
            const str = isNaN(val) ? "-" : val === 0 ? "0.0" : val.toFixed(1);
            const el = cell.getElement();
            if (type === "S") el.classList.add("disable-editing");
            else el.classList.remove("disable-editing");
            return ellipsisContainer(str);
          },
        }),
        createColumn("rna_quality_facility", "RQN", {
          minWidth: 60,
          width: "4%",
          editor: "number",
          headerVertical: false,
          cssClass: "facility-entry-column",
          editorParams: { min: 0, max: 11, step: 0.1 },
          validator: ["min:0", "max:11"],
          contextMenu: () =>
            cellContextMenu(true, true, true, getTabulatorInstance, {
              blockActionsOnDisabledCells: true,
            }),
          cellEditing: (cell) => {
            if (cell.getRow().getData().type === "L") {
              showNotification(
                "This field is not available for libraries.",
                "warning",
              );
              cell.getTable().modules.edit.currentCell = null;
            }
          },
          formatter: (cell) => {
            const { type } = cell.getRow().getData();
            const val = Number(cell.getValue());
            const str = isNaN(val) ? "-" : val === 0 ? "0.0" : val.toFixed(1);
            const el = cell.getElement();
            if (type === "L") el.classList.add("disable-editing");
            else el.classList.remove("disable-editing");
            return ellipsisContainer(str);
          },
        }),
        createColumn("gmo_facility", "Propagable & GMO", {
          minWidth: 60,
          width: "7%",
          editor: "list",
          editorParams: {
            values: ["Not Needed", "Risk Assessment Done"].map((v) => ({
              label: v,
              value: v,
            })),
            autocomplete: true,
            listOnEmpty: true,
            freetext: false,
          },
          cssClass: "facility-entry-column",
          headerVertical: false,
          headerFilter: false,
          contextMenu: () =>
            cellContextMenu(true, true, true, getTabulatorInstance, {
              blockActionsOnDisabledCells: true,
            }),
          cellEditing: (cell) => {
            const { type, gmo } = cell.getRow().getData();
            if (type === "L") {
              showNotification(
                "This field is not available for libraries.",
                "warning",
              );
            }
            if (gmo === false || gmo === "") {
              showNotification(
                "GMO is marked as 'NO' for this sample and cannot be edited.",
                "warning",
              );
            }
            if (type === "L" || gmo == false || gmo == "") {
              cell.getTable().modules.edit.currentCell = null;
            }
          },
          formatter: (cell) => {
            const val = cell.getValue();
            const { type, gmo } = cell.getRow().getData();
            const str = val || (gmo === true ? "-" : "No");
            const el = cell.getElement();
            if (type === "L" || gmo === false || gmo === "") {
              el.classList.add("disable-editing");
            } else {
              el.classList.remove("disable-editing");
            }
            return ellipsisContainer(str);
          },
        }),
        createColumn("comments_facility", "Comment", {
          minWidth: 100,
          editor: "input",
          headerVertical: false,
          cssClass: "facility-entry-column no-right-border",
          contextMenu: () =>
            cellContextMenu(true, true, true, getTabulatorInstance, {
              blockActionsOnDisabledCells: true,
            }),
        }),
      ],
    },
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

export function incomingLibrariesSamplesExportColumns() {
  return [
    { header: "Request", key: "request_name", width: 22 },
    { header: "Name", key: "name", width: 24 },
    { header: "Barcode", key: "barcode", width: 16 },
    { header: "Input Type", key: "nucleic_acid_type_name", width: 18 },
    { header: "Protocol", key: "library_protocol_name", width: 18 },
    { header: "Comment Library/Input", key: "comments", width: 24 },
    { header: "Input", key: "input", width: 16 },
    { header: "Volume (µl)", key: "volume", width: 12 },
    { header: "bp (User)", key: "mean_fragment_size", width: 12 },
    { header: "Value (Facility)", key: "measured_value_facility", width: 16 },
    { header: "Unit (Facility)", key: "measuring_unit_facility", width: 16 },
    { header: "Volume (Facility)", key: "sample_volume_facility", width: 16 },
    { header: "bp (Facility)", key: "size_distribution_facility", width: 14 },
    { header: "% Total", key: "percent_total", width: 10 },
    { header: "RQN", key: "rna_quality_facility", width: 10 },
    { header: "Propagable & GMO", key: "gmo_facility", width: 24 },
    { header: "Comment (Facility)", key: "comments_facility", width: 24 },
  ];
}
