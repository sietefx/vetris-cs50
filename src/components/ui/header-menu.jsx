import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeaderMenu({ currentPageName }) {
  return (
    <div className="hidden md:flex items-center gap-2">
      <Link 
        to={createPageUrl("AboutUs")} 
        className={cn(
          "hover:bg-purple-50 rounded-md p-2",
          currentPageName === "AboutUs" ? "text-purple-700" : "text-gray-600"
        )}
      >
        <Button variant="ghost" className="gap-2">
          <Info className="w-4 h-4" />
          <span>Sobre</span>
        </Button>
      </Link>
    </div>
  );
}