import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import { searchRecipes } from '../services/recipes';
import RecipeCard from '../components/RecipeCard';

export default function SearchScreen() {
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

  return (
    <View style={styles.container}>
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
            style={[styles.searchButton, isLoading && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Searching...' : 'Search'}
            </Text>
          </TouchableOpacity>
          {hasSearched && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {hasSearched && (
          <Text style={styles.resultsText}>
            {results.length} recipe{results.length !== 1 ? 's' : ''} found
            {searchTerm ? ` for "${searchTerm}"` : ''}
          </Text>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          ListEmptyComponent={
            hasSearched && !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No recipes found. Try a different search term.
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsText: {
    padding: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});