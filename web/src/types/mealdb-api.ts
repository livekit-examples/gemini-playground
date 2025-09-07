// TheMealDB API response types
// Based on the API documentation from www.themealdb.com

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
  strSource?: string;
  strImageSource?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
}

export interface MealDBSearchResponse {
  meals: MealDBMeal[] | null;
}

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDBCategoriesResponse {
  categories: MealDBCategory[];
}

export interface MealDBArea {
  strArea: string;
}

export interface MealDBAreasResponse {
  meals: MealDBArea[];
}

export interface MealDBIngredient {
  idIngredient: string;
  strIngredient: string;
  strDescription?: string;
  strType?: string;
}

export interface MealDBIngredientsResponse {
  meals: MealDBIngredient[];
}

// Simplified meal for list views (when filtering by category, area, or ingredient)
export interface MealDBMealPreview {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface MealDBMealPreviewResponse {
  meals: MealDBMealPreview[] | null;
}

// API endpoints configuration
export const MEALDB_ENDPOINTS = {
  BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
  SEARCH_BY_NAME: (name: string) => `/search.php?s=${encodeURIComponent(name)}`,
  SEARCH_BY_LETTER: (letter: string) => `/search.php?f=${letter}`,
  LOOKUP_BY_ID: (id: string) => `/lookup.php?i=${id}`,
  RANDOM_MEAL: '/random.php',
  CATEGORIES: '/categories.php',
  LIST_CATEGORIES: '/list.php?c=list',
  LIST_AREAS: '/list.php?a=list',
  LIST_INGREDIENTS: '/list.php?i=list',
  FILTER_BY_INGREDIENT: (ingredient: string) => `/filter.php?i=${encodeURIComponent(ingredient)}`,
  FILTER_BY_CATEGORY: (category: string) => `/filter.php?c=${encodeURIComponent(category)}`,
  FILTER_BY_AREA: (area: string) => `/filter.php?a=${encodeURIComponent(area)}`,
} as const;

// Helper types for our app
export interface RecipeSearchFilters {
  query?: string;
  category?: string;
  area?: string;
  ingredient?: string;
  letter?: string;
}

export interface RecipeBrowseOptions {
  showRandom?: boolean;
  showCategories?: boolean;
  showAreas?: boolean;
  showIngredients?: boolean;
}
