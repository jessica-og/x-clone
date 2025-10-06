'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { app } from '../firebase';
import Post from './Post';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    // Create a real-time query
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));

    // Listen for changes in Firestore in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(newPosts);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [db]);

  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} post={post} id={post.id} />
      ))}
    </div>
  );
}
