import React from "react";

export function MetricTile({ title, value, unit, source, recordedAt }) {
  return (
    <article className="swf-metric-tile">
      <h4 className="swf-metric-title">{title}</h4>
      <p className="swf-metric-value">
        {value} <span>{unit}</span>
      </p>
      <p className="swf-metric-meta">Source: {source}</p>
      <p className="swf-metric-meta">{new Date(recordedAt).toLocaleString()}</p>
    </article>
  );
}
