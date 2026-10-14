// Curated high-resolution agricultural harvest imagery for Sri Lankan produce
export const CROP_DEFAULT_IMAGES = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
  amba: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
  kesel: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
  thakkali: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
  ala: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600',
  gowa: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600',
  pumpkin: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600',
  wattakka: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600',
  leek: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=600',
  bean: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600',
  bonchi: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
  lunu: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
  papaya: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600',
  papol: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600',
  watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
  cucumber: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600',
  ginger: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600',
  inguru: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600',
  miris: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600',
  default: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
};

/**
 * Returns a guaranteed valid image URI.
 * If user uploaded a persistent base64 data URI or valid external https URL, returns it.
 * If photoUrl is missing, or is a dead session URL (blob: or file:), intelligently returns
 * the matching crop image by analyzing the crop name.
 */
export function getCropImage(cropName = '', photoUrl = '') {
  // 1. Check if user provided a persistent base64 image (starts with data:image/)
  if (typeof photoUrl === 'string' && photoUrl.startsWith('data:image/')) {
    return photoUrl;
  }

  // 2. Check if user provided a valid persistent web URL (starts with http/https AND not a blob URL)
  if (
    typeof photoUrl === 'string' &&
    (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) &&
    !photoUrl.includes('blob:')
  ) {
    return photoUrl;
  }

  // 3. Fallback: match crop name
  const name = String(cropName || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(CROP_DEFAULT_IMAGES)) {
    if (key !== 'default' && name.includes(key)) {
      return url;
    }
  }

  return CROP_DEFAULT_IMAGES.default;
}
