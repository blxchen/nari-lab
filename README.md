# NARI LAB

A cinematic, physics-driven typhoon laboratory for exploring historical storms and creating custom 120-hour simulations.

## Features

- Animated, draggable 3D-projected Earth with typhoon wind particles and forecast tracks
- Historical Western Pacific storm archive based on NOAA IBTrACS
- Custom typhoon generator with sea-surface temperature, ocean heat, shear, humidity, and initial-wind controls
- Wind, pressure, and rainfall analysis with downloadable PNG, CSV, and JSON outputs
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
