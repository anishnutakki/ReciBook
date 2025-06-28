import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

// generate short unique id
const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

/**
 * Upload an image (File, Blob, or URI) to Firebase Storage and return its download URL
 */
export const uploadRecipeImage = async (source) => {
  try {
    let blob;
    if (typeof source === 'string') {
      const res = await fetch(source);
      blob = await res.blob();
    } else {
      blob = source; // already a Blob/File
    }

    const fileName = newId();
    const storageRef = ref(storage, `recipes/${fileName}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error('Image upload error:', err);
    throw err;
  }
}; 