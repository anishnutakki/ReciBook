import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { getUserRecipes } from '../services/recipes';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function HomeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecipes = async () => {
    try {
      console.log('🟢 Current user:', auth.currentUser?.uid);
      
      if (auth.currentUser) {
        console.log('🟢 Fetching recipes for user:', auth.currentUser.uid);
        const userRecipes = await getUserRecipes(auth.currentUser.uid);
        console.log('🟢 Found recipes:', userRecipes.length);
        setRecipes(userRecipes);
      } else {
        console.log('🔴 No authenticated user');
        setRecipes([]);
      }
    } catch (error) {
      console.error('🔴 Load recipes error:', error);
      Alert.alert('Error', 'Failed to load your recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecipes();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      console.log('🔴 Starting logout...');
      await signOut(auth);
      console.log('🔴 SignOut successful, navigating to Login...');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleRecipePress = (recipe) => {
    console.log('Recipe pressed:', recipe.title);
    // Navigate to recipe detail screen if you have one
    // navigation.navigate('RecipeDetail', { recipe });
  };

  const renderRecipeItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.7}
    >
      {/* Recipe Header */}
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {item.category || 'Other'}
          </Text>
        </View>
      </View>
      
      {/* Recipe Description */}
      {item.description && (
        <Text style={styles.recipeDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}
      
      {/* Ingredients Preview */}
      <View style={styles.ingredientsSection}>
        <Text style={styles.ingredientsLabel}>Ingredients:</Text>
        <Text style={styles.ingredientsList} numberOfLines={2}>
          {item.ingredients?.slice(0, 3).join(', ')}
          {item.ingredients?.length > 3 ? '...' : ''}
        </Text>
      </View>
      
      {/* Recipe Footer */}
      <View style={styles.recipeFooter}>
        <Text style={styles.authorText}>
          By {item.authorName || 'Anonymous'}
        </Text>
        <Text style={styles.dateText}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Recipes Yet</Text>
      <Text style={styles.emptyMessage}>
        Start building your recipe collection by adding your first recipe!
      </Text>
      <TouchableOpacity
        style={styles.addFirstRecipeButton}
        onPress={() => navigation.navigate('AddRecipe')}
      >
        <Text style={styles.addFirstRecipeText}>Add Your First Recipe</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Recipes</Text>
      <Text style={styles.headerSubtitle}>
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in your collection
      </Text>
    </View>
  );

  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Recipe Collection',
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTitleStyle: {
        color: '#333',
        fontWeight: '600',
      },
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddRecipe')}
          >
            <Text style={styles.headerButtonText}>Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.headerButtonText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // Load recipes on mount and when screen comes into focus
  useEffect(() => {
    loadRecipes();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecipes();
    });
    
    return unsubscribe;
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  ingredientsSection: {
    marginBottom: 16,
  },
  ingredientsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addFirstRecipeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstRecipeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});