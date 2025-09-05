
import React from 'react';
import { User } from "@/api/entities";

export default function CustomLogin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f6c0fa_AppIconV.png"
            alt="Vetris Logo"
            className="h-28 w-28"
          />
          <h1 className="text-3xl font-bold">Vetris</h1>
          <p className="text-gray-500 text-center mb-6">
            Gerenciamento de saúde para seus pets
          </p>
        </div>

        <button
          onClick={() => User.login()}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <img 
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
            alt="Google" 
            className="w-5 h-5"
          />
          Continue com Google
        </button>
      </div>
    </div>
  );
}
