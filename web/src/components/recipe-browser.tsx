"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Recipe } from "@/data/recipe-types";
import { mealDBApi, MealDBApiError } from "@/services/mealdb-api";
import { transformMealDBPreviewsToRecipes, transformMealDBToRecipePreviews } from "@/utils/mealdb-transformer";
import { useSignatureRecipes } from "@/hooks/use-signature-recipes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Clock, 
  Users, 
  ChefHat, 
  Shuffle, 
  Globe, 
  Tag,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronsLeft,
  ChevronsRight,
  X
} from "lucide-react";

interface RecipeBrowserProps {
  onRecipeSelected: (recipe: Recipe) => void;
}

interface BrowseState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

interface TabState {
  signature: {
    loaded: boolean; // Signature recipes are managed by the hook, not tabState
  };
  random: {
    recipes: Recipe[];
    loaded: boolean;
  };
  categories: {
    allRecipes: Recipe[]; // Store all recipes from API
    loaded: boolean;
    pagination: PaginationState;
  };
  countries: {
    allRecipes: Recipe[]; // Store all recipes from API
    loaded: boolean;
    pagination: PaginationState;
  };
  search: {
    allRecipes: Recipe[]; // Store all search results
    loaded: boolean;
    pagination: PaginationState;
    query: string; // Store the search query
  };
}

