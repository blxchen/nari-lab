# NARI LAB

A cinematic, physics-driven typhoon laboratory for exploring historical storms and creating custom 120-hour simulations.

## Features

- Hardware-accelerated WebGL Earth with atmospheric scattering, cloud shell, storm particles, drag rotation, and scroll zoom
- Historical Western Pacific storm archive based on NOAA IBTrACS
- Custom typhoon generator with sea-surface temperature, ocean heat, shear, humidity, and initial-wind controls
- Device-local data collection with manual observations and validated CSV/JSON imports
- Wind, pressure, and rainfall analysis with downloadable PNG, CSV, and JSON outputs
- Adaptive pixel density, off-screen pausing, reduced-motion support, and lazy-loaded 3D rendering
- Interactive physics lab explaining potential intensity, gradient-wind balance, and intensity tendency

> NARI LAB is an educational reduced-order model. It is not an operational forecast and must not be used for safety decisions.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Scientific data

Historical peak values are curated from [NOAA IBTrACS v4r01](https://www.ncei.noaa.gov/products/international-best-track-archive). Compact track points are illustrative resamples for this interface. The Physics Lab links to NOAA and WMO source material.
