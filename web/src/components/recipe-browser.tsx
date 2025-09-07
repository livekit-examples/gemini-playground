"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Recipe } from "@/data/recipe-types";
import { mealDBApi, MealDBApiError } from "@/services/mealdb-api";
import { transformMealDBToRecipes, transformMealDBPreviewsToRecipes, transformMealDBToRecipePreviews } from "@/utils/mealdb-transformer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Clock, 
  Users, 
  ChefHat, 
  Shuffle, 
  Globe, 
  Tag,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronsLeft,
  ChevronsRight
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
}

export function RecipeBrowser({ onRecipeSelected }: RecipeBrowserProps) {
  const [browseState, setBrowseState] = useState<BrowseState>({
    recipes: [],
    loading: false,
    error: null,
    hasSearched: false,
  });

  const [tabState, setTabState] = useState<TabState>({
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
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [activeTab, setActiveTab] = useState("random");
  
  // Ref for scrolling to recipe grid
  const recipeGridRef = useRef<HTMLDivElement>(null);

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
    }
  }, [activeTab, updateBrowseState, setTabState]);

  // Load random recipes on initial mount only
  useEffect(() => {
    if (activeTab === "random" && !tabState.random.loaded) {
      loadRandomRecipes();
    }
  }, [activeTab, tabState.random.loaded, loadRandomRecipes]);

  // Update browseState when switching tabs or pagination changes
  useEffect(() => {
    const currentTabData = tabState[activeTab as keyof TabState];
    if (currentTabData.loaded) {
      let recipes: Recipe[];
      
      if (activeTab === 'random') {
        // Random tab doesn't use pagination
        recipes = (currentTabData as typeof tabState.random).recipes;
      } else {
        // Categories and countries use pagination
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
      // Clear recipes when switching to unloaded tab
      updateBrowseState({
        recipes: [],
        hasSearched: false,
        loading: false,
        error: null,
      });
    }
  }, [activeTab, tabState, updateBrowseState, getPaginatedRecipes]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    updateBrowseState({ loading: true, error: null });
    
    try {
      const meals = await mealDBApi.searchByName(searchQuery.trim());
      const recipes = transformMealDBToRecipes(meals);
      updateBrowseState({ 
        recipes, 
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
    setSelectedCategory(category);
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
    setSelectedArea(area);
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
  const handlePageChange = useCallback((newPage: number, tabType: 'categories' | 'countries') => {
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
    if (activeTab === 'categories' && tabState.categories.loaded) {
      return tabState.categories.pagination;
    } else if (activeTab === 'countries' && tabState.countries.loaded) {
      return tabState.countries.pagination;
    }
    return null;
  }, [activeTab, tabState]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedArea("");
    setSearchQuery("");
    updateBrowseState({ 
      recipes: [], 
      hasSearched: false, 
      error: null 
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Find Recipes</h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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

        {/* Random Recipes Tab */}
        <TabsContent value="random" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Random Recipes</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadRandomRecipes}
              disabled={browseState.loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${browseState.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter(category)}
                  disabled={browseState.loading}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Browse by Country</h3>
            <ScrollArea className="h-32">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {areas.map((area) => (
                  <Button
                    key={area}
                    variant={selectedArea === area ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAreaFilter(area)}
                    disabled={browseState.loading}
                    className="text-xs"
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      {/* Active Filters */}
      {(selectedCategory || selectedArea || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary">Search: {searchQuery}</Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary">Category: {selectedCategory}</Badge>
          )}
          {selectedArea && (
            <Badge variant="secondary">Country: {selectedArea}</Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Error State */}
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

      {/* Loading State */}
      {browseState.loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading recipes...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {browseState.hasSearched && !browseState.loading && browseState.recipes.length === 0 && !browseState.error && (
        <div className="text-center py-8">
          <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground">Try adjusting your search or browse different categories.</p>
        </div>
      )}

      {/* Recipe Grid */}
      {browseState.recipes.length > 0 && (
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
                    {/* Recipe Image */}
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

                    {/* Recipe Info */}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                      
                      {/* Recipe Stats */}
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

                      {/* Tags */}
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
            
            return (
              <div className="pt-4 space-y-3">
                {/* Recipe count info - smaller font, above pagination */}
                <div className="text-xs text-muted-foreground text-center">
                  Showing {((currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} recipes
                </div>
                
                {/* Pagination controls */}
                <div className="flex items-center justify-center gap-0.5 flex-wrap">
                  {/* First page button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1, activeTab as 'categories' | 'countries')}
                    disabled={currentPage <= 1}
                    className="h-8 px-1.5 text-xs"
                  >
                    <ChevronsLeft className="h-3 w-3" />
                    <span className="hidden md:inline ml-1">First</span>
                  </Button>
                  
                  {/* Previous button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1, activeTab as 'categories' | 'countries')}
                    disabled={currentPage <= 1}
                    className="h-8 px-2 text-xs"
                  >
                    <span className="hidden sm:inline">Prev</span>
                    <span className="sm:hidden">‹</span>
                  </Button>
                  
                  {/* Page numbers */}
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
                          onClick={() => handlePageChange(pageNum, activeTab as 'categories' | 'countries')}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Next button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1, activeTab as 'categories' | 'countries')}
                    disabled={currentPage >= totalPages}
                    className="h-8 px-2 text-xs"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">›</span>
                  </Button>
                  
                  {/* Last page button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages, activeTab as 'categories' | 'countries')}
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

      {/* Welcome message when no search has been performed */}
      {!browseState.hasSearched && !browseState.loading && (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Welcome to All You Can Cook!</h3>
          <p className="text-muted-foreground mb-6">
            Search for recipes, browse by category, or discover random dishes from around the world.
          </p>
          <Button onClick={loadRandomRecipes} className="bg-orange-600 hover:bg-orange-700">
            <Shuffle className="h-4 w-4 mr-2" />
            Show Random Recipes
          </Button>
        </div>
      )}
    </div>
  );
}
