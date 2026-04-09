import React from "react";

export function SyncControls({ loading, onRefresh, onSync }) {
  return (
    <div className="swf-controls">
      <button type="button" disabled={loading} onClick={onRefresh}>
        Refresh
      </button>
      <button type="button" disabled={loading} onClick={() => onSync("mock")}>
        Sync Now
      </button>
    </div>
  );
}
