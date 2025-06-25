import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { getUserRecipes } from '../services/recipes';

const HomeScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = auth.currentUser;

  // Load user's recipes
  const loadUserRecipes = async () => {
    try {
      if (user) {
        const userRecipes = await getUserRecipes(user.uid);
        setRecipes(userRecipes);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Error', 'Failed to load your recipes');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserRecipes();
    setRefreshing(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('🔴 Starting logout...');
      await signOut(auth);
      console.log('🔴 SignOut successful, navigating to Login...');
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  // Navigate to recipe details
  const handleRecipePress = (recipeId) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  // Add navigation to Account screen instead of logout
  const goToAccount = () => {
    navigation.navigate('Account');
  };

  // Format timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Load recipes when component mounts
  useEffect(() => {
    loadUserRecipes();
  }, []);

  // Modern Recipe Card Component
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
                <Text style={styles.appTitle}>Recipe</Text>
                <Text style={styles.welcomeText}>
                  Welcome back, {user?.displayName?.split(' ')[0] || 'Chef'}
                </Text>
              </View>
              <TouchableOpacity style={styles.profileButton} onPress={goToAccount}>
                <Text style={styles.profileInitial}>
                  {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{recipes.length}</Text>
              <Text style={styles.statLabel}>My Recipes</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => navigation.navigate('AddRecipe')}
            >
              <Text style={styles.actionIcon}>+</Text>
              <Text style={styles.actionText}>Add Recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Recipes Grid */}
          <View style={styles.recipesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Recipes</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Text style={styles.refreshIcon}>↻</Text>
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner}></View>
                <Text style={styles.loadingText}>Loading your recipes...</Text>
              </View>
            ) : recipes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>No recipes yet</Text>
                <Text style={styles.emptyText}>
                  Start building your recipe collection
                </Text>
              </View>
            ) : (
              <div style={webStyles.recipesGrid}>
                {refreshing && (
                  <Text style={styles.refreshText}>Refreshing...</Text>
                )}
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </View>
        </div>
      </div>
    );
  }

  return (
    <div style={webStyles.container}>
      {/* Same content as web version */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>Recipe</Text>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.displayName?.split(' ')[0] || 'Chef'}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={goToAccount}>
            <Text style={styles.profileInitial}>
              {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{recipes.length}</Text>
          <Text style={styles.statLabel}>My Recipes</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => navigation.navigate('AddRecipe')}
        >
          <Text style={styles.actionIcon}>+</Text>
          <Text style={styles.actionText}>Add Recipe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recipesSection}>
        {/* Hide recipesSection entirely by setting display none */}
        {/* recipesSection: {
          flex: 1,
          paddingHorizontal: 24,
          paddingBottom: 32,
        }, */}
      </View>
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

// Modern styles
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
  profileButton: {
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
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : 'white',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
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
    fontSize: 20,
    color: 'white',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  recipesSection: {
    display: 'none',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  refreshIcon: {
    fontSize: 18,
    color: '#666',
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
  refreshText: {
    textAlign: 'center',
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 16,
    gridColumn: '1 / -1',
  },
});

export default HomeScreen;