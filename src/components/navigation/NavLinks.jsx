import React from "react";
import { Heart, Home, Calendar, BookOpen, Bell, PawPrint, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";

export default function NavLinks({ currentPageName, closeMenu, isVet }) {
  const tutorNavItems = [
    { name: "Home", icon: <Home className="w-5 h-5" />, label: "Início" },
    { name: "Health", icon: <Heart className="w-5 h-5" />, label: "Saúde" },
    { name: "Diary", icon: <BookOpen className="w-5 h-5" />, label: "Diário" },
    { name: "Calendar", icon: <Calendar className="w-5 h-5" />, label: "Calendário" },
    { name: "Reminders", icon: <Bell className="w-5 h-5" />, label: "Lembretes" },
    { name: "Share", icon: <Share2 className="w-5 h-5" />, label: "Convidar" },
    { name: "Profile", icon: <PawPrint className="w-5 h-5" />, label: "Perfil" }
  ];

  const vetNavItems = [
    { name: "VetDashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { name: "VetPets", icon: <PawPrint className="w-5 h-5" />, label: "Pacientes" },
    { name: "Calendar", icon: <Calendar className="w-5 h-5" />, label: "Agenda" },
    { name: "Share", icon: <Share2 className="w-5 h-5" />, label: "Convidar" }
  ];

  const navItems = isVet ? vetNavItems : tutorNavItems;

  return (
    <nav className="space-y-1 px-3">
      {navItems.map(({ name, icon, label }) => (
        <Link
          key={name}
          to={createPageUrl(name)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors",
            currentPageName === name ? "bg-purple-50 text-purple-700 font-medium" : "hover:bg-gray-100"
          )}
          onClick={closeMenu}
        >
          {icon}
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}