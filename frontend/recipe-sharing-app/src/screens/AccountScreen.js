import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { auth } from '../../firebase';
import { signOut, updatePassword } from 'firebase/auth';
import { getUserRecipes } from '../services/recipes';

const AccountScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Load all user recipes
  const loadRecipes = async () => {
    try {
      const userRecipes = await getUserRecipes(user.uid);
      setRecipes(userRecipes);
    } catch (err) {
      console.error('Failed to load user recipes:', err);
      Alert.alert('Error', 'Could not load your recipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  // Handle password change
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Validation', 'Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setUpdatingPassword(true);
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update error:', err);
      Alert.alert('Error', err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const RecipeCard = ({ recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
    >
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      {recipe.description ? (
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {recipe.description}
        </Text>
      ) : null}
      <Text style={styles.recipeDate}>{formatDate(recipe.createdAt)}</Text>
    </TouchableOpacity>
  );

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.container}>
        <div style={webStyles.scrollable}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account</Text>
          </View>

          {/* Account Info */}
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{user.displayName || 'Anonymous'}</Text>
            <Text style={styles.accountEmail}>{user.email}</Text>
          </View>

          {/* Change Password */}
          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleChangePassword}
              disabled={updatingPassword}
            >
              <Text style={styles.updateButtonText}>
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recipes List */}
          <View style={styles.myRecipesSection}>
            <Text style={styles.sectionTitle}>My Recipes</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : recipes.length === 0 ? (
              <Text style={styles.loadingText}>You have no recipes yet.</Text>
            ) : (
              <div style={webStyles.recipesGrid}>
                {recipes.map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </div>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </div>
      </div>
    );
  }

  // Mobile view (similar but uses ScrollView automatically)
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{user.displayName || 'Anonymous'}</Text>
        <Text style={styles.accountEmail}>{user.email}</Text>
      </View>

      <View style={styles.passwordSection}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleChangePassword}
          disabled={updatingPassword}
        >
          <Text style={styles.updateButtonText}>
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={styles.sectionTitle}>My Recipes</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : recipes.length === 0 ? (
          <Text style={styles.loadingText}>You have no recipes yet.</Text>
        ) : (
          recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Web styles
const webStyles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  scrollable: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '24px',
  },
  recipesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'web' ? 60 : 44,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  accountInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  accountName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  accountEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  passwordSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  myRecipesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  recipeCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.9)' : '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recipeDate: {
    fontSize: 12,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    margin: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountScreen; 