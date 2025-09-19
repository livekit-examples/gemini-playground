"use client";

import React from 'react';
import { useSignatureRecipes } from '@/hooks/use-signature-recipes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * Debug component to inspect signature recipe data
 * Add this temporarily to see what's actually being loaded
 */
export function DebugSignatureRecipes() {
  const { 
    recipes, 
    loading, 
    error, 
    isAvailable, 
    refreshRecipes 
  } = useSignatureRecipes();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Debug: Signature Recipes
            <Button variant="outline" size="sm" onClick={refreshRecipes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <strong>Loading:</strong>
              <Badge variant={loading ? "default" : "secondary"} className="ml-2">
                {loading ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <strong>Available:</strong>
              <Badge variant={isAvailable ? "default" : "destructive"} className="ml-2">
                {isAvailable ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <strong>Count:</strong>
              <Badge className="ml-2">{recipes.length}</Badge>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Raw Recipe Data */}
          {recipes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Raw Recipe Data:</h3>
              {recipes.map((recipe, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {recipe.id}</div>
                      <div><strong>Title:</strong> {recipe.title}</div>
                      <div><strong>Description:</strong> {recipe.description?.substring(0, 100)}...</div>
                      <div><strong>Image URL:</strong> {recipe.imageUrl || "❌ MISSING"}</div>
                      <div><strong>Servings:</strong> {recipe.servings || "❌ MISSING"}</div>
                      <div><strong>Total Time:</strong> {recipe.totalTime || "❌ MISSING"}</div>
                      <div><strong>Instructions Length:</strong> {recipe.instructions?.length || 0} characters</div>
                      <div><strong>Ingredients Count:</strong> {recipe.ingredients?.length || 0}</div>
                      <div><strong>Tags Count:</strong> {recipe.tags?.length || 0}</div>
                      <div><strong>Source:</strong> {recipe.source}</div>
                      
                      {/* Instructions Detail */}
                      {recipe.instructions && (
                        <div>
                          <strong>Instructions:</strong>
                          <div className="ml-4 mt-1 whitespace-pre-line text-sm">
                            {recipe.instructions.substring(0, 200)}...
                          </div>
                        </div>
                      )}
                      
                      {/* Image Test */}
                      {recipe.imageUrl && (
                        <div>
                          <strong>Image Test:</strong>
                          <div className="mt-2">
                            <img 
                              src={recipe.imageUrl} 
                              alt={recipe.title}
                              className="w-32 h-32 object-cover rounded border"
                              onLoad={() => console.log('✅ Image loaded successfully:', recipe.imageUrl)}
                              onError={(e) => {
                                console.error('❌ Image failed to load:', recipe.imageUrl);
                                console.error('Error details:', e);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <strong>Currently Loading...</strong>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && recipes.length === 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <strong>No recipes found</strong>
              <p>Available: {isAvailable ? "Yes" : "No"}</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
