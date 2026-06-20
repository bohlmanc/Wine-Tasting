export const FRUIT_TYPES = [
  'Black Fruit',
  'Red Fruit',
  'Dried Fruit',
  'Tropical Fruit',
  'Tree Fruit',
  'Citrus Fruit',
];

export const FRUIT_ITEMS: Record<string, string[]> = {
  'Black Fruit': ['Black Cherry', 'Blackberry', 'Blueberry', 'Plum', 'Boysenberry', 'Black Currant', 'Olive'],
  'Red Fruit': ['Raspberry', 'Strawberry', 'Cherry', 'Cranberry', 'Red Currant', 'Pomegranate'],
  'Dried Fruit': ['Raisin', 'Fruitcake', 'Fig', 'Date', 'Fruit Leather'],
  'Tropical Fruit': ['Mango', 'Pineapple', 'Passion Fruit', 'Guava', 'Lychee', 'Banana', 'Honeydew', 'Kiwi', 'Papaya'],
  'Tree Fruit': ['Apple', 'Pear', 'Peach', 'Apricot', 'Nectarine', 'Quince'],
  'Citrus Fruit': ['Lemon', 'Lime', 'Orange', 'Grapefruit', 'Tangerine'],
};

export const HERB_ITEMS = ['Eucalyptus', 'Fennel', 'Mint', 'Oregano', 'Thyme', 'Basil', 'Rosemary'];

export const SPICE_ITEMS = ['Black Pepper', 'White Pepper', 'Cinnamon', 'Clove', 'Vanilla', 'Nutmeg', 'Anise', 'Cardamom', 'Cumin'];

export const EARTH_ITEMS = ['Mushroom', 'Bell Pepper', 'Forest Floor', 'Potting Soil', 'Tobacco', 'Leather', 'Smoke', 'Wet Stone', 'Gravel', 'Barnyard', 'Truffle'];

export const FLORAL_ITEMS = ['Lilac', 'Lavender', 'Rose', 'Jasmine', 'Honeysuckle', 'Perfume'];

export const OUTDOOR_ITEMS = [...EARTH_ITEMS, ...FLORAL_ITEMS];

export const OAK_ITEMS = ['Vanilla', 'Coconut', 'Cinnamon', 'Coffee', 'Chocolate', 'Smoke'];

export const OTHER_ITEMS = ['Toast', 'Butter', 'Dark Chocolate', 'Cedar', 'Flint', 'Honey', 'Cream', 'Brioche', 'Petrol', 'Mineral'];

export const ALL_PREDEFINED_AROMAS = new Set([
  ...Object.values(FRUIT_ITEMS).flat(),
  ...HERB_ITEMS,
  ...SPICE_ITEMS,
  ...OUTDOOR_ITEMS,
  ...OAK_ITEMS,
  ...OTHER_ITEMS,
]);
