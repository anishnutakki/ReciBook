// src/components/RecipeCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

export default function RecipeCard({ recipe, onPress }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress && onPress(recipe)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.category}>
          {recipe.category || 'other'}
        </Text>
      </View>
      
      {recipe.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>
      ) : null}
      
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientsLabel}>Ingredients:</Text>
        <Text style={styles.ingredientsList} numberOfLines={2}>
          {recipe.ingredients.slice(0, 3).join(', ')}
          {recipe.ingredients.length > 3 ? '...' : ''}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.author}>
          By {recipe.authorName || 'Anonymous'}
        </Text>
        <Text style={styles.date}>
          {formatDate(recipe.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', // FIXED: Changed from 'red' to proper color
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 6, // Added for proper spacing
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  ingredientsContainer: {
    marginBottom: 12,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  author: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});