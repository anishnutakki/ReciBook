// ShareModal.js - Updated to use the correct URL format
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';

const ShareModal = ({ visible, onClose, recipe, recipeId }) => {
  // Generate the shareable URL using the recipe ID
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      // Use current domain for web
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      return `${baseUrl}/recipe/${recipeId}`;
    } else {
      // Fallback for mobile or when window is not available
      return `https://yourapp.com/recipe/${recipeId}`;
    }
  };

  const [shareUrl] = useState(getShareUrl());

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        Alert.alert('Copied!', 'Recipe link copied to clipboard');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        Alert.alert('Copied!', 'Recipe link copied to clipboard');
      }
      onClose();
    } catch (error) {
      console.error('Copy failed:', error);
      Alert.alert('Error', 'Failed to copy link. Please copy manually.');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this recipe: ${recipe.title}`);
    const body = encodeURIComponent(
      `I found this amazing recipe and thought you'd like it!\n\n` +
      `${recipe.title}\n\n` +
      `${recipe.description ? recipe.description + '\n\n' : ''}` +
      `View the full recipe here: ${shareUrl}\n\n` +
      `Shared via Recipe App`
    );
    
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    if (typeof window !== 'undefined') {
      window.open(mailtoUrl);
    }
  };

  const shareOnSocial = (platform) => {
    const text = encodeURIComponent(`Check out this delicious recipe: ${recipe.title}`);
    const url = encodeURIComponent(shareUrl);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    
    if (typeof window !== 'undefined' && urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const testUrl = () => {
    // Open the share URL in a new tab to test it
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Recipe</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeId}>Recipe ID: {recipeId}</Text>

          {/* Copy Link Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Copy Link</Text>
            <View style={styles.linkContainer}>
              <TextInput
                style={styles.linkInput}
                value={shareUrl}
                editable={false}
                selectTextOnFocus={true}
                multiline={false}
              />
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.testButton} onPress={testUrl}>
              <Text style={styles.testButtonText}>🔗 Test Link</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Share Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Share</Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity 
                style={[styles.shareBtn, styles.emailBtn]} 
                onPress={shareViaEmail}
              >
                <Text style={styles.shareBtnText}>📧 Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.shareBtn, styles.whatsappBtn]} 
                onPress={() => shareOnSocial('whatsapp')}
              >
                <Text style={styles.shareBtnText}>📱 WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.shareBtn, styles.twitterBtn]} 
                onPress={() => shareOnSocial('twitter')}
              >
                <Text style={styles.shareBtnText}>🐦 Twitter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.shareBtn, styles.facebookBtn]} 
                onPress={() => shareOnSocial('facebook')}
              >
                <Text style={styles.shareBtnText}>📘 Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  recipeTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  recipeId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 12,
    marginRight: 10,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  shareButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emailBtn: { backgroundColor: '#FF5722' },
  whatsappBtn: { backgroundColor: '#25D366' },
  twitterBtn: { backgroundColor: '#1DA1F2' },
  facebookBtn: { backgroundColor: '#4267B2' },
});

export default ShareModal;