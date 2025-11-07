import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Build } from './types';

// Collections
const BUILDS_COLLECTION = 'builds';
const USERS_COLLECTION = 'users';

// Build operations
export const createBuild = async (buildData: Omit<Build, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, BUILDS_COLLECTION), {
      ...buildData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      voteCount: 0,
      votedBy: [],
      views: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating build:', error);
    throw error;
  }
};

export const updateBuild = async (buildId: string, buildData: Partial<Build>) => {
  try {
    const buildRef = doc(db, BUILDS_COLLECTION, buildId);
    await updateDoc(buildRef, {
      ...buildData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating build:', error);
    throw error;
  }
};

export const deleteBuild = async (buildId: string) => {
  try {
    const buildRef = doc(db, BUILDS_COLLECTION, buildId);
    await deleteDoc(buildRef);
  } catch (error) {
    console.error('Error deleting build:', error);
    throw error;
  }
};

export const getBuild = async (buildId: string): Promise<Build | null> => {
  try {
    const buildRef = doc(db, BUILDS_COLLECTION, buildId);
    const buildSnap = await getDoc(buildRef);
    
    if (buildSnap.exists()) {
      return {
        id: buildSnap.id,
        ...buildSnap.data(),
      } as Build;
    }
    return null;
  } catch (error) {
    console.error('Error getting build:', error);
    throw error;
  }
};

export const getAllBuilds = async (visibility: 'public' | 'all' = 'public'): Promise<Build[]> => {
  try {
    const buildsRef = collection(db, BUILDS_COLLECTION);
    let q = query(buildsRef, orderBy('createdAt', 'desc'));
    
    if (visibility === 'public') {
      q = query(buildsRef, where('visibility', '==', 'public'), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Build[];
  } catch (error) {
    console.error('Error getting builds:', error);
    throw error;
  }
};

export const getUserBuilds = async (userId: string): Promise<Build[]> => {
  try {
    const buildsRef = collection(db, BUILDS_COLLECTION);
    const q = query(
      buildsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Build[];
  } catch (error) {
    console.error('Error getting user builds:', error);
    throw error;
  }
};

export const voteBuild = async (buildId: string, userId: string, isUpvote: boolean) => {
  try {
    const buildRef = doc(db, BUILDS_COLLECTION, buildId);
    
    if (isUpvote) {
      await updateDoc(buildRef, {
        voteCount: increment(1),
        votedBy: arrayUnion(userId),
      });
    } else {
      await updateDoc(buildRef, {
        voteCount: increment(-1),
        votedBy: arrayRemove(userId),
      });
    }
  } catch (error) {
    console.error('Error voting build:', error);
    throw error;
  }
};

export const incrementBuildViews = async (buildId: string) => {
  try {
    const buildRef = doc(db, BUILDS_COLLECTION, buildId);
    await updateDoc(buildRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw error for views increment
  }
};

// User profile operations
export const createOrUpdateUserProfile = async (userId: string, profileData: any) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, USERS_COLLECTION), {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        uid: userSnap.id,
        ...userSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
