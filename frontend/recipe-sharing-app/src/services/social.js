import { collection, doc, setDoc, deleteDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const followsCollection = collection(db, 'follows');

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) return;
  await setDoc(doc(followsCollection, `${followerId}_${followingId}`), {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  });
};

export const unfollowUser = async (followerId, followingId) => {
  if (followerId === followingId) return;
  await deleteDoc(doc(followsCollection, `${followerId}_${followingId}`));
};

export const isFollowing = async (followerId, followingId) => {
  const q = query(followsCollection, where('followerId', '==', followerId), where('followingId', '==', followingId));
  const snap = await getDocs(q);
  return !snap.empty;
};

export const getFollowingIds = async (followerId) => {
  const q = query(followsCollection, where('followerId', '==', followerId));
  const snap = await getDocs(q);
  const ids = [];
  snap.forEach((docSnap) => ids.push(docSnap.data().followingId));
  return ids;
}; 