// Normalize specific venue codes for display
const VENUE_NORMALIZATION_MAP: Record<string, string> = {
  'sb1': 'SB1',
  'sb2': 'SB2',
  'sb3': 'SB3',
  'a2': 'A2',
  'c4': 'C4',
  'c5': 'C5',
};

export function normalizeVenueLabel(venue: string): string {
  const lowerVenue = venue.toLowerCase();
  return VENUE_NORMALIZATION_MAP[lowerVenue] || venue;
}
