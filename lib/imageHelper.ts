const DISH_IMAGE_MAP: Record<string, string> = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  pasta: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80',
  biryani: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80',
  thali: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80',
  paratha: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80',
  dosa: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
  maggi: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&q=80',
  noodles: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  manchurian: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  pakora: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
  samosa: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
  shake: 'https://images.unsplash.com/photo-1571556094541-01beeb958ce7?w=600&q=80',
  lassi: 'https://images.unsplash.com/photo-1571556094541-01beeb958ce7?w=600&q=80',
  chai: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  cake: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
  sweet: 'https://images.unsplash.com/photo-1551024506-0cb4a161405a?w=600&q=80',
  halwa: 'https://images.unsplash.com/photo-1551024506-0cb4a161405a?w=600&q=80',
  jalebi: 'https://images.unsplash.com/photo-1551024506-0cb4a161405a?w=600&q=80',
  fries: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&q=80',
  roll: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&q=80',
  wrap: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&q=80',
  paneer: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80',
  chicken: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
};

export const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';

export function getFoodImage(name?: string, currentUrl?: string | null): string {
  if (currentUrl && currentUrl.trim() !== '') return currentUrl;
  if (!name) return DEFAULT_FOOD_IMAGE;
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(DISH_IMAGE_MAP)) {
    if (lower.includes(key)) return url;
  }
  return DEFAULT_FOOD_IMAGE;
}
