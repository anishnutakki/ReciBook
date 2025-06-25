import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { searchRecipes } from '../services/recipes';

export default function WebCompatibleSearchScreen({ navigation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await searchRecipes(searchTerm.trim());
      setResults(searchResults);
    } catch (error) {
      Alert.alert('Error', 'Failed to search recipes');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
  };

  // Navigate to recipe details
  const handleRecipePress = (recipeId) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  // Format timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Enhanced RecipeCard component matching home screen style
  const RecipeCard = ({ recipe }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleRecipePress(recipe.id)}
      activeOpacity={0.95}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardIcon}>🍳</Text>
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          {recipe.category && (
            <Text style={styles.categoryBadge}>{recipe.category}</Text>
          )}
        </View>
      </View>
      
      {recipe.description && (
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {recipe.description}
        </Text>
      )}
      
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsLabel}>Ingredients:</Text>
          <Text style={styles.ingredientsText}>
            {recipe.ingredients.slice(0, 3).join(' • ')}
            {recipe.ingredients.length > 3 && ' • ...'}
          </Text>
        </View>
      )}
      
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {formatDate(recipe.createdAt)}
        </Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.container}>
        <div style={webStyles.scrollableContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.appTitle}>Recipe Search</Text>
                <Text style={styles.welcomeText}>
                  Find your perfect recipe
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search recipes by title or ingredient..."
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryAction, isLoading && styles.buttonDisabled]}
                  onPress={handleSearch}
                  disabled={isLoading}
                >
                  <Text style={styles.actionIcon}>🔍</Text>
                  <Text style={styles.actionText}>
                    {isLoading ? 'Searching...' : 'Search'}
                  </Text>
                </TouchableOpacity>
                {hasSearched && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryAction]}
                    onPress={clearSearch}
                  >
                    <Text style={styles.secondaryActionIcon}>✕</Text>
                    <Text style={styles.secondaryActionText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Results Section */}
          <View style={styles.resultsSection}>
            {hasSearched && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {results.length} recipe{results.length !== 1 ? 's' : ''} found
                  {searchTerm ? ` for "${searchTerm}"` : ''}
                </Text>
              </View>
            )}
            
            {hasSearched && (
              <>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner}></View>
                    <Text style={styles.loadingText}>Searching recipes...</Text>
                  </View>
                ) : results.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyTitle}>No recipes found</Text>
                    <Text style={styles.emptyText}>
                      Try a different search term or ingredient
                    </Text>
                  </View>
                ) : (
                  <div style={webStyles.recipesGrid}>
                    {results.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                )}
              </>
            )}

            {!hasSearched && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeIcon}>🔍</Text>
                <Text style={styles.welcomeTitle}>Recipe Search</Text>
                <Text style={styles.welcomeDescription}>
                  Enter a recipe name or ingredient above to start searching our recipe database.
                </Text>
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>Search Tips:</Text>
                  <Text style={styles.tipText}>• Try ingredients like "chicken" or "tomato"</Text>
                  <Text style={styles.tipText}>• Search by cuisine type like "italian" or "mexican"</Text>
                  <Text style={styles.tipText}>• Look for specific dishes like "pasta" or "cake"</Text>
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
      <div style={webStyles.scrollableContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.appTitle}>Recipe Search</Text>
              <Text style={styles.welcomeText}>
                Find your perfect recipe
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search recipes by title or ingredient..."
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction, isLoading && styles.buttonDisabled]}
                onPress={handleSearch}
                disabled={isLoading}
              >
                <Text style={styles.actionIcon}>🔍</Text>
                <Text style={styles.actionText}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Text>
              </TouchableOpacity>
              {hasSearched && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryAction]}
                  onPress={clearSearch}
                >
                  <Text style={styles.secondaryActionIcon}>✕</Text>
                  <Text style={styles.secondaryActionText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          {hasSearched && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {results.length} recipe{results.length !== 1 ? 's' : ''} found
                {searchTerm ? ` for "${searchTerm}"` : ''}
              </Text>
            </View>
          )}
          
          {hasSearched && (
            <>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingSpinner}></View>
                  <Text style={styles.loadingText}>Searching recipes...</Text>
                </View>
              ) : results.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>No recipes found</Text>
                  <Text style={styles.emptyText}>
                    Try a different search term or ingredient
                  </Text>
                </View>
              ) : (
                <div style={webStyles.recipesGrid}>
                  {results.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </>
          )}

          {!hasSearched && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeIcon}>🔍</Text>
              <Text style={styles.welcomeTitle}>Recipe Search</Text>
              <Text style={styles.welcomeDescription}>
                Enter a recipe name or ingredient above to start searching our recipe database.
              </Text>
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Search Tips:</Text>
                <Text style={styles.tipText}>• Try ingredients like "chicken" or "tomato"</Text>
                <Text style={styles.tipText}>• Search by cuisine type like "italian" or "mexican"</Text>
                <Text style={styles.tipText}>• Look for specific dishes like "pasta" or "cake"</Text>
              </View>
            </View>
          )}
        </View>
      </div>
    </div>
  );
}

// Web-specific styles matching home screen
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
    minHeight: '100vh',
    border: 'none',
    borderRadius: '0',
    padding: '24px',
    margin: 0,
    boxSizing: 'border-box',
    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 2,
  },
  recipesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    padding: '0',
  },
};

// Styles matching home screen
const styles = StyleSheet.create({
  header: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 60 : 44,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  searchContainer: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : 'white',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#6366f1',
  },
  secondaryAction: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  actionIcon: {
    fontSize: 16,
    color: 'white',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryActionIcon: {
    fontSize: 16,
    color: '#6366f1',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#f3f4f6',
    borderTopColor: '#6366f1',
    marginBottom: 16,
    animation: Platform.OS === 'web' ? 'spin 1s linear infinite' : undefined,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
    lineHeight: 24,
  },
  tipsContainer: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : 'white',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    transition: Platform.OS === 'web' ? 'all 0.2s ease' : undefined,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitleContainer: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 24,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    textTransform: 'capitalize',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  ingredientsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ingredientsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#666',
  },
});