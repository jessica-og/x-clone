'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaXTwitter } from 'react-icons/fa6';
import { HiHome, HiDotsHorizontal } from 'react-icons/hi';
import { useFirebaseAuth } from './FirebaseAuthProvider';

export default function Sidebar() {
  const { user, login, logout } = useFirebaseAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleImageClick = () => setShowDropdown((prev) => !prev);

  return (
    <div className="flex flex-col p-3 justify-between h-screen relative">
      {/* Top navigation */}
      <div className="flex flex-col gap-4">
        <Link href="/">
          <FaXTwitter className="w-16 h-16 cursor-pointer p-3 hover:bg-gray-100 rounded-full transition-all duration-200" />
        </Link>

        <Link
          href="/"
          className="flex items-center p-3 hover:bg-gray-100 rounded-full transition-all duration-200 gap-2 w-fit"
        >
          <HiHome className="w-7 h-7" />
          <span className="font-bold hidden xl:inline">Home</span>
        </Link>

        {user ? (
          <button
            className="bg-blue-400 text-white rounded-full hover:brightness-95 transition-all duration-200 w-48 h-9 shadow-md hidden xl:inline font-semibold"
            onClick={logout}
          >
            Sign Out
          </button>
        ) : (
          <button
            className="bg-blue-400 text-white rounded-full hover:brightness-95 transition-all duration-200 w-48 h-9 shadow-md hidden xl:inline font-semibold"
            onClick={login}
          >
            Sign In with Google
          </button>
        )}
      </div>

      {/* Profile / Avatar Section */}
      <div className="relative">
        <div
          className="text-gray-700 text-sm flex items-center cursor-pointer p-3 hover:bg-gray-100 rounded-full transition-all duration-200"
          onClick={handleImageClick}
        >
          <Image
            src={
              user?.photoURL ||
              'https://cdn-icons-png.flaticon.com/512/847/847969.png'
            }
            alt="user avatar"
            width={40}
            height={40}
            className="rounded-full xl:mr-2"
          />
          <div className="hidden xl:inline">
            <h4 className="font-bold">
              {user ? user.displayName : 'Guest'}
            </h4>
            <p className="text-gray-500">
              {user ? user.email : 'Not signed in'}
            </p>
          </div>
          <HiDotsHorizontal className="h-5 xl:ml-8 hidden xl:inline" />
        </div>

        {showDropdown && (
          <div className="absolute bottom-16 left-3 bg-white shadow-lg rounded-xl p-3 w-40 z-50 border border-gray-100 animate-fade-in">
            {user ? (
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
              >
                Sign Out
              </button>
            ) : (
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  login();
                  setShowDropdown(false);
                }}
              >
                Sign In with Google
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
