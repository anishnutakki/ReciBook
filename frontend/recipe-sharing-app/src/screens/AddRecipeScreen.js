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
  Platform,
  Image
} from 'react-native';
import { createRecipe } from '../services/recipes';
import { auth } from '../../firebase';
// For web compatibility, you might need to replace this with:
// import { IoAddCircle, IoCloseCircle } from 'react-icons/io5';
import Icon from 'react-native-vector-icons/Ionicons';
import { uploadRecipeImage } from '../services/storage';

export default function AddRecipeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ingredients, setIngredients] = useState([{ quantity: '', unit: '', name: '' }]);
  const [instructions, setInstructions] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const categories = [
    { id: 'Breakfast', name: 'Breakfast', icon: '🍳' },
    { id: 'Brunch', name: 'Brunch', icon: '🥐' },
    { id: 'Lunch', name: 'Lunch', icon: '🥗' },
    { id: 'Dinner', name: 'Dinner', icon: '🍽️' },
    { id: 'Snack', name: 'Snack', icon: '🍿' },
    { id: 'Dessert', name: 'Dessert', icon: '🍰' },
    { id: 'Appetizer', name: 'Appetizer', icon: '🥙' },
    { id: 'Beverage', name: 'Beverage', icon: '🥤' },
    { id: 'Soup', name: 'Soup', icon: '🍲' },
    { id: 'Salad', name: 'Salad', icon: '🥗' },
    { id: 'Main-Course', name: 'Main Course', icon: '🍖' },
    { id: 'Side-Dish', name: 'Side Dish', icon: '🥔' }
  ];

  const commonUnits = [
    'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves', 'pinch', 'dash'
  ];

  const addIngredient = () => {
    setIngredients([...ingredients, { quantity: '', unit: '', name: '' }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
    }
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const formatIngredientsList = () => {
    return ingredients
      .filter(ing => ing.name.trim())
      .map(ing => {
        let formatted = '';
        if (ing.quantity.trim()) formatted += ing.quantity + ' ';
        if (ing.unit.trim()) formatted += ing.unit + ' ';
        formatted += ing.name.trim();
        return formatted;
      });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a recipe title');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const formattedIngredients = formatIngredientsList();
    if (formattedIngredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    const validInstructions = instructions.filter(inst => inst.trim());
    if (validInstructions.length === 0) {
      Alert.alert('Error', 'Please add at least one instruction step');
      return;
    }

    setIsLoading(true);
    try {
      let downloadURL = null;
      
      // Fixed image upload logic
      const uploadSource = Platform.OS === 'web' ? imageFile : imageUri;
      if (uploadSource) {
        console.log('Uploading image:', { 
          platform: Platform.OS, 
          hasFile: !!imageFile, 
          hasUri: !!imageUri,
          uploadSource: typeof uploadSource
        });
        
        const { uploadRecipeImage } = await import('../services/storage');
        downloadURL = await uploadRecipeImage(uploadSource);
        console.log('Image uploaded successfully:', downloadURL);
      }

      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        ingredients: formattedIngredients,
        instructions: validInstructions,
        category: selectedCategory,
        imageUrl: downloadURL,
      };

      console.log('Creating recipe with data:', recipeData);

      await createRecipe(
        recipeData,
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Anonymous'
      );

      Alert.alert('Success', 'Recipe created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      console.error('Recipe creation error:', error);
      Alert.alert('Error', 'Failed to create recipe: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed image handling for web
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image selected:', file.name, file.type, file.size);
      setImageFile(file);
      setImageUri(URL.createObjectURL(file));
    }
  };

  // Fixed image handling for native
  const handleNativeImageSelect = async () => {
    try {
      const picker = await import('expo-image-picker');
      
      // Request permissions
      const permissionResult = await picker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await picker.launchImageLibraryAsync({
        mediaTypes: picker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Native image selected:', result.assets[0]);
        setImageUri(result.assets[0].uri);
        // For native, we don't need to set imageFile
        setImageFile(null);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.container}>
        <div style={webStyles.scrollableContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Recipe</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.form}>
            {/* Title */}
            <Text style={styles.label}>Recipe Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter recipe title..."
              placeholderTextColor="#999"
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of your recipe..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            {/* Image Picker */}
            <Text style={styles.label}>Image</Text>
            {imageUri && (
              <Image 
                source={{ uri: imageUri }} 
                style={{ 
                  width: '100%', 
                  height: 200, 
                  borderRadius: 12, 
                  marginBottom: 12 
                }} 
                resizeMode="cover" 
              />
            )}
            {imageUri && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  if (imageUri && imageUri.startsWith('blob:')) {
                    URL.revokeObjectURL(imageUri);
                  }
                  setImageUri(null);
                  setImageFile(null);
                }}
              >
                <Text style={styles.removeImageText}>Remove Image</Text>
              </TouchableOpacity>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ 
                marginBottom: 24,
                padding: 8,
                borderRadius: 8,
                border: '1px solid #ddd'
              }}
            />

            {/* Category Selection */}
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.id && styles.categoryButtonSelected
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextSelected
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ingredients */}
            <Text style={styles.label}>Ingredients *</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.ingredientInputs}>
                  <TextInput
                    style={[styles.input, styles.quantityInput]}
                    value={ingredient.quantity}
                    onChangeText={(value) => updateIngredient(index, 'quantity', value)}
                    placeholder="2"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.unitInput]}
                    value={ingredient.unit}
                    onChangeText={(value) => updateIngredient(index, 'unit', value)}
                    placeholder="cups"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    value={ingredient.name}
                    onChangeText={(value) => updateIngredient(index, 'name', value)}
                    placeholder="flour"
                    placeholderTextColor="#999"
                  />
                </View>
                {ingredients.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeIngredient(index)}
                  >
                    <Icon name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Icon name="add-circle" size={24} color="#6366f1" />
              <Text style={styles.addButtonText}>Add Ingredient</Text>
            </TouchableOpacity>

            {/* Instructions */}
            <Text style={styles.label}>Instructions *</Text>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.instructionInput]}
                  value={instruction}
                  onChangeText={(value) => updateInstruction(index, value)}
                  placeholder={`Step ${index + 1}...`}
                  placeholderTextColor="#999"
                  multiline
                />
                {instructions.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeInstruction(index)}
                  >
                    <Icon name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
              <Icon name="add-circle" size={24} color="#6366f1" />
              <Text style={styles.addButtonText}>Add Step</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating Recipe...' : 'Create Recipe'}
              </Text>
            </TouchableOpacity>
          </View>
        </div>
      </div>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Recipe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.form}>
          {/* Title */}
          <Text style={styles.label}>Recipe Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter recipe title..."
            placeholderTextColor="#999"
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of your recipe..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          {/* Image Picker */}
          <Text style={styles.label}>Image</Text>
          {imageUri && (
            <Image 
              source={{ uri: imageUri }} 
              style={{ 
                width: '100%', 
                height: 200, 
                borderRadius: 12, 
                marginBottom: 12 
              }} 
              resizeMode="cover" 
            />
          )}
          {imageUri && (
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => {
                setImageUri(null);
                setImageFile(null);
              }}
            >
              <Text style={styles.removeImageText}>Remove Image</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleNativeImageSelect}
          >
            <Text style={{ color: '#6366f1', fontWeight: '600' }}>Select Image</Text>
          </TouchableOpacity>

          {/* Category Selection */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryButtonSelected
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextSelected
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredients */}
          <Text style={styles.label}>Ingredients *</Text>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <TextInput
                  style={[styles.input, styles.quantityInput]}
                  value={ingredient.quantity}
                  onChangeText={(value) => updateIngredient(index, 'quantity', value)}
                  placeholder="2"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.unitInput]}
                  value={ingredient.unit}
                  onChangeText={(value) => updateIngredient(index, 'unit', value)}
                  placeholder="cups"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={ingredient.name}
                  onChangeText={(value) => updateIngredient(index, 'name', value)}
                  placeholder="flour"
                  placeholderTextColor="#999"
                />
              </View>
              {ingredients.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <Icon name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Icon name="add-circle" size={24} color="#6366f1" />
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>

          {/* Instructions */}
          <Text style={styles.label}>Instructions *</Text>
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.instructionInput]}
                value={instruction}
                onChangeText={(value) => updateInstruction(index, value)}
                placeholder={`Step ${index + 1}...`}
                placeholderTextColor="#999"
                multiline
              />
              {instructions.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeInstruction(index)}
                >
                  <Icon name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
            <Icon name="add-circle" size={24} color="#6366f1" />
            <Text style={styles.addButtonText}>Add Step</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
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
    backgroundColor: Platform.OS === 'web' ? 'transparent' : '#f8faf8',
  },
  header: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 60 : 44,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 20,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  form: {
    padding: 24,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(248, 250, 252, 0.8)' : '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    color: '#1a1a1a',
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Category Styles
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(248, 250, 252, 0.8)' : '#f8fafc',
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: '600',
  },

  // Ingredient Styles
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
  },
  unitInput: {
    flex: 1.5,
    marginBottom: 0,
  },
  nameInput: {
    flex: 3,
    marginBottom: 0,
  },

  // Instruction Styles
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  instructionInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 0,
  },

  // Button Styles
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(248, 250, 252, 0.8)' : '#f8fafc',
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  addButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    backgroundColor: Platform.OS === 'web' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  imageButton: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  removeImageText: {
    color: '#fff',
    fontWeight: '600',
  },
});

// Web-specific styles matching HomeScreen
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
    padding: '0',
    margin: 0,
    boxSizing: 'border-box',
    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 2,
  },
};