export interface StateLocationData {
  state: string;
  districts: {
    district: string;
    cities: string[];
  }[];
}

export const LOCATIONS_DATA: StateLocationData[] = [
  {
    state: 'California',
    districts: [
      {
        district: 'Los Angeles County',
        cities: ['Los Angeles', 'Long Beach', 'Glendale', 'Pasadena', 'Santa Monica'],
      },
      {
        district: 'San Francisco County',
        cities: ['San Francisco', 'Mission District', 'Sunset District', 'Marina'],
      },
      {
        district: 'Orange County',
        cities: ['Anaheim', 'Santa Ana', 'Irvine', 'Huntington Beach'],
      },
      {
        district: 'San Diego County',
        cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido'],
      },
    ],
  },
  {
    state: 'Texas',
    districts: [
      {
        district: 'Harris County',
        cities: ['Houston', 'Pasadena', 'Baytown', 'Spring'],
      },
      {
        district: 'Dallas County',
        cities: ['Dallas', 'Irving', 'Garland', 'Richardson'],
      },
      {
        district: 'Travis County',
        cities: ['Austin', 'Pflugerville', 'Lakeway', 'Bee Cave'],
      },
    ],
  },
  {
    state: 'New York',
    districts: [
      {
        district: 'New York County (Manhattan)',
        cities: ['Midtown', 'Upper East Side', 'Harlem', 'Downtown'],
      },
      {
        district: 'Kings County (Brooklyn)',
        cities: ['Brooklyn Heights', 'Williamsburg', 'Bushwick', 'Flatbush'],
      },
      {
        district: 'Queens County',
        cities: ['Astoria', 'Flushing', 'Long Island City', 'Forest Hills'],
      },
    ],
  },
  {
    state: 'Illinois',
    districts: [
      {
        district: 'Cook County',
        cities: ['Chicago', 'Evanston', 'Skokie', 'Oak Park'],
      },
      {
        district: 'DuPage County',
        cities: ['Naperville', 'Wheaton', 'Downers Grove'],
      },
    ],
  },
  {
    state: 'Washington',
    districts: [
      {
        district: 'King County',
        cities: ['Seattle', 'Bellevue', 'Redmond', 'Renton'],
      },
      {
        district: 'Pierce County',
        cities: ['Tacoma', 'Lakewood', 'Puyallup'],
      },
    ],
  },
];
