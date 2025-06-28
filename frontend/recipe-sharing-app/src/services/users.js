import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getPublicRecipes } from './recipes';

// Ensure user document exists in 'users' collection (called on login/register)
export const ensureUserDoc = async (user) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
    });
  }
};

// Search users by displayName (case-insensitive contains)
export const searchUsers = async (term) => {
  const lower = term.toLowerCase();
  const snapshot = await getDocs(collection(db, 'users'));
  const results = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if ((data.displayName || '').toLowerCase().includes(lower)) {
      results.push(data);
    }
  });
  if (results.length === 0) {
    // fallback via recipes authorName
    const fallback = await findUsersByDisplayNameFallback(term);
    return fallback;
  }
  return results;
};

// If users collection lacks a record, fall back to scanning recipes to infer users
export const findUsersByDisplayNameFallback = async (term) => {
  const lower = term.toLowerCase();
  const recipes = await getPublicRecipes();
  const map = new Map();
  recipes.forEach((r)=>{
    if ((r.authorName || '').toLowerCase().includes(lower)) {
      map.set(r.userId, {
        uid: r.userId,
        displayName: r.authorName,
      });
    }
  });
  return Array.from(map.values());
}; 