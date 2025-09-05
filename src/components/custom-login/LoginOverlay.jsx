
import React from 'react';
import { User } from "@/api/entities";

export default function LoginOverlay() {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-white z-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999
      }}
    >
      <div className="w-full max-w-md p-8 bg-white rounded-2xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f6c0fa_AppIconV.png"
            alt="Vetris Logo"
            className="h-28 w-28"
          />
          <h1 className="text-3xl font-bold">Acesso Restrito</h1>
          <p className="text-gray-500 text-center mb-6">
            Faça login para acessar o sistema
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
          Continuar com Google
        </button>
      </div>
    </div>
  );
}
