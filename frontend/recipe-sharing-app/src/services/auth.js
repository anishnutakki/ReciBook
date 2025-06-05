import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../firebase';

// Register a new user
export const registerUser = async (email, password, displayName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    console.log('User registered successfully');
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Firebase auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('This email is already registered');
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      case 'auth/weak-password':
        throw new Error('Password is too weak');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please try again');
      default:
        throw new Error('Registration failed. Please try again');
    }
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User logged in successfully');
    return user;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific Firebase auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email');
      case 'auth/wrong-password':
        throw new Error('Incorrect password');
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please try again');
      default:
        throw new Error('Login failed. Please try again');
    }
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    console.log('Starting logout process...');
    await signOut(auth);
    console.log('User logged out successfully from Firebase');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout: ' + error.message);
  }
};