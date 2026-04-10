import React, { useEffect } from "react";
import { MetricTile } from "../components/MetricTile.jsx";
import { SyncControls } from "../components/SyncControls.jsx";
import { useSmartwatchData } from "../hooks/useSmartwatchData.js";



  return (
    <section className="swf-page">
      <header className="swf-header">
        <h2>Smartwatch Health Dashboard</h2>
        <p>Monitor wearable health metrics in real-time.</p>
      </header>

      <SyncControls loading={loading} onRefresh={refresh} onSync={syncNow} />

      {error ? <p className="swf-error">{error}</p> : null}

      <div className="swf-grid">
        {latestMetrics.map((metric) => (
          <MetricTile
            key={metric.id}
            title={metric.metricType}
            value={metric.value}
            unit={metric.unit}
            source={metric.source}
            recordedAt={metric.recordedAt}
          />
        ))}
      </div>

      <section className="swf-history">
        <h3>History</h3>
        <ul>
          {historyMetrics.map((item) => (
            <li key={item.id}>
              {item.metricType}: {item.value} {item.unit} ({new Date(item.recordedAt).toLocaleString()})
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
