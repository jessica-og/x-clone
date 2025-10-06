'use client';

import {
  HiOutlineChat,
  HiOutlineHeart,
  HiOutlineTrash,
  HiHeart,
} from 'react-icons/hi';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { app } from '../firebase';
import { useEffect, useState } from 'react';
import { modalState, postIdState } from '../atom/modalAtom';
import { useRecoilState } from 'recoil';
import { useFirebaseAuth } from './FirebaseAuthProvider'; // 👈 import your Firebase Auth context

export default function Icons({ id, uid }) {
  const { user, login } = useFirebaseAuth(); // 👈 replaces useSession()
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const [open, setOpen] = useRecoilState(modalState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const [comments, setComments] = useState([]);
  const db = getFirestore(app);

  // 🔹 Like or unlike post
  const likePost = async () => {
    if (user) {
      if (isLiked) {
        await deleteDoc(doc(db, 'posts', id, 'likes', user.uid));
      } else {
        await setDoc(doc(db, 'posts', id, 'likes', user.uid), {
          username: user.displayName?.split(' ').join('').toLowerCase(),
          timestamp: serverTimestamp(),
        });
      }
    } else {
      login(); // 👈 prompt Google sign-in
    }
  };

  // 🔹 Listen for likes in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts', id, 'likes'), (snapshot) => {
      setLikes(snapshot.docs);
    });
    return () => unsubscribe();
  }, [db, id]);

  // 🔹 Check if user liked post
  useEffect(() => {
    setIsLiked(likes.findIndex((like) => like.id === user?.uid) !== -1);
  }, [likes, user]);

  // 🔹 Listen for comments in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts', id, 'comments'), (snapshot) => {
      setComments(snapshot.docs);
    });
    return () => unsubscribe();
  }, [db, id]);

  // 🔹 Delete post (with Cloudinary cleanup)
  const deletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (user?.uid === uid) {
        try {
          const postRef = doc(db, 'posts', id);
          const postSnap = await getDoc(postRef);

          if (postSnap.exists()) {
            const postData = postSnap.data();

            // 1. Delete Firestore document
            await deleteDoc(postRef);
            console.log('Firestore document deleted');

            // 2. Delete Cloudinary image if exists
            if (postData.imagePublicId) {
              const res = await fetch('/api/deleteImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_id: postData.imagePublicId }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Cloudinary delete failed');
              console.log('Cloudinary image deleted:', data.result);
            }
          }

          window.location.reload();
        } catch (error) {
          console.error('Error deleting post:', error);
        }
      } else {
        alert('You are not authorized to delete this post');
      }
    }
  };

  return (
    <div className="flex justify-start gap-5 p-2 text-gray-500">
      {/* 💬 Comment Icon */}
      <div className="flex items-center">
        <HiOutlineChat
          className="h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-sky-500 hover:bg-sky-100"
          onClick={() => {
            if (!user) {
              login();
            } else {
              setOpen(!open);
              setPostId(id);
            }
          }}
        />
        {comments.length > 0 && <span className="text-xs">{comments.length}</span>}
      </div>

      {/* ❤️ Like Icon */}
      <div className="flex items-center">
        {isLiked ? (
          <HiHeart
            onClick={likePost}
            className="h-8 w-8 cursor-pointer rounded-full transition text-red-600 duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
          />
        ) : (
          <HiOutlineHeart
            onClick={likePost}
            className="h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
          />
        )}
        {likes.length > 0 && (
          <span className={`text-xs ${isLiked && 'text-red-600'}`}>{likes.length}</span>
        )}
      </div>

      {/* 🗑️ Delete Icon (only for post owner) */}
      {user?.uid === uid && (
        <HiOutlineTrash
          className="h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
          onClick={deletePost}
        />
      )}
    </div>
  );
}
