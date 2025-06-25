import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddRecipeScreen from './src/screens/AddRecipeScreen';
import SearchScreen from './src/screens/SearchScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import PublicRecipeScreen from './src/screens/PublicRecipeScreen';
import AccountScreen from './src/screens/AccountScreen';

const Stack = createStackNavigator();

// Create a simple loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <Text>Loading...</Text>
  </View>
);

// Deep linking configuration
const linking = {
  prefixes: ['http://localhost:8081', 'https://localhost:8081'],
  config: {
    screens: {
      // Authenticated screens
      Home: '',
      AddRecipe: 'add-recipe',
      RecipeDetail: 'recipe-detail/:recipeId',
      Search: 'search',
      PublicRecipe: 'recipe/:recipeId', // This is the key route for your URLs
      Account: 'account',
      
      // Unauthenticated screens
      Login: 'login',
      Register: 'register',
    },
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔵 Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Function to handle logout and clean navigation
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The auth state listener will handle the UI update
      console.log('🔵 User logged out successfully');
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('🔴 Logout error:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking} fallback={<LoadingScreen />}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          animationEnabled: false,
          headerTitleAllowFontScaling: false,
          headerBackAllowFontScaling: false,
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: 'My Recipes',
                headerRight: () => (
                  <Text 
                    style={{ 
                      marginRight: 15, 
                      color: '#2196F3', 
                      fontWeight: '600' 
                    }}
                    onPress={handleLogout}
                  >
                    Logout
                  </Text>
                ),
              }}
            />
            <Stack.Screen 
              name="AddRecipe" 
              component={AddRecipeScreen} 
              options={{ 
                title: 'Add Recipe',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="RecipeDetail" 
              component={RecipeDetailScreen} 
              options={{ 
                title: 'Recipe Details',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen} 
              options={{ 
                title: 'Search Recipes',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="Account" 
              component={AccountScreen}
              options={{ 
                title: 'Account',
                headerBackTitleVisible: false,
              }}
            />
            {/* Public Recipe Screen - Available when authenticated */}
            <Stack.Screen 
              name="PublicRecipe" 
              component={PublicRecipeScreen}
              options={{ 
                title: 'Shared Recipe',
                headerBackTitleVisible: false,
              }}
            />
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ 
                title: 'Register',
                headerBackTitleVisible: false,
              }}
            />
            {/* Public Recipe Screen - Available when not authenticated */}
            <Stack.Screen 
              name="PublicRecipe" 
              component={PublicRecipeScreen}
              options={{ 
                headerShown: false, // No header for public viewing
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}