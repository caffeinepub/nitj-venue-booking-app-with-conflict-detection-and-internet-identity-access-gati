// Complete list of venues for the NITJ booking system
export const VENUES = [
  'LT 101',
  'LT 102',
  'LT 103',
  'LT 104',
  'LT 201',
  'LT 202',
  'LT 203',
  'LT 204',
  'LT 301',
  'LT 302',
  'LT 303',
  'LT 304',
  'LT 401',
  'LT 402',
  'LT 403',
  'LT 404',
  'IT Park',
  'Main Ground',
  'Community Center',
] as const;

export type Venue = typeof VENUES[number];
