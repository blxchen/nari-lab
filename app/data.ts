export type TrackPoint = {
  hour: number;
  lat: number;
  lon: number;
  wind: number;
  pressure: number;
  rain: number;
};

export type Storm = {
  id: string;
  name: string;
  year: number;
  basin: string;
  category: string;
  maxWind: number;
  minPressure: number;
  movement: string;
  radius: number;
  landfall: string;
  color: string;
  track: TrackPoint[];
};

const makeTrack = (
  startLat: number,
  startLon: number,
  winds: number[],
  pressures: number[],
  dLat: number,
  dLon: number,
): TrackPoint[] => winds.map((wind, i) => ({
  hour: i * 12,
  lat: +(startLat + dLat * i + Math.sin(i * .8) * .35).toFixed(1),
  lon: +(startLon + dLon * i + Math.cos(i * .7) * .28).toFixed(1),
  wind,
  pressure: pressures[i],
  rain: Math.round(65 + wind * 1.55 + Math.sin(i) * 18),
}));

export const storms: Storm[] = [
  {
    id: 'nari-2025', name: 'NARI', year: 2025, basin: 'WESTERN PACIFIC', category: 'CATEGORY 4',
    maxWind: 132, minPressure: 918, movement: 'NW · 14 kt', radius: 168,
    landfall: 'MODEL SCENARIO · EAST OF TAIWAN', color: '#0085ca',
    track: makeTrack(13.8, 137.6, [55, 68, 84, 102, 121, 132, 128, 116, 101], [992, 982, 969, 951, 931, 918, 924, 940, 958], 1.05, -1.08),
  },
  {
    id: 'haiyan-2013', name: 'HAIYAN', year: 2013, basin: 'WESTERN PACIFIC', category: 'CATEGORY 5',
    maxWind: 170, minPressure: 895, movement: 'WNW · 21 kt', radius: 140,
    landfall: 'GUIUAN, EASTERN SAMAR', color: '#f26b3a',
    track: makeTrack(6.2, 148.5, [45, 65, 90, 120, 150, 170, 165, 145, 115], [1000, 985, 965, 940, 910, 895, 900, 925, 955], .72, -2.4),
  },
  {
    id: 'tip-1979', name: 'TIP', year: 1979, basin: 'WESTERN PACIFIC', category: 'CATEGORY 5',
    maxWind: 165, minPressure: 870, movement: 'NNE · 9 kt', radius: 600,
    landfall: 'HONSHU, JAPAN', color: '#7183d7',
    track: makeTrack(7.3, 156.1, [35, 55, 80, 110, 140, 165, 150, 120, 85], [1005, 990, 970, 940, 900, 870, 900, 945, 975], 1.42, -.86),
  },
  {
    id: 'meranti-2016', name: 'MERANTI', year: 2016, basin: 'WESTERN PACIFIC', category: 'CATEGORY 5',
    maxWind: 170, minPressure: 890, movement: 'WNW · 17 kt', radius: 125,
    landfall: 'ITBAYAT / XIAMEN', color: '#f2b544',
    track: makeTrack(12.7, 139.8, [40, 65, 95, 125, 155, 170, 155, 120, 75], [1002, 987, 962, 935, 905, 890, 910, 950, 982], .83, -1.82),
  },
  {
    id: 'mangkhut-2018', name: 'MANGKHUT', year: 2018, basin: 'WESTERN PACIFIC', category: 'CATEGORY 5',
    maxWind: 155, minPressure: 905, movement: 'W · 18 kt', radius: 220,
    landfall: 'BAGGAO, CAGAYAN', color: '#4fbf9f',
    track: makeTrack(12.2, 150.7, [50, 70, 95, 125, 145, 155, 145, 120, 90], [997, 983, 965, 938, 918, 905, 919, 945, 970], .42, -2.2),
  },
];

export function modelStorm(params: {
  name: string; lat: number; lon: number; sst: number; heat: number; shear: number; humidity: number; wind: number;
}): Storm {
  const mpi = Math.max(30, Math.min(185,
    35 + (params.sst - 26) * 17 + params.heat * .42 - params.shear * 1.45 + (params.humidity - 65) * .35,
  ));
  let wind = params.wind;
  const track: TrackPoint[] = [];
  for (let i = 0; i <= 10; i++) {
    if (i > 0) {
      const growth = .10 * wind * (1 - wind / mpi);
      const cooling = Math.max(0, wind - 110) * .014 + params.shear * .025;
      wind = Math.max(25, Math.min(mpi, wind + growth - cooling));
    }
    const pressure = 1013 - .32 * wind - .0028 * wind * wind;
    track.push({
      hour: i * 12,
      lat: +(params.lat + i * .72 + Math.sin(i * .62) * .4).toFixed(1),
      lon: +(params.lon - i * 1.1 + Math.cos(i * .55) * .25).toFixed(1),
      wind: Math.round(wind),
      pressure: Math.round(pressure),
      rain: Math.round(50 + wind * 1.5 + params.humidity * .4),
    });
  }
  const maxWind = Math.max(...track.map((p) => p.wind));
  return {
    id: `custom-${Date.now()}`,
    name: params.name.trim().toUpperCase() || 'UNTITLED',
    year: 2026,
    basin: 'CUSTOM PHYSICS RUN',
    category: maxWind >= 137 ? 'CATEGORY 5' : maxWind >= 113 ? 'CATEGORY 4' : maxWind >= 96 ? 'CATEGORY 3' : maxWind >= 83 ? 'CATEGORY 2' : maxWind >= 64 ? 'CATEGORY 1' : 'TROPICAL STORM',
    maxWind,
    minPressure: Math.min(...track.map((p) => p.pressure)),
    movement: 'NW · 13 kt', radius: Math.round(70 + maxWind * .72),
    landfall: 'USER-GENERATED SCENARIO', color: '#0085ca', track,
  };
}

export const sourceLinks = [
  ['NOAA IBTrACS v4r01', 'https://www.ncei.noaa.gov/products/international-best-track-archive'],
  ['NOAA Tropical Cyclone Heat Potential', 'https://www.aoml.noaa.gov/phod/cyclone/'],
  ['WMO Global Guide to TC Forecasting', 'https://cyclone.wmo.int/pdf/Chapter-Eleven.pdf'],
  ['NOAA Hurricane Analysis & Forecast System', 'https://www.emc.ncep.noaa.gov/HAFS/'],
];
