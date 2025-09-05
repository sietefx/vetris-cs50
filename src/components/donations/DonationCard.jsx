import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DonationCard({ className }) {
  return (
    <Card className={`p-4 border-none bg-gradient-to-br from-purple-50 to-white shadow-sm ${className}`}>
      <CardContent className="p-0 space-y-4">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">
            Faça uma doação e ajude nosso projeto!
          </h2>
          <div className="h-11 w-11 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-base text-gray-600">
            Sua contribuição salva vidas e transforma histórias
          </p>
        </div>

        <Link 
          to={createPageUrl("Donation")} 
          className="block w-full"
        >
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 h-10 text-base flex items-center justify-center"
          >
            <span>Doar agora</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}