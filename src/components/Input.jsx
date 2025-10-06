'use client';

import { useEffect, useRef, useState } from 'react';
import { HiOutlinePhotograph } from 'react-icons/hi';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';
import { app } from '../firebase';
import Image from 'next/image';
import { useFirebaseAuth } from './FirebaseAuthProvider'; // 👈 your Firebase auth context

export default function Input() {
  const { user, login } = useFirebaseAuth(); // 👈 replaces useSession()
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imagePublicId, setImagePublicId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [text, setText] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const imagePickRef = useRef(null);
  const db = getFirestore(app);

  // 🔹 Local image preview
  const addImageToPost = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  // 🔹 Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;

    setImageFileUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();

      if (data.secure_url) {
        return { url: data.secure_url, publicId: data.public_id };
      } else {
        console.error('Cloudinary upload failed:', data);
        return null;
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return null;
    } finally {
      setImageFileUploading(false);
    }
  };

  // 🔹 Handle submit
  const handleSubmit = async () => {
    if (!user) {
      login(); // prompt Google sign-in
      return;
    }
    if (!text && !selectedFile) return;

    setPostLoading(true);

    let uploadedImage = null;
    if (selectedFile) {
      uploadedImage = await uploadImageToCloudinary(selectedFile);
    }

    await addDoc(collection(db, 'posts'), {
      uid: user.uid,
      name: user.displayName,
      username: user.displayName?.split(' ').join('').toLowerCase(),
      text,
      profileImg: user.photoURL,
      timestamp: serverTimestamp(),
      image: uploadedImage?.url || null,
      imagePublicId: uploadedImage?.publicId || null,
    });

    // Reset form
    setPostLoading(false);
    setText('');
    setImageFileUrl(null);
    setImagePublicId(null);
    setSelectedFile(null);
  };

  if (!user) {
    return (
      <div className="p-4 border-b border-gray-200 text-center">
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:brightness-95"
        >
          Sign in to post
        </button>
      </div>
    );
  }

  return (
    <div className="flex border-b border-gray-200 p-3 space-x-3 w-full">
      <Image
        src={user.photoURL}
        alt="user-img"
        width={100}
        height={100}
        className="rounded-full w-11 h-11 cursor-pointer hover:brightness-95"
      />

      <div className="w-full divide-y divide-gray-200">
        <textarea
          className="w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700"
          placeholder="What's happening?"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {selectedFile && (
          <img
            src={imageFileUrl ?? ''}
            alt="preview"
            className={`w-full max-h-[250px] object-cover cursor-pointer ${
              imageFileUploading ? 'animate-pulse' : ''
            }`}
          />
        )}

        <div className="flex items-center justify-between pt-2.5">
          <HiOutlinePhotograph
            onClick={() => imagePickRef.current?.click()}
            className="h-10 w-10 p-2 text-sky-500 hover:bg-sky-100 rounded-full cursor-pointer"
          />
          <input
            type="file"
            ref={imagePickRef}
            accept="image/*"
            onChange={addImageToPost}
            hidden
          />
          <button
            disabled={text.trim() === '' || postLoading || imageFileUploading}
            className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
            onClick={handleSubmit}
          >
            {postLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
