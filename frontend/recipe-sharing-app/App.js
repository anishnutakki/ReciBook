import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddRecipeScreen from './src/screens/AddRecipeScreen';
import SearchScreen from './src/screens/SearchScreen';

const Stack = createStackNavigator();

// Create a simple loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <Text>Loading...</Text>
  </View>
);

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          animationEnabled: true,
          animation: "none",

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
                title: 'Recipe Sharing',
                headerBackTitleVisible: false,
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
              name="Search" 
              component={SearchScreen} 
              options={{ 
                title: 'Search Recipes',
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}