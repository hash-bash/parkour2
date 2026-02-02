import { showNotification } from "./notifications";

export function getProp(object, keys, defaultVal) {
  keys = Array.isArray(keys) ? keys : keys.split(".");
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1), defaultVal);
  }
  return object === undefined ? defaultVal : object;
}

export function urlStringStartsWith() {
  let urlString = window.location.href.split("/vue/");
  if (urlString[0] === "http://localhost:5174") {
    return "http://localhost:9980";
  } else {
    return urlString[0];
  }
}

function notifyParentAuthRequired() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: "mainhub-vue",
          type: "auth-required",
        },
        window.location.origin,
      );
    }
  } catch (error) {
    // No-op: notification is a best-effort signal.
  }
}

export function handleError(error) {
  if (
    error.response &&
    error.response.status &&
    error.response.status === 403
  ) {
    let slices = window.location.href.split("/vue/");
    notifyParentAuthRequired();
    window.location.href =
      urlStringStartsWith() + "/login/?next=/vue/" + slices[1];
  } else if (error.message) {
    showNotification("Error: " + error.message, "error");
  } else {
    showNotification(
      "An error occurred while processing your request.\nPlease contact the BioInfo department for assistance.",
      "error",
    );
  }
}

export function cellContextMenu(
  allowCopy,
  allowPaste,
  allowApplyToAll,
  getTabulatorInstance,
  options = {},
) {
  const shouldBlockDisabledCells =
    options.blockActionsOnDisabledCells === true;
  const menuCell = options.cell || null;
  const onApplyToAll =
    typeof options.onApplyToAll === "function" ? options.onApplyToAll : null;
  const tabulatorInstance = getTabulatorInstance();
  const tableRef =
    typeof tabulatorInstance?.getTable === "function"
      ? tabulatorInstance.getTable()
      : tabulatorInstance;
  const operations = [];
  if (shouldBlockDisabledCells && menuCell) {
    const cellEl = menuCell.getElement?.();
    if (cellEl?.classList?.contains("disable-editing")) {
      if (allowCopy) {
        return [
          {
            label: "Copy",
            action: (e, cell) => {
              const targetCell = cell || menuCell;
              ensureRangeSelection(targetCell);
              tableRef?.copyToClipboard?.();
            },
          },
        ];
      }
      return [];
    }
  }
  const ensureRangeSelection = (cell) => {
    if (!tableRef || !cell) return;
    const ranges = tableRef.getRanges?.() || [];
    if (!ranges.length && typeof tableRef.addRange === "function") {
      tableRef.addRange(cell, cell);
    }
  };

  if (allowApplyToAll) {
    operations.push({
      label: "Apply to All",
      action: (e, cell) => {
        if (onApplyToAll) {
          onApplyToAll({
            cell,
            field: cell?.getField?.(),
            value: cell?.getValue?.(),
            tableRef,
            tabulatorInstance,
            blockActionsOnDisabledCells: shouldBlockDisabledCells,
          });
          return;
        }
        applyValueToAllRows(cell, getTabulatorInstance, {
          blockActionsOnDisabledCells: shouldBlockDisabledCells,
        });
      },
    });
  }

  if (allowCopy) {
    operations.push({
      label: "Copy",
      action: (e, cell) => {
        ensureRangeSelection(cell);
        tableRef?.copyToClipboard?.();
      },
    });
  }

  if (allowPaste) {
    operations.push({
      label: "Paste",
      action: (e, cell) => {
        ensureRangeSelection(cell);
        if (typeof tabulatorInstance?.triggerClipboardPaste === "function") {
          tabulatorInstance.triggerClipboardPaste();
        } else {
          tableRef?.pasteFromClipboard?.();
        }
      },
    });
  }

  return operations.length ? operations : [];
}

export function applyContextMenuToColumns(
  columns = [],
  getTabulatorInstance,
  options = {},
) {
  const {
    allowCopy = true,
    allowPaste = false,
    allowApplyToAll = false,
    blockActionsOnDisabledCells = false,
    overrideExisting = false,
    skipFields = new Set(),
    onApplyToAll = null,
  } = options;

  const applyToColumn = (column) => {
    if (!column || typeof column !== "object") return;
    if (Array.isArray(column.columns)) {
      column.columns.forEach(applyToColumn);
      return;
    }
    if (column.field && skipFields.has(column.field)) return;
    if (!overrideExisting && column.contextMenu) return;
    column.contextMenu = (e, cell) =>
      cellContextMenu(
        allowCopy,
        allowPaste,
        allowApplyToAll,
        getTabulatorInstance,
        {
          blockActionsOnDisabledCells,
          cell,
          onApplyToAll,
        },
      );
  };

  columns.forEach(applyToColumn);
  return columns;
}

export function applyValueToAllRows(cell, getTabulatorInstance, options = {}) {
  const tabulatorInstance = getTabulatorInstance?.();
  const tableRef =
    typeof tabulatorInstance?.getTable === "function"
      ? tabulatorInstance.getTable()
      : tabulatorInstance;
  if (!cell || !tableRef) return;
  const value = cell.getValue?.();
  const field = cell.getField?.();
  if (!field) return;
  const rowData = cell.getRow?.().getData?.() || {};
  const groupByField =
    tabulatorInstance?.tableGroupsConfig?.groupBy ||
    tabulatorInstance?.groupBy ||
    null;
  const requestId = rowData.request_id;
  const requestName = rowData.request_name;
  const protocolName = rowData.library_protocol_name;
  const applyToAllRows =
    !groupByField && !requestId && !requestName && !protocolName;
  const shouldBlockDisabledCells =
    options.blockActionsOnDisabledCells === true;
  const tableRows = tableRef?.getRows?.() || [];
  tableRows.forEach((row) => {
    const data = row.getData();
    let sameGroup = false;
    if (groupByField === "request_name") {
      sameGroup =
        (requestId && data.request_id === requestId) ||
        (!requestId && data.request_name === requestName);
    } else if (groupByField === "library_protocol_name") {
      sameGroup = data.library_protocol_name === protocolName;
    } else {
      sameGroup =
        (requestId && data.request_id === requestId) ||
        (protocolName && data.library_protocol_name === protocolName) ||
        data.request_name === requestName;
    }
    if (applyToAllRows) {
      sameGroup = true;
    }
    if (!sameGroup) return;
    const targetCell = row.getCell(field);
    if (!targetCell) return;
    const targetCellEl = targetCell.getElement?.();
    if (
      shouldBlockDisabledCells &&
      targetCellEl?.classList?.contains("disable-editing")
    ) {
      return;
    }
    const columnDef = targetCell.getColumn().getDefinition();
    const targetRowData = targetCell.getRow().getData();
    const isEditable = (() => {
      if (columnDef.editor === false) return false;
      if (typeof columnDef.editable === "function") {
        return columnDef.editable({
          getRow: () => ({ getData: () => targetRowData })
        });
      }
      if (typeof columnDef.editable === "boolean") {
        return columnDef.editable;
      }
      return true;
    })();
    if (!isEditable) return;
    row.update({ [field]: value });
  });
}
