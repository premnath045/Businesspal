import { auth, firestore, storage } from "./config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  setDoc,
  arrayUnion
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { INewPost, INewUser, IUpdatePost } from "@/types";

// Helper function to generate a unique ID
const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Creating new user account
export async function createUserAccount(user: INewUser) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
    const newUser = userCredential.user;

    if (!newUser) throw Error;

    // Create user avatar (you may need to implement this differently)
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`;

    // Save user to Firestore
    const userDoc = await saveUserToDB({
      uid: newUser.uid,
      name: user.name,
      email: user.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return userDoc;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// Saving user to Firestore
export async function saveUserToDB(user: {
  uid: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, user);
    return user;
  } catch (error) {
    console.log(error);
  }
}

// Signing in user
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
    return userCredential.user;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const user = auth.currentUser;
    if (!user) throw Error;

    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    if (!userDoc.exists()) throw Error;

    return userDoc.data();
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.log(error);
  }
}

// New post creation
export async function createPost(post: INewPost) {
  try {
    const imageUrl = await uploadFile(post.file[0]);
    if (!imageUrl) throw Error;

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const newPost = await addDoc(collection(firestore, 'posts'), {
      creator: post.userId,
      caption: post.caption,
      imageUrl: imageUrl,
      location: post.location,
      tags: tags,
      createdAt: serverTimestamp()
    });

    return { id: newPost.id, ...post, imageUrl };
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const storageRef = ref(storage, `posts/${generateUniqueId()}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.log(error);
  }
}

// Firebase doesn't need a separate function for file preview
// The download URL can be used directly for preview

export async function deleteFile(fileUrl: string) {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  try {
    const postsQuery = query(
      collection(firestore, 'posts'), 
      orderBy('createdAt', 'desc'), 
      limit(20)
    );
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, userId: string) {
  try {
    const postRef = doc(firestore, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId)
    });
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(userId: string, postId: string) {
  try {
    const saveRef = collection(firestore, 'saves');
    await addDoc(saveRef, {
      user: userId,
      post: postId,
      createdAt: serverTimestamp()
    });
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(userId: string, postId: string) {
  try {
    const saveQuery = query(
      collection(firestore, 'saves'),
      where('user', '==', userId),
      where('post', '==', postId)
    );
    const querySnapshot = await getDocs(saveQuery);
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(firestore, 'saves', document.id));
    });
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}


export async function updatePost(post: IUpdatePost) {
  try {
    let imageUrl = post.imageUrl;

    if (post.file.length > 0) {
      // Upload new file
      const newImageUrl = await uploadFile(post.file[0]);
      if (!newImageUrl) throw Error;
      imageUrl = newImageUrl;

      // Delete old file
      if (post.imageUrl) {
        const oldImageUrlString = post.imageUrl instanceof URL ? post.imageUrl.toString() : post.imageUrl;
        await deleteFile(oldImageUrlString);
      }
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const postRef = doc(firestore, 'posts', post.postId);
    await updateDoc(postRef, {
      caption: post.caption,
      imageUrl: imageUrl instanceof URL ? imageUrl.toString() : imageUrl,
      location: post.location,
      tags: tags,
    });

    return { id: post.postId, ...post, imageUrl };
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageUrl: string | URL) {
  try {
    // Delete post document
    await deleteDoc(doc(firestore, 'posts', postId));

    // Delete associated image
    if (imageUrl) {
      const imageUrlString = imageUrl instanceof URL ? imageUrl.toString() : imageUrl;
      await deleteFile(imageUrlString);
    }

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const postDoc = await getDoc(doc(firestore, 'posts', postId));
    if (!postDoc.exists()) throw Error;
    return { id: postDoc.id, ...postDoc.data() };
  } catch (error) {
    console.log(error);
  }
}

export async function getUserPosts(userId: string) {
  try {
    const postsQuery = query(
      collection(firestore, 'posts'),
      where("creator", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.log(error);
  }
}