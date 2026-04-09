# Smartwatch Feature Module

`smartwatchfeature` is a plug-and-play module for collecting, storing, and visualizing smartwatch health metrics.

It is intentionally isolated so you can copy this folder into another project and wire it up with minimal changes.

## Feature Overview

- Backend API for smartwatch metrics and sync jobs
- Frontend React UI for dashboard and manual sync
- Shared schemas/constants used by backend and frontend
- Dependency injection hooks for storage, logging, auth token, and fetch implementation

## Folder Structure

```text
smartwatchfeature/
  backend/
    package.json
    src/
      index.js
      config/defaultConfig.js
      controllers/smartwatchController.js
      models/HealthRecord.js
      repositories/healthRepository.js
      routes/smartwatchRoutes.js
      services/smartwatchService.js
  frontend/
    package.json
    src/
      index.js
      api/smartwatchApiClient.js
      components/MetricTile.jsx
      components/SyncControls.jsx
      hooks/useSmartwatchData.js
      pages/SmartwatchDashboardPage.jsx
      styles/smartwatchfeature.css
  shared/
    constants/metrics.js
    schemas/healthMetric.schema.js
```

## Required Environment Variables

The module is environment-agnostic. If your app uses external providers, define these in your host app:

- `SMARTWATCH_FEATURE_API_BASE_URL` (frontend)
- `SMARTWATCH_FEATURE_DEFAULT_USER_ID` (optional fallback)
- `SMARTWATCH_FEATURE_SYNC_PROVIDER` (optional; e.g., `mock`, `googlefit`)

No DB env var is required if you use the included in-memory repository.

## Backend Setup

1. Install dependency in the backend host app:

```bash
npm install express
```

2. Import and mount the feature router:

```js
import express from "express";
import { createSmartwatchFeature } from "./smartwatchfeature/backend/src/index.js";

const app = express();
app.use(express.json());

const { router } = createSmartwatchFeature({
  // Optional injection points:
  // repository,
  // logger,
  // config,
});

app.use("/api/smartwatch", router);
```

3. Start your host server as usual.

## Frontend Setup

1. Ensure your host app has React and a bundler configured.
2. Import the page and CSS from this module:

```jsx
import "./smartwatchfeature/frontend/src/styles/smartwatchfeature.css";
import { SmartwatchDashboardPage } from "./smartwatchfeature/frontend/src/index.js";

export default function App() {
  return (
    <SmartwatchDashboardPage
      userId="user-123"
      apiBaseUrl={import.meta.env.SMARTWATCH_FEATURE_API_BASE_URL || "http://localhost:5000/api/smartwatch"}
    />
  );
}
```

## Integration Steps

1. Copy `smartwatchfeature/` into your target project.
2. Mount backend router at a route prefix (example: `/api/smartwatch`).
3. Provide a repository implementation if you need persistent storage.
4. Render `SmartwatchDashboardPage` in your frontend route.
5. Configure `apiBaseUrl` and optional auth token provider.

## API Endpoints

Assuming router mounted at `/api/smartwatch`:

- `GET /v1/metrics/latest?userId=<id>`
- `GET /v1/metrics/history?userId=<id>&metricType=<type>&from=<iso>&to=<iso>`
- `POST /v1/metrics`
- `POST /v1/sync`

### Request: `POST /v1/metrics`

```json
{
  "userId": "user-123",
  "metricType": "heart_rate",
  "value": 72,
  "unit": "bpm",
  "recordedAt": "2026-03-27T10:00:00.000Z",
  "source": "watch"
}
```

### Request: `POST /v1/sync`

```json
{
  "userId": "user-123",
  "provider": "mock"
}
```

## Example Repository Injection

```js
import { createSmartwatchFeature } from "./smartwatchfeature/backend/src/index.js";

const customRepository = {
  async insert(record) {
    // Persist record in your DB
    return record;
  },
  async findLatestByUser(userId) {
    return [];
  },
  async findHistory(query) {
    return [];
  },
};

const { router } = createSmartwatchFeature({ repository: customRepository });
```

## Notes

- The backend uses constructor injection and clean interfaces.
- The default repository is in-memory for local testing.
- Replace the sync implementation with your real provider client (Google Fit, Apple Health, etc.) in `backend/src/services/smartwatchService.js`.
