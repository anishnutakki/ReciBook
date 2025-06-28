import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { getFollowingIds } from './social';

// Create a new recipe
export const createRecipe = async (recipeData, userId, authorName) => {
  try {
    const docRef = await addDoc(collection(db, 'recipes'), {
      ...recipeData,
      userId,
      authorName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Recipe created with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe: ', error);
    throw new Error('Failed to create recipe');
  }
};

// Get all public recipes (ordered by creation date, newest first)
export const getPublicRecipes = async () => {
  try {
    const q = query(
      collection(db, 'recipes'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const recipes = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return recipes;
  } catch (error) {
    console.error('Error getting recipes: ', error);
    throw new Error('Failed to load recipes');
  }
};

// Search recipes by title or ingredients
export const searchRecipes = async (searchTerm) => {
  try {
    const recipes = await getPublicRecipes();
    
    // Filter recipes based on search term
    const filteredRecipes = recipes.filter(recipe => {
      const titleMatch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if any ingredient contains the search term
      const ingredientMatch = recipe.ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Check if category contains the search term
      const categoryMatch = recipe.category && 
        recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if description contains the search term
      const descriptionMatch = recipe.description && 
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return titleMatch || ingredientMatch || categoryMatch || descriptionMatch;
    });
    
    return filteredRecipes;
  } catch (error) {
    console.error('Error searching recipes: ', error);
    throw new Error('Failed to search recipes');
  }
};

// Get recipes by specific user
export const getUserRecipes = async (userId) => {
  try {
    const q = query(
      collection(db, 'recipes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const recipes = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return recipes;
  } catch (error) {
    console.error('Error getting user recipes: ', error);
    throw new Error('Failed to load user recipes');
  }
};

// Get recipes by category
export const getRecipesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'recipes'),
      where('category', '==', category.toLowerCase()),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const recipes = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return recipes;
  } catch (error) {
    console.error('Error getting recipes by category: ', error);
    throw new Error('Failed to load recipes by category');
  }
};

// Get feed recipes for current user (recipes by followed users)
export const getFeedRecipes = async (currentUserId) => {
  try {
    const followingIds = await getFollowingIds(currentUserId);
    if (followingIds.length === 0) return [];

    // Firestore 'in' query supports up to 10 elements; split if necessary
    const chunks = [];
    for (let i = 0; i < followingIds.length; i += 10) {
      chunks.push(followingIds.slice(i, i + 10));
    }

    const results = [];
    for (const chunk of chunks) {
      const q = query(
        collection(db, 'recipes'),
        where('userId', 'in', chunk),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() });
      });
    }

    // Sort combined results by createdAt desc (since we combined chunks)
    results.sort((a, b) => {
      const aDate = a.createdAt?.seconds || 0;
      const bDate = b.createdAt?.seconds || 0;
      return bDate - aDate;
    });

    return results;
  } catch (error) {
    console.error('Error loading feed recipes:', error);
    throw new Error('Failed to load feed');
  }
};