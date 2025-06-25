// PublicRecipeScreen.js - Updated to work with URL-based recipe IDs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// Web-specific styles
const webStyles = {
  container: {
    height: '100vh',
    width: '100vw',
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    margin: 0,
    padding: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollableContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    width: '100vw',
    height: '100%',
    minHeight: '80vh',
    border: 'none',
    borderRadius: '0',
    padding: '24px',
    margin: 0,
    boxSizing: 'border-box',
    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 2,
  },
};

// React Native styles
const styles = StyleSheet.create({
  header: {
    background: Platform.OS === 'web' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#6366f1',
    paddingVertical: 24,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    flex: 1,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.1)' : undefined,
  },
  backButton: {
    background: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  joinButton: {
    background: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
    marginLeft: 12,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  recipeCard: {
    background: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'white',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.05)' : undefined,
  },
  recipeDescription: {
    fontSize: 18,
    color: '#6366f1',
    marginBottom: 24,
    lineHeight: 28,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '500',
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    background: Platform.OS === 'web' ? 'rgba(248, 250, 248, 0.8)' : '#f8faf8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  metaValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    marginTop: 24,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.05)' : undefined,
  },
  ingredientsList: {
    background: Platform.OS === 'web' ? 'rgba(248, 250, 248, 0.8)' : '#f8faf8',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.1)',
  },
  ingredientItemLast: {
    borderBottomWidth: 0,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    background: Platform.OS === 'web' ? '#6366f1' : '#6366f1',
    marginRight: 16,
  },
  ingredientText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '500',
  },
  instructionsList: {
    background: Platform.OS === 'web' ? 'rgba(248, 250, 248, 0.8)' : '#f8faf8',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  instructionItemLast: {
    marginBottom: 0,
  },
  instructionNumber: {
    background: Platform.OS === 'web' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  instructionText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
    lineHeight: 24,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 20,
    color: '#6366f1',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 20,
    color: '#EF5350',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '600',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  notFoundText: {
    fontSize: 24,
    color: '#6366f1',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  notFoundSubtext: {
    fontSize: 18,
    color: '#8b5cf6',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '500',
  },
  ownerBadge: {
    background: Platform.OS === 'web' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' : '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ownerBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  tag: {
    background: Platform.OS === 'web' ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' : '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tagText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
});

const PublicRecipeScreen = ({ route, navigation }) => {
  // Get recipe ID from URL params or route params
  const getRecipeIdFromUrl = () => {
    // Priority 1: React Navigation route params (most reliable)
    if (route?.params?.recipeId) {
      console.log('Recipe ID from route params:', route.params.recipeId);
      return route.params.recipeId;
    }
    
    // Priority 2: URL parsing for direct web access
    if (typeof window !== 'undefined') {
      const urlPath = window.location.pathname;
      console.log('Current URL path:', urlPath);
      
      // Try to match /recipe/[recipeId] pattern
      const match = urlPath.match(/\/recipe\/([^\/]+)/);
      if (match) {
        console.log('Recipe ID from URL:', match[1]);
        return match[1];
      }
    }
    
    console.log('No recipe ID found');
    return null;
  };

  const recipeId = getRecipeIdFromUrl();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);

  const loadRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!recipeId) {
        setError('Recipe ID not found in URL');
        return;
      }

      console.log('Loading recipe with ID:', recipeId);
      
      // Fetch the recipe document from Firestore
      const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
      
      if (recipeDoc.exists()) {
        const recipeData = { id: recipeDoc.id, ...recipeDoc.data() };
        console.log('Recipe loaded:', recipeData);
        setRecipe(recipeData);
      } else {
        console.log('Recipe not found');
        setError('Recipe not found or no longer available');
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      setError('Failed to load recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCookTime = (minutes) => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const promptSignUp = () => {
    if (auth.currentUser) {
      // User is signed in, go to homepage
      if (navigation) {
        navigation.navigate('Home');
      } else {
        // For web direct navigation
        window.location.href = '/';
      }
    } else {
      // User is not signed in, go to login page
      if (navigation) {
        navigation.navigate('Login');
      } else {
        // For web direct navigation
        window.location.href = '/login';
      }
    }
  };

  // Load recipe when component mounts or recipe ID changes
  useEffect(() => {
    if (recipeId) {
      loadRecipeDetails();
    } else {
      setError('No recipe ID found in URL');
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  if (Platform.OS === 'web') {
    if (loading) {
      return (
        <div style={webStyles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recipe...</Text>
            <Text style={styles.recipeIdText}>Recipe ID: {recipeId}</Text>
          </View>
        </div>
      );
    }
    if (error || !recipe) {
      return (
        <div style={webStyles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
            <Text style={styles.recipeIdText}>Recipe ID: {recipeId}</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                if (navigation) {
                  navigation.navigate('Home');
                } else {
                  window.location.href = '/';
                }
              }}
            >
              <Text style={styles.buttonText}>Go Home</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.retryButton]} 
              onPress={loadRecipeDetails}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </div>
      );
    }
    return (
      <div style={webStyles.container}>
        <View style={styles.publicHeader}>
          <Text style={styles.publicHeaderText}>
            Shared Recipe • Sign up to save your own!
          </Text>
          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={() => {
              if (isLoggedIn) {
                // User is logged in, go to home
                if (navigation) {
                  navigation.navigate('Home');
                } else {
                  window.location.href = '/';
                }
              } else {
                // User is not logged in, go to login
                if (navigation) {
                  navigation.navigate('Login');
                } else {
                  window.location.href = '/login';
                }
              }
            }}
          >
            <Text style={styles.signUpButtonText}>
              {isLoggedIn ? 'Home' : 'Join Free'}
            </Text>
          </TouchableOpacity>
        </View>
        <div style={webStyles.scrollableContainer}>
          <View style={styles.content}>
            {/* Recipe Title */}
            <Text style={styles.recipeTitle}>{recipe.title}</Text>

            {/* Recipe Meta Information */}
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                {recipe.category && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Category:</Text>
                    <Text style={styles.metaValue}>{recipe.category}</Text>
                  </View>
                )}
                {recipe.cookTime && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Cook Time:</Text>
                    <Text style={styles.metaValue}>{formatCookTime(recipe.cookTime)}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.metaRow}>
                {recipe.servings && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Servings:</Text>
                    <Text style={styles.metaValue}>{recipe.servings}</Text>
                  </View>
                )}
                {recipe.difficulty && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Difficulty:</Text>
                    <Text style={styles.metaValue}>{recipe.difficulty}</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Created:</Text>
                  <Text style={styles.metaValue}>{formatDate(recipe.createdAt)}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {recipe.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{recipe.description}</Text>
              </View>
            )}

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Ingredients ({recipe.ingredients.length})
                </Text>
                <View style={styles.ingredientsList}>
                  {recipe.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientBullet}>•</Text>
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Instructions ({recipe.instructions.length} steps)
                </Text>
                <View style={styles.instructionsList}>
                  {recipe.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.instructionNumber}>
                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {recipe.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            {recipe.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{recipe.notes}</Text>
              </View>
            )}

            {/* Nutritional Information */}
            {recipe.nutrition && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nutritional Information</Text>
                <View style={styles.nutritionGrid}>
                  {recipe.nutrition.calories && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
                    </View>
                  )}
                  {recipe.nutrition.protein && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutrition.protein}g</Text>
                    </View>
                  )}
                  {recipe.nutrition.carbs && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}g</Text>
                    </View>
                  )}
                  {recipe.nutrition.fat && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutrition.fat}g</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </div>
      </div>
    );
  }

  return (
    <div style={webStyles.container}>
      {/* Public header with sign-up prompt */}
      <View style={styles.publicHeader}>
        <Text style={styles.publicHeaderText}>
          Shared Recipe • Sign up to save your own!
        </Text>
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={() => {
            if (isLoggedIn) {
              // User is logged in, go to home
              if (navigation) {
                navigation.navigate('Home');
              } else {
                window.location.href = '/';
              }
            } else {
              // User is not logged in, go to login
              if (navigation) {
                navigation.navigate('Login');
              } else {
                window.location.href = '/login';
              }
            }
          }}
        >
          <Text style={styles.signUpButtonText}>
            {isLoggedIn ? 'Home' : 'Join Free'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <div style={webStyles.scrollableContainer}>
        <View style={styles.content}>
          {/* Recipe Title */}
          <Text style={styles.recipeTitle}>{recipe.title}</Text>

          {/* Recipe Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              {recipe.category && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Category:</Text>
                  <Text style={styles.metaValue}>{recipe.category}</Text>
                </View>
              )}
              {recipe.cookTime && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Cook Time:</Text>
                  <Text style={styles.metaValue}>{formatCookTime(recipe.cookTime)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.metaRow}>
              {recipe.servings && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Servings:</Text>
                  <Text style={styles.metaValue}>{recipe.servings}</Text>
                </View>
              )}
              {recipe.difficulty && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Difficulty:</Text>
                  <Text style={styles.metaValue}>{recipe.difficulty}</Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Created:</Text>
                <Text style={styles.metaValue}>{formatDate(recipe.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {recipe.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{recipe.description}</Text>
            </View>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Ingredients ({recipe.ingredients.length})
              </Text>
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientBullet}>•</Text>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Instructions ({recipe.instructions.length} steps)
              </Text>
              <View style={styles.instructionsList}>
                {recipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {recipe.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {recipe.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{recipe.notes}</Text>
            </View>
          )}

          {/* Nutritional Information */}
          {recipe.nutrition && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutritional Information</Text>
              <View style={styles.nutritionGrid}>
                {recipe.nutrition.calories && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
                  </View>
                )}
                {recipe.nutrition.protein && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition.protein}g</Text>
                  </View>
                )}
                {recipe.nutrition.carbs && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}g</Text>
                  </View>
                )}
                {recipe.nutrition.fat && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition.fat}g</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </div>
    </div>
  );
};

export default PublicRecipeScreen;