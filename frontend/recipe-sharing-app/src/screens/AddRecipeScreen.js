import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { createRecipe } from '../services/recipes';
import { auth } from '../../firebase';

export default function AddRecipeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      Alert.alert('Error', 'Please fill in title, ingredients, and instructions');
      return;
    }

    const ingredientsList = ingredients.split('\n').filter(item => item.trim());
    const instructionsList = instructions.split('\n').filter(item => item.trim());

    if (ingredientsList.length === 0 || instructionsList.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient and instruction');
      return;
    }

    setIsLoading(true);
    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        ingredients: ingredientsList,
        instructions: instructionsList,
        category: category.trim() || 'other',
      };

      await createRecipe(
        recipeData,
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Anonymous'
      );

      Alert.alert('Success', 'Recipe created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create recipe: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Recipe Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter recipe title..."
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of your recipe..."
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., dessert, main-course, appetizer..."
          />

          <Text style={styles.label}>Ingredients *</Text>
          <Text style={styles.hint}>Enter each ingredient on a new line</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs..."
            multiline
            numberOfLines={6}
          />

          <Text style={styles.label}>Instructions *</Text>
          <Text style={styles.hint}>Enter each step on a new line</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients..."
            multiline
            numberOfLines={6}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Recipe...' : 'Create Recipe'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
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
});