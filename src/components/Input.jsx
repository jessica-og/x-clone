'use client';

import { useSession } from 'next-auth/react';
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


export default function Input() {
  const { data: session } = useSession();
  const [imageFileUrl, setImageFileUrl] = useState(null); 
  const [imagePublicId, setImagePublicId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [text, setText] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const imagePickRef = useRef(null);
  const db = getFirestore(app);

  //  Only preview locally — do NOT upload yet
  const addImageToPost = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageFileUrl(URL.createObjectURL(file)); // local preview
    }
  };

  // Upload only when the user posts
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

  //  Handle post submit
  const handleSubmit = async () => {
    if (!session?.user) return;
    if (!text && !selectedFile) return;

    setPostLoading(true);

    let uploadedImage = null;
    if (selectedFile) {
      uploadedImage = await uploadImageToCloudinary(selectedFile);
    }

    await addDoc(collection(db, 'posts'), {
      uid: session.user.uid,
      name: session.user.name,
      username: session.user.username,
      text,
      profileImg: session.user.image,
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

  if (!session) return null;



  return (
    <div className="flex border-b border-gray-200 p-3 space-x-3 w-full">
        <Image
        src={session.user.image}
        alt="user-img"
        width={100}
        height={100}
        className="rounded-full w-11 h-11 cursor-pointer hover:brightness-95"
      />
      <div className="w-full divide-y divide-gray-200">
        <textarea
          className="w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700"
          placeholder="What's happening"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {selectedFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageFileUrl ?? ''}
            alt="preview"
            className={`w-full max-h-[250px] object-cover cursor-pointer
            ${imageFileUploading ? 'animate-pulse' : ''}`}
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
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
