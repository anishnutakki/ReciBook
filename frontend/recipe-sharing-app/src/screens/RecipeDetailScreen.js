import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import ShareModal from '../components/ShareModal';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const [showShareModal, setShowShareModal] = useState(false);
  // Load full recipe details
  const loadRecipeDetails = async () => {
    try {
      if (!recipeId) {
        Alert.alert('Error', 'Recipe ID not found');
        navigation.goBack();
        return;
      }

      const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
      
      if (recipeDoc.exists()) {
        const recipeData = { id: recipeDoc.id, ...recipeDoc.data() };
        setRecipe(recipeData);
      } else {
        Alert.alert('Error', 'Recipe not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading recipe details:', error);
      Alert.alert('Error', 'Failed to load recipe details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format cook time
  const formatCookTime = (minutes) => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  // Load recipe when component mounts
  useEffect(() => {
    loadRecipeDetails();
  }, [recipeId]);

  if (Platform.OS === 'web') {
    if (loading) {
      return (
        <div style={webStyles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recipe details...</Text>
          </View>
        </div>
      );
    }
    if (!recipe) {
      return (
        <div style={webStyles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Recipe not found</Text>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </div>
      );
    }
    return (
      <div style={webStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipe Details</Text>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => setShowShareModal(true)}
          >
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
        <div style={webStyles.scrollableContainer}>
          <View style={styles.content}>
            {/* Recipe Title */}
            <Text style={styles.recipeTitle}>{recipe.title}</Text>

            {/* Recipe Meta Information */}
            {recipe.imageUrl && (
              <Image source={{ uri: recipe.imageUrl }} style={styles.detailImage} resizeMode="cover" />
            )}
            <View style={styles.metaContainer}>
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
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Created:</Text>
                <Text style={styles.metaValue}>{formatDate(recipe.createdAt)}</Text>
              </View>
              {recipe.authorName && (
                <TouchableOpacity
                  style={styles.metaItem}
                  onPress={() => navigation.navigate('UserProfile', { userId: recipe.userId })}
                >
                  <Text style={[styles.metaValue, styles.authorLink]}>{recipe.authorName}</Text>
                </TouchableOpacity>
              )}
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
        <ShareModal 
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          recipe={recipe}
          recipeId={recipeId}
        />
      </div>
    );
  }

  return (
    <div style={webStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe Details</Text>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={() => setShowShareModal(true)}
        >
          <Text style={styles.shareButtonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
      <div style={webStyles.scrollableContainer}>
        <View style={styles.content}>
          {/* Recipe Title */}
          <Text style={styles.recipeTitle}>{recipe.title}</Text>

          {/* Recipe Meta Information */}
          {recipe.imageUrl && (
            <Image source={{ uri: recipe.imageUrl }} style={styles.detailImage} resizeMode="cover" />
          )}
          <View style={styles.metaContainer}>
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
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Created:</Text>
              <Text style={styles.metaValue}>{formatDate(recipe.createdAt)}</Text>
            </View>
            {recipe.authorName && (
              <TouchableOpacity
                style={styles.metaItem}
                onPress={() => navigation.navigate('UserProfile', { userId: recipe.userId })}
              >
                <Text style={[styles.metaValue, styles.authorLink]}>{recipe.authorName}</Text>
              </TouchableOpacity>
            )}
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
      <ShareModal 
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        recipe={recipe}
        recipeId={recipeId}
      />
    </div>
  );
};

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
      background: 'rgba(255, 255, 255, 0.98)',
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
      background: Platform.OS === 'web' ? 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' : '#1e40af',
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
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.2)' : undefined,
    },
    backButton: {
      background: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.3)',
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
      textShadow: Platform.OS === 'web' ? '0 1px 2px rgba(0,0,0,0.2)' : undefined,
    },
    shareButton: {
      background: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
      marginLeft: 12,
    },
    shareButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 15,
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      textShadow: Platform.OS === 'web' ? '0 1px 2px rgba(0,0,0,0.2)' : undefined,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: 24,
    },
    recipeCard: {
      background: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.98)' : 'white',
      borderRadius: 24,
      padding: 28,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 1,
      borderColor: 'rgba(30, 64, 175, 0.1)',
      backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    },
    recipeTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: '#1f2937',
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.05)' : undefined,
    },
    recipeDescription: {
      fontSize: 18,
      color: '#374151',
      marginBottom: 24,
      lineHeight: 28,
      textAlign: 'center',
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
      background: Platform.OS === 'web' ? 'rgba(249, 250, 251, 0.9)' : '#f9fafb',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(30, 64, 175, 0.1)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    metaContainer: {
      backgroundColor: '#f9fafb',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 24,
      columnGap: 16,
    },
    metaItem: {
      flexGrow: 1,
      flexBasis: '40%', // Ensures approx 2 items per row
      alignItems: 'flex-start',
    },
    metaLabel: {
      fontSize: 14,
      color: '#6b7280',
      fontWeight: '600',
      marginBottom: 4,
      textAlign: 'left',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    metaValue: {
      fontSize: 16,
      color: '#1f2937',
      fontWeight: '700',
      textAlign: 'left',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#1f2937',
      marginBottom: 16,
      marginTop: 24,
      textAlign: 'left',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.05)' : undefined,
    },
    ingredientsList: {
      background: Platform.OS === 'web' ? 'rgba(249, 250, 251, 0.9)' : '#f9fafb',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(30, 64, 175, 0.1)',
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
      borderBottomColor: 'rgba(30, 64, 175, 0.1)',
    },
    ingredientItemLast: {
      borderBottomWidth: 0,
    },
    ingredientBullet: {
      fontSize: 8,
      color: '#6366f1',
      marginRight: 8,
      marginTop: 6,
    },
    ingredientText: {
      fontSize: 16,
      color: '#374151',
      flex: 1,
      textAlign: 'left',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      fontWeight: '500',
    },
    instructionsList: {
      background: Platform.OS === 'web' ? 'rgba(249, 250, 251, 0.9)' : '#f9fafb',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(30, 64, 175, 0.1)',
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
      background: Platform.OS === 'web' ? 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' : '#1e40af',
      backgroundColor: '#1e40af',
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
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    instructionText: {
      fontSize: 16,
      color: '#374151',
      flex: 1,
      lineHeight: 24,
      textAlign: 'left',
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
      color: '#1e40af',
      textAlign: 'center',
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
      color: '#dc2626',
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      fontWeight: '600',
    },
    shareModal: {
      background: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.98)' : 'white',
      borderRadius: 24,
      padding: 28,
      margin: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 30,
      elevation: 10,
      backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    },
    shareModalTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#1f2937',
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    shareLink: {
      background: Platform.OS === 'web' ? 'rgba(249, 250, 251, 0.9)' : '#f9fafb',
      borderWidth: 2,
      borderColor: Platform.OS === 'web' ? 'rgba(30, 64, 175, 0.2)' : '#e5e7eb',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 16,
      color: '#374151',
      marginBottom: 24,
      textAlign: 'left',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    shareButtonRow: {
      flexDirection: 'row',
      gap: 16,
    },
    copyButton: {
      flex: 1,
      background: Platform.OS === 'web' ? 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' : '#1e40af',
      backgroundColor: '#1e40af',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    closeButton: {
      flex: 1,
      background: Platform.OS === 'web' ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : '#7c3aed',
      backgroundColor: '#7c3aed',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    modalButtonText: {
      color: 'white',
      fontSize: 17,
      fontWeight: '700',
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
      textShadow: Platform.OS === 'web' ? '0 1px 2px rgba(0,0,0,0.1)' : undefined,
    },
    section: {
      marginBottom: 32,
    },
    description: {
      fontSize: 18,
      color: '#374151',
      lineHeight: 28,
      textAlign: 'left',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    tag: {
      backgroundColor: '#dbeafe',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#93c5fd',
    },
    tagText: {
      color: '#1e40af',
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    notesText: {
      fontSize: 16,
      color: '#6b7280',
      lineHeight: 26,
      fontStyle: 'italic',
      textAlign: 'left',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    nutritionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    nutritionItem: {
      backgroundColor: '#fef3c7',
      padding: 16,
      borderRadius: 12,
      minWidth: 100,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#fbbf24',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    nutritionLabel: {
      fontSize: 12,
      color: '#92400e',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 6,
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    nutritionValue: {
      fontSize: 18,
      color: '#92400e',
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    },
    ownerBadge: {
      backgroundColor: '#059669',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    authorLink: {
      color: '#6366f1',
      textDecorationLine: Platform.OS==='web' ? 'underline' : 'none',
      fontWeight: '600',
    },
    detailImage: {
      width: '100%',
      height: 300,
      borderRadius: 20,
      marginVertical: 24,
    },
  });
  
  export default RecipeDetailScreen;