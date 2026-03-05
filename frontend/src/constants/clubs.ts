// Complete list of clubs for the NITJ booking system
export const CLUBS = [
  'APOGEE',
  'GDSC-Google Developer Student Club',
  'SOME',
  'StrataBiz',
  'Vortex Photography and Movie',
  'Social Works & Rural Activity',
  'Website Development & Management',
  'Yodha',
  'Yoga & Meditation',
  'Team Cultural Affairs (TCA)',
  'Aarogya',
  'Chetna',
  'Dance',
  'Ek Bharat Shrestha Bharat',
  'Fashion & Modelling',
  'Finance Society NITJ',
  'Fine Art Society',
  'Food & Flavour',
  'Green',
  'Media cell',
  'Music',
  'NCC',
  'Regional Language',
  'Sanskriti',
  'SPIC MACAY',
  'SARC',
] as const;

export const OTHERS_OPTION = 'Others';

export type Club = typeof CLUBS[number] | typeof OTHERS_OPTION;

// Helper to get all club options including "Others"
export function getClubOptions(): string[] {
  return [...CLUBS, OTHERS_OPTION];
}