export function RecipeBrowser({ onRecipeSelected }: RecipeBrowserProps) {
  
  // Main browse state - this will be the single source of truth
  const [browseState, setBrowseState] = useState<BrowseState>({
    recipes: [],
    loading: true, // Start loading since we default to signature tab
    error: null,
    hasSearched: false,
  });
  
  // Signature recipes hook - only used for signature tab
  const { 
    recipes: signatureRecipes, 
    loading: signatureLoading, 
    error: signatureError,
    isAvailable: isFirebaseAvailable,
    refreshRecipes: refreshSignatureRecipes
  } = useSignatureRecipes();
  
  // Tab-specific data storage
  const [tabState, setTabState] = useState<TabState>({
    signature: { loaded: false }, // Will be loaded by hook
    random: { recipes: [], loaded: false },
    categories: { 
      allRecipes: [], 
      loaded: false, 
      pagination: { currentPage: 1, itemsPerPage: 8, totalItems: 0 }
    },
    countries: { 
      allRecipes: [], 
      loaded: false, 
      pagination: { currentPage: 1, itemsPerPage: 8, totalItems: 0 }
    },
    search: {
      allRecipes: [],
      loaded: false,
      pagination: { currentPage: 1, itemsPerPage: 8, totalItems: 0 },
      query: ''
    },
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [activeTab, setActiveTab] = useState("signature");
  
  // Ref for scrolling to recipe grid
  const recipeGridRef = useRef<HTMLDivElement>(null);

  // Handle tab switching with loading reset
  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      // Reset loading state when switching tabs
      updateBrowseState({
        recipes: [],
        loading: newTab === 'signature' ? signatureLoading : false, // Show loading for signature tab if it's still loading
        error: null,
        hasSearched: false,
      });
      setActiveTab(newTab);
    }
  };

  // Load categories and areas on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesData, areasData] = await Promise.all([
          mealDBApi.getCategories(),
          mealDBApi.getAreas(),
        ]);
        
        setCategories(categoriesData.categories.map(cat => cat.strCategory));
        setAreas(areasData);
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    };

    loadFilters();
  }, []);

  const updateBrowseState = useCallback((update: Partial<BrowseState>) => {
    setBrowseState(prev => ({ ...prev, ...update }));
  }, []);

  // Helper function to get paginated recipes
  const getPaginatedRecipes = useCallback((allRecipes: Recipe[], pagination: PaginationState): Recipe[] => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return allRecipes.slice(startIndex, endIndex);
  }, []);

  const loadRandomRecipes = useCallback(async () => {
    // Don't load if already loaded or currently loading
    if (tabState.random.loaded || browseState.loading) {
      return;
    }
    
    updateBrowseState({ loading: true, error: null });
    
    try {
      const meals = await mealDBApi.getRandomMeals(8);
      const recipes = transformMealDBToRecipePreviews(meals); // Use preview format for consistency
      
      // Update tab state
      setTabState(prev => ({
        ...prev,
        random: { recipes, loaded: true }
      }));
      
      // Update browse state if currently on random tab
      if (activeTab === "random") {
        updateBrowseState({ 
          recipes, 
          loading: false, 
          hasSearched: true 
        });
      } else {
        updateBrowseState({ loading: false });
      }
    } catch (error) {
      
      const errorMessage = error instanceof MealDBApiError ? error.message : 'Failed to load random recipes';
      updateBrowseState({ 
        loading: false, 
        error: errorMessage,
        hasSearched: true 
      });
      console.error('Failed to load random recipes:', error);
    }
  }, [activeTab, updateBrowseState]);

  // Load random recipes on initial mount only
  useEffect(() => {
    if (activeTab === "random" && !tabState.random.loaded && !browseState.loading) {
      loadRandomRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tabState.random.loaded, browseState.loading]);

  // Handle signature recipes loading
  useEffect(() => {
    if (activeTab === 'signature') {
      updateBrowseState({
        recipes: signatureRecipes,
        loading: signatureLoading,
        error: signatureError,
        hasSearched: true,
      });
      
      // Update tab state when signature recipes are loaded
      if (!signatureLoading && signatureRecipes.length > 0) {
        setTabState(prev => ({
          ...prev,
          signature: { loaded: true }
        }));
      }
    }
  }, [activeTab, signatureRecipes, signatureLoading, signatureError]);

  // Handle tab switching and loading
  useEffect(() => {
    // Skip if we're showing search results
    if (tabState.search.loaded && tabState.search.query === searchQuery.trim()) {
      const recipes = getPaginatedRecipes(tabState.search.allRecipes, tabState.search.pagination);
      updateBrowseState({
        recipes,
        hasSearched: true,
        loading: false,
        error: null,
      });
      return;
    }

    // Handle non-signature tabs
    if (activeTab !== 'signature') {
      const currentTabData = tabState[activeTab as keyof TabState];
      
      if (currentTabData.loaded) {
        let recipes: Recipe[];
        
        if (activeTab === 'random') {
          recipes = (currentTabData as typeof tabState.random).recipes;
        } else {
          const paginatedTabData = currentTabData as typeof tabState.categories | typeof tabState.countries;
          recipes = getPaginatedRecipes(paginatedTabData.allRecipes, paginatedTabData.pagination);
        }
        
        updateBrowseState({
          recipes,
          hasSearched: true,
          loading: false,
          error: null,
        });
      } else {
        // Show loading state for unloaded tabs
        updateBrowseState({
          recipes: [],
          hasSearched: false,
          loading: false,
          error: null,
        });
      }
    }
  }, [activeTab, tabState.search.loaded, tabState.search.query, tabState.search.pagination.currentPage, tabState.random.loaded, tabState.categories.loaded, tabState.categories.pagination.currentPage, tabState.countries.loaded, tabState.countries.pagination.currentPage, searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Clear other filters when searching
    setSelectedCategory("");
    setSelectedArea("");
    
    // Clear other filter states
    setTabState(prev => ({
      ...prev,
      categories: { ...prev.categories, loaded: false },
      countries: { ...prev.countries, loaded: false }
    }));
    
    updateBrowseState({ loading: true, error: null });
    
    try {
      const meals = await mealDBApi.searchByName(searchQuery.trim());
      const allRecipes = transformMealDBToRecipePreviews(meals); // Use preview format
      
      // Update search state with all results and reset pagination
      const newPagination: PaginationState = {
        currentPage: 1,
        itemsPerPage: 8,
        totalItems: allRecipes.length
      };
      
      setTabState(prev => ({
        ...prev,
        search: { 
          allRecipes, 
          loaded: true, 
          pagination: newPagination,
          query: searchQuery.trim()
        }
      }));
      
      // The useEffect will handle updating browseState with paginated results
      updateBrowseState({ 
        loading: false, 
        hasSearched: true 
      });
    } catch (error) {
      updateBrowseState({ 
        loading: false, 
        error: error instanceof MealDBApiError ? error.message : 'Search failed',
        hasSearched: true 
      });
    }
  };

  const handleCategoryFilter = async (category: string) => {
    // Clear other filters when selecting a category
    setSelectedArea("");
    setSearchQuery("");
    setSelectedCategory(category);
    
    // Clear other filter states
    setTabState(prev => ({
      ...prev,
      search: { ...prev.search, loaded: false, query: '' },
      countries: { ...prev.countries, loaded: false }
    }));
    
    updateBrowseState({ loading: true, error: null });
    
    try {
      const mealPreviews = await mealDBApi.filterByCategory(category);
      const allRecipes = transformMealDBPreviewsToRecipes(mealPreviews);
      
      // Update tab state with all recipes and reset pagination
      const newPagination: PaginationState = {
        currentPage: 1,
        itemsPerPage: 8,
        totalItems: allRecipes.length
      };
      
      setTabState(prev => ({
        ...prev,
        categories: { 
          allRecipes, 
          loaded: true, 
          pagination: newPagination 
        }
      }));
      
      // The useEffect will handle updating browseState with paginated recipes
      updateBrowseState({ 
        loading: false, 
        hasSearched: true 
      });
    } catch (error) {
      updateBrowseState({ 
        loading: false, 
        error: error instanceof MealDBApiError ? error.message : 'Failed to load category recipes',
        hasSearched: true 
      });
    }
  };

  const handleAreaFilter = async (area: string) => {
    // Clear other filters when selecting an area
    setSelectedCategory("");
    setSearchQuery("");
    setSelectedArea(area);
    
    // Clear other filter states
    setTabState(prev => ({
      ...prev,
      search: { ...prev.search, loaded: false, query: '' },
      categories: { ...prev.categories, loaded: false }
    }));
    
    updateBrowseState({ loading: true, error: null });
    
    try {
      const mealPreviews = await mealDBApi.filterByArea(area);
      const allRecipes = transformMealDBPreviewsToRecipes(mealPreviews);
      
      // Update tab state with all recipes and reset pagination
      const newPagination: PaginationState = {
        currentPage: 1,
        itemsPerPage: 8,
        totalItems: allRecipes.length
      };
      
      setTabState(prev => ({
        ...prev,
        countries: { 
          allRecipes, 
          loaded: true, 
          pagination: newPagination 
        }
      }));
      
      // The useEffect will handle updating browseState with paginated recipes
      updateBrowseState({ 
        loading: false, 
        hasSearched: true 
      });
    } catch (error) {
      updateBrowseState({ 
        loading: false, 
        error: error instanceof MealDBApiError ? error.message : 'Failed to load area recipes',
        hasSearched: true 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number, tabType: 'categories' | 'countries' | 'search') => {
    setTabState(prev => ({
      ...prev,
      [tabType]: {
        ...prev[tabType],
        pagination: {
          ...prev[tabType].pagination,
          currentPage: newPage
        }
      }
    }));
    
    // Scroll to the top of the recipe grid after page change
    setTimeout(() => {
      if (recipeGridRef.current) {
        recipeGridRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100); // Small delay to ensure state update
  }, []);

  const getCurrentPagination = useCallback((): PaginationState | null => {
    // If we have search results, show search pagination
    if (tabState.search.loaded && tabState.search.query === searchQuery.trim()) {
      return tabState.search.pagination;
    }
    
    // Otherwise show tab-specific pagination
    if (activeTab === 'categories' && tabState.categories.loaded) {
      return tabState.categories.pagination;
    } else if (activeTab === 'countries' && tabState.countries.loaded) {
      return tabState.countries.pagination;
    }
    return null;
  }, [activeTab, tabState, searchQuery]);

  // Get current pagination context (search takes priority)
  const getCurrentPaginationContext = useCallback((): 'search' | 'categories' | 'countries' | null => {
    if (tabState.search.loaded && tabState.search.query === searchQuery.trim()) {
      return 'search';
    }
    if (activeTab === 'categories' && tabState.categories.loaded) {
      return 'categories';
    }
    if (activeTab === 'countries' && tabState.countries.loaded) {
      return 'countries';
    }
    return null;
  }, [activeTab, tabState, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedArea("");
    setSearchQuery("");
    // Clear search results from tab state
    setTabState(prev => ({
      ...prev,
      search: { ...prev.search, loaded: false, query: '' }
    }));
    updateBrowseState({ 
      recipes: [], 
      hasSearched: false, 
      error: null 
    });
  };

  const removeSearchFilter = () => {
    setSearchQuery("");
    // Clear search results from tab state
    setTabState(prev => ({
      ...prev,
      search: { ...prev.search, loaded: false, query: '' }
    }));
    // This will trigger the useEffect to show tab content instead
  };

  const removeCategoryFilter = () => {
    setSelectedCategory("");
    // Clear categories tab data to force reload when switching back
    setTabState(prev => ({
      ...prev,
      categories: { ...prev.categories, loaded: false }
    }));
    // Return to default tab state
    updateBrowseState({
      recipes: [],
      hasSearched: false,
      loading: false,
      error: null,
    });
  };

  const removeAreaFilter = () => {
    setSelectedArea("");
    // Clear countries tab data to force reload when switching back
    setTabState(prev => ({
      ...prev,
      countries: { ...prev.countries, loaded: false }
    }));
    // Return to default tab state
    updateBrowseState({
      recipes: [],
      hasSearched: false,
      loading: false,
      error: null,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-primary mb-2">All You Can Cook</h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={!searchQuery.trim() || browseState.loading}>
          {browseState.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Browse Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col flex-grow overflow-hidden">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="signature" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Signature
          </TabsTrigger>
          <TabsTrigger value="random" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Random
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="countries" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Countries
          </TabsTrigger>
        </TabsList>

        {/* Shared Header Section */}
        <div className="flex justify-between mb-1 flex-shrink-0 mt-2 ml-2">
          {activeTab === 'signature' && (
            <>
              <h3 className="text-lg font-semibold">Signature Recipes</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshSignatureRecipes}
                disabled={signatureLoading}
              >
                {signatureLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </>
          )}
          {activeTab === 'random' && (
            <>
              <h3 className="text-lg font-semibold">Random Recipes</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setTabState(prev => ({
                    ...prev,
                    random: { ...prev.random, loaded: false }
                  }));
                  setTimeout(() => {
                    loadRandomRecipes();
                  }, 10);
                }}
                disabled={browseState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${browseState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </>
          )}
          {activeTab === 'categories' && (
            <h3 className="text-lg font-semibold">Browse by Category</h3>
          )}
          {activeTab === 'countries' && (
            <h3 className="text-lg font-semibold">Browse by Country</h3>
          )}
        </div>

        {/* Active Filter Section - Only show for Categories/Countries with active filters */}
        {((activeTab === 'categories' && selectedCategory) || (activeTab === 'countries' && selectedArea)) && (
          <div className="flex items-center gap-2 flex-wrap mb-4 flex-shrink-0 ml-2">
            <span className="text-sm text-muted-foreground">Active filter:</span>
            {activeTab === 'categories' && selectedCategory && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1"
                onClick={removeCategoryFilter}
              >
                Category: {selectedCategory}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {activeTab === 'countries' && selectedArea && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1"
                onClick={removeAreaFilter}
              >
                Country: {selectedArea}
                <X className="h-3 w-3" />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Shared Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {/* Category/Country Selection - Only show when no filter is active */}
              {activeTab === 'categories' && !selectedCategory && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      className="h-12 text-sm font-medium"
                      onClick={() => handleCategoryFilter(category)}
                      disabled={browseState.loading}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              )}
              
              {activeTab === 'countries' && !selectedArea && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
                  {areas.map((area) => (
                    <Button
                      key={area}
                      variant="outline"
                      size="sm"
                      className="h-12 text-sm font-medium"
                      onClick={() => handleAreaFilter(area)}
                      disabled={browseState.loading}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              )}

              {/* Recipe Content Area - Show for all tabs when appropriate */}
              {(activeTab === 'signature' || 
                activeTab === 'random' || 
                (activeTab === 'categories' && selectedCategory) || 
                (activeTab === 'countries' && selectedArea)) && (
                <>
                  {/* Error States */}
                  {browseState.error && (
                    <Card className="border-destructive">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span>{browseState.error}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Signature Error State */}
                  {activeTab === 'signature' && signatureError && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Signature Recipes</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        {!isFirebaseAvailable 
                          ? "Firebase is not configured. Signature recipes are not available." 
                          : signatureError
                        }
                      </p>
                      {isFirebaseAvailable && (
                        <Button variant="outline" onClick={refreshSignatureRecipes}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Loading States */}
                  {(browseState.loading || (activeTab === 'signature' && signatureLoading)) && (
                    <div className="flex justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading recipes...</span>
                      </div>
                    </div>
                  )}

                  {/* No recipes found */}
                  {((browseState.hasSearched && !browseState.loading && browseState.recipes.length === 0 && !browseState.error && activeTab !== 'signature') ||
                    (activeTab === 'signature' && !signatureError && !signatureLoading && signatureRecipes.length === 0)) && (
                    <div className="text-center py-8">
                      <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
                      <p className="text-muted-foreground">
                        {activeTab === 'signature' 
                          ? (!isFirebaseAvailable 
                              ? "Firebase is not configured to load signature recipes." 
                              : "There are no signature recipes available at the moment.")
                          : activeTab === 'random'
                          ? "Try refreshing to get new random recipes."
                          : "Try selecting a different option."
                        }
                      </p>
                      {activeTab === 'signature' && isFirebaseAvailable && (
                        <Button variant="outline" onClick={refreshSignatureRecipes} className="mt-4">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Check Again
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Signature Recipes Grid */}
                  {activeTab === 'signature' && !signatureError && !signatureLoading && signatureRecipes.length > 0 && (
                    <div ref={recipeGridRef} className="space-y-4">
                      {signatureRecipes.map((recipe) => (
                        <Card
                          key={recipe.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-border"
                          onClick={() => onRecipeSelected(recipe)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {recipe.imageUrl && (
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                  <img
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 space-y-2">
                                <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {recipe.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {recipe.totalTime && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{recipe.totalTime}m</span>
                                    </div>
                                  )}
                                  {recipe.servings && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{recipe.servings}</span>
                                    </div>
                                  )}
                                  {recipe.difficulty && (
                                    <Badge 
                                      variant={
                                        recipe.difficulty === 'Easy' ? 'default' :
                                        recipe.difficulty === 'Medium' ? 'secondary' : 'destructive'
                                      }
                                      className="text-xs"
                                    >
                                      {recipe.difficulty}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    Signature
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {recipe.tags.slice(0, 4).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Other Recipe Grids (Random, Categories, Countries) */}
                  {browseState.recipes.length > 0 && activeTab !== 'signature' && (
                    <>
                      <div ref={recipeGridRef} className="space-y-4">
                        {browseState.recipes.map((recipe) => (
                          <Card
                            key={recipe.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => onRecipeSelected(recipe)}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg overflow-hidden">
                                  {recipe.imageUrl ? (
                                    <img
                                      src={recipe.imageUrl}
                                      alt={recipe.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ChefHat className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {recipe.totalTime && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{recipe.totalTime}m</span>
                                      </div>
                                    )}
                                    {recipe.servings && (
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{recipe.servings}</span>
                                      </div>
                                    )}
                                    {recipe.difficulty && (
                                      <Badge 
                                        variant={
                                          recipe.difficulty === 'Easy' ? 'default' :
                                          recipe.difficulty === 'Medium' ? 'secondary' : 'destructive'
                                        }
                                        className="text-xs"
                                      >
                                        {recipe.difficulty}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {recipe.tags.slice(0, 4).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {recipe.tags.length > 4 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{recipe.tags.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {(() => {
                        const pagination = getCurrentPagination();
                        if (!pagination || pagination.totalItems <= pagination.itemsPerPage) return null;
                        
                        const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
                        const currentPage = pagination.currentPage;
                        const paginationContext = getCurrentPaginationContext();
                        
                        if (!paginationContext) return null;
                        
                        return (
                          <div className="pt-4 space-y-3">
                            <div className="text-xs text-muted-foreground text-center">
                              Showing {((currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} recipes
                            </div>
                            
                            <div className="flex items-center justify-center gap-0.5 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(1, paginationContext)}
                                disabled={currentPage <= 1}
                                className="h-8 px-1.5 text-xs"
                              >
                                <ChevronsLeft className="h-3 w-3" />
                                <span className="hidden md:inline ml-1">First</span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1, paginationContext)}
                                disabled={currentPage <= 1}
                                className="h-8 px-2 text-xs"
                              >
                                <span className="hidden sm:inline">Prev</span>
                                <span className="sm:hidden">‹</span>
                              </Button>
                              
                              <div className="flex items-center gap-0.5 mx-1">
                                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                  let pageNum;
                                  if (totalPages <= 3) {
                                    pageNum = i + 1;
                                  } else if (currentPage <= 2) {
                                    pageNum = i + 1;
                                  } else if (currentPage >= totalPages - 1) {
                                    pageNum = totalPages - 2 + i;
                                  } else {
                                    pageNum = currentPage - 1 + i;
                                  }
                                  
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={currentPage === pageNum ? "default" : "outline"}
                                      size="sm"
                                      className="w-7 h-8 p-0 text-xs"
                                      onClick={() => handlePageChange(pageNum, paginationContext)}
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1, paginationContext)}
                                disabled={currentPage >= totalPages}
                                className="h-8 px-2 text-xs"
                              >
                                <span className="hidden sm:inline">Next</span>
                                <span className="sm:hidden">›</span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(totalPages, paginationContext)}
                                disabled={currentPage >= totalPages}
                                className="h-8 px-1.5 text-xs"
                              >
                                <span className="hidden md:inline mr-1">Last</span>
                                <ChevronsRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </Tabs>

    </div>
  );
}