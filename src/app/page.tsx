'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import Image from 'next/image';

export default function Home() {
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Badge and Title */}
        <div className="text-center mb-8 flex flex-col items-center">
          
            <Image src="/intervue.svg" alt="logo" width={100} height={100} className='m-10'/>
          
          <h1 className="text-3xl  text-gray-900 mb-2">
            Welcome to the <span className="font-extrabold">Live Polling System</span>
          </h1>
          <p className="text-gray-500">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div
            onClick={() => setRole('student')}
            className={`cursor-pointer border rounded-xl p-6 transition-all ${
              role === 'student'
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="text-lg font-semibold mb-2 text-black">I’m a Student</h3>
            <p className="text-sm text-gray-500">
              Submit answers and view live poll results in real-time.
            </p>
          </div>

          <div
            onClick={() => setRole('teacher')}
            className={`cursor-pointer border rounded-xl p-6 transition-all ${
              role === 'teacher'
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="text-lg font-semibold mb-2 text-black">I’m a Teacher</h3>
            <p className="text-sm text-gray-500">
              Create live polls and view results in real-time.
              
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Link href={`/${role ?? ''}`} passHref>
            <button
              disabled={!role}
              className={`px-10 py-3 rounded-full text-white font-semibold transition-all ${
                role
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
