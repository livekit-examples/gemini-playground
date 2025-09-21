"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  ChefHat, 
  Loader2,
  AlertCircle,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, type DocumentSnapshot } from "firebase/firestore";
import Link from "next/link";

interface RecipeCompletion {
  id: string;
  recipeId: string;
  recipeTitle: string;
  completedAt: Date;
  sessionId?: string;
}

interface GroupedRecipeCompletion {
  recipeId: string;
  recipeTitle: string;
  completionCount: number;
  lastCompletedAt: Date;
  firstCompletedAt: Date;
  completions: RecipeCompletion[];
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  lastDoc?: DocumentSnapshot;
}

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [groupedCompletions, setGroupedCompletions] = useState<GroupedRecipeCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 8,
    totalItems: 0,
    hasNextPage: false
  });

  // Function to group completions by recipe
  const groupCompletions = useCallback((completions: RecipeCompletion[]): GroupedRecipeCompletion[] => {
    const groupMap = new Map<string, GroupedRecipeCompletion>();
    
    completions.forEach(completion => {
      const existing = groupMap.get(completion.recipeId);
      if (existing) {
        existing.completionCount++;
        existing.completions.push(completion);
        // Update dates if this completion is newer or older
        if (completion.completedAt > existing.lastCompletedAt) {
          existing.lastCompletedAt = completion.completedAt;
        }
        if (completion.completedAt < existing.firstCompletedAt) {
          existing.firstCompletedAt = completion.completedAt;
        }
      } else {
        groupMap.set(completion.recipeId, {
          recipeId: completion.recipeId,
          recipeTitle: completion.recipeTitle,
          completionCount: 1,
          lastCompletedAt: completion.completedAt,
          firstCompletedAt: completion.completedAt,
          completions: [completion]
        });
      }
    });
    
    // Sort by last completion date (most recent first)
    return Array.from(groupMap.values()).sort((a, b) => 
      b.lastCompletedAt.getTime() - a.lastCompletedAt.getTime()
    );
  }, []);

  const fetchCompletions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching completions for user:', user.uid);
      
      // Fetch ALL completions to properly group them
      const q = query(
        collection(db, 'recipe_completions'),
        where('userId', '==', user.uid),
        orderBy('completedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      
      console.log('Fetched docs:', docs.length);
      
      const completionsData: RecipeCompletion[] = docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          recipeId: data.recipeId,
          recipeTitle: data.recipeTitle,
          completedAt: data.completedAt?.toDate() || new Date(),
          sessionId: data.sessionId
        };
      });

      // Group the completions
      const grouped = groupCompletions(completionsData);
      setGroupedCompletions(grouped);
      
      // Reset pagination to first page
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalItems: grouped.length,
        hasNextPage: grouped.length > prev.itemsPerPage
      }));

    } catch (err) {
      console.error('Error fetching recipe completions:', err);
      setError('Failed to load cooking history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, groupCompletions]);

  // Initial load
  useEffect(() => {
    if (user && !authLoading) {
      fetchCompletions();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchCompletions]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage,
      hasNextPage: newPage * prev.itemsPerPage < prev.totalItems
    }));
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
        <p className="text-muted-foreground text-center mb-4">
          You need to be signed in to view your profile and cooking history.
        </p>
        <Link href="/">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-4 py-6">
      {/* Back to Home */}
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <User className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.displayName || "User"}</h1>
              <p className="text-muted-foreground text-sm font-normal">Your Cooking Profile</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="break-all">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Member since:</span>
              <span>{user.metadata?.creationTime ? formatDate(new Date(user.metadata.creationTime)) : 'Unknown'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cooking History */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-500" />
            Recent Cooking History
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-center">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => fetchCompletions()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : groupedCompletions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cooking History Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start cooking some recipes to see your history here!
                </p>
                <Link href="/">
                  <Button>
                    Start Cooking
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
                  const endIndex = startIndex + pagination.itemsPerPage;
                  const currentPageCompletions = groupedCompletions.slice(startIndex, endIndex);
                  
                  return currentPageCompletions.map((groupedCompletion) => (
                    <Card key={groupedCompletion.recipeId} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">
                            {groupedCompletion.recipeTitle}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Last completed {formatShortDate(groupedCompletion.lastCompletedAt)}</span>
                            </div>
                          </div>
                          {groupedCompletion.completionCount > 1 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              First completed {formatShortDate(groupedCompletion.firstCompletedAt)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                            {groupedCompletion.completionCount === 1 ? 'Completed' : `Completed ${groupedCompletion.completionCount} times`}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ));
                })()}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {!loading && !error && groupedCompletions.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="text-xs text-muted-foreground text-center">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} recipes
              </div>
              
              <div className="flex items-center justify-center gap-0.5 flex-wrap">
                {(() => {
                  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
                  const currentPage = pagination.currentPage;
                  
                  return (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage <= 1}
                        className="h-8 px-1.5 text-xs"
                      >
                        <ChevronsLeft className="h-3 w-3" />
                        <span className="hidden md:inline ml-1">First</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
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
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="h-8 px-2 text-xs"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">›</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="h-8 px-1.5 text-xs"
                      >
                        <span className="hidden md:inline mr-1">Last</span>
                        <ChevronsRight className="h-3 w-3" />
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
