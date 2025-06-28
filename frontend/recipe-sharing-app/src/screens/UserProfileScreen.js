import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { auth } from '../../firebase';
import { getUserRecipes } from '../services/recipes';
import { followUser, unfollowUser, isFollowing } from '../services/social';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const currentUser = auth.currentUser;

  const [userInfo, setUserInfo] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Load user profile
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch user doc
        const snap = await getDoc(doc(db, 'users', userId));
        if (snap.exists()) {
          setUserInfo(snap.data());
        }
        // Fetch recipes
        const userRecipes = await getUserRecipes(userId);
        setRecipes(userRecipes);
        // Check following
        const followState = await isFollowing(currentUser.uid, userId);
        setFollowing(followState);
      } catch (err) {
        console.error('Load profile error:', err);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const toggleFollow = async () => {
    try {
      setFollowLoading(true);
      if (following) {
        await unfollowUser(currentUser.uid, userId);
      } else {
        await followUser(currentUser.uid, userId);
      }
      setFollowing(!following);
    } catch (err) {
      console.error('Follow toggle error:', err);
      Alert.alert('Error', 'Failed to update follow');
    } finally {
      setFollowLoading(false);
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
        <Text style={styles.recipeDescription} numberOfLines={2}>{recipe.description}</Text>
      ) : null}
      <Text style={styles.recipeDate}>{formatDate(recipe.createdAt)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const Content = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userInfo?.displayName || 'User'}</Text>
        {currentUser.uid !== userId && (
          <TouchableOpacity style={styles.followButton} onPress={toggleFollow} disabled={followLoading}>
            <Text style={styles.followButtonText}>{followLoading ? '...' : following ? 'Unfollow' : 'Follow'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recipes</Text>
        {recipes.length === 0 ? (
          <Text style={{ color:'#666' }}>No recipes yet.</Text>
        ) : (
          recipes.map((r)=> <RecipeCard key={r.id} recipe={r} />)
        )}
      </View>
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.container}>
        <div style={webStyles.scrollableContainer}>
          <Content />
        </div>
      </div>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Content />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'web' ? 60 : 44,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.9)' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  followButton:{
    backgroundColor: '#4CAF50',
    paddingVertical:8,
    paddingHorizontal:16,
    borderRadius:9999,
  },
  followButtonText:{
    color:'#fff',
    fontWeight:'600'
  },
  section:{
    flex:1,
    padding:24,
  },
  sectionTitle:{
    fontSize:20,
    fontWeight:'700',
    marginBottom:12,
  },
  recipeCard:{
    backgroundColor:Platform.OS==='web'?'rgba(255,255,255,0.9)':'#fff',
    borderRadius:16,
    padding:20,
    marginBottom:16,
    borderWidth:1,
    borderColor:'#e5e7eb',
    cursor:Platform.OS==='web'?'pointer':undefined,
  },
  recipeTitle:{
    fontSize:18,
    fontWeight:'700',
    marginBottom:4,
  },
  recipeDescription:{
    fontSize:14,
    color:'#666',
    marginBottom:6,
  },
  recipeDate:{
    fontSize:12,
    color:'#999',
  }
});

// Web styles
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
};

export default UserProfileScreen; 