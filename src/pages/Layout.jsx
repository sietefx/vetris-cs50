
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  Home as HomeIcon,
  Calendar as CalendarIcon,
  BookOpen,
  Heart,
  Bell,
  Menu,
  X,
  Settings,
  User as UserIcon,
  LogOut,
  Share2,
  Info,
  Stethoscope
} from "lucide-react";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (menuOpen) {
          setMenuOpen(false);
        }
        if (showNotifications) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [menuOpen, showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("Usuário não autenticado");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 [Layout] Iniciando logout...');
      await User.logout();
      console.log('✅ [Layout] Logout realizado com sucesso');
      
      window.location.href = createPageUrl("Welcome");
    } catch (error) {
      console.error("❌ [Layout] Erro ao fazer logout:", error);
      window.location.href = createPageUrl("Welcome");
    }
  };

  const menuItems = [
    {
      name: "Início",
      href: createPageUrl(user?.user_type === "veterinario" ? "VetDashboard" : "Home"),
      icon: <HomeIcon className="w-5 h-5" />
    },
    ...(user?.user_type !== "veterinario" ? [
      {
        name: "Saúde",
        href: createPageUrl("Health"),
        icon: <Heart className="w-5 h-5" />
      },
      {
        name: "Diário",
        href: createPageUrl("Diary"),
        icon: <BookOpen className="w-5 h-5" />
      }
    ] : []),
    {
      name: "Agenda",
      href: createPageUrl("Calendar"),
      icon: <CalendarIcon className="w-5 h-5" />
    },
    ...(user?.user_type === "veterinario" ? [{
      name: "Pacientes",
      href: createPageUrl("VetPets"),
      icon: <Stethoscope className="w-5 h-5" />
    }] : [])
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {user && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Link to={createPageUrl(user?.user_type === "veterinario" ? "VetDashboard" : "Home")} className="flex items-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/71990b_Asset8.png"
                alt="Vetris Logo"
                className="h-8"
              />
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-1">
                <span className="text-sm text-gray-600">Olá, </span>
                <span className="text-sm font-medium">{user.full_name?.split(" ")[0] || "Usuário"}</span>
              </div>

              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationDropdown
                    onClose={() => setShowNotifications(false)}
                    onUnreadCountChange={setUnreadCount}
                  />
                )}
              </div>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {menuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div className="w-[85%] max-w-sm bg-white h-full ml-auto animate-in slide-in-from-right overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-6">
                  <Link to={createPageUrl("Home")} onClick={() => setMenuOpen(false)}>
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/61d047_Asset8.png"
                      alt="Vetris Logo"
                      className="h-6"
                    />
                  </Link>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {user && (
                  <div className="bg-purple-50 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-600">Olá,</p>
                    <p className="font-medium text-lg">{user.full_name || "Usuário"}</p>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                      >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="border-t my-2" />

                <div className="p-2">
                  <nav className="space-y-1">
                    <Link
                      to={createPageUrl("Profile")}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span className="font-medium">Meu Perfil</span>
                    </Link>

                    <Link
                      to={createPageUrl("Share")}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="font-medium">Compartilhar</span>
                    </Link>

                    <Link
                      to={createPageUrl("About")}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <Info className="w-5 h-5" />
                      <span className="font-medium">Sobre nós</span>
                    </Link>

                    <Link
                      to={createPageUrl("Donation")}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Quero doar</span>
                    </Link>

                    <Link
                      to={createPageUrl("Settings")}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Configurações</span>
                    </Link>
                  </nav>
                </div>
              </div>

              <div className="p-4 border-t">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center bg-purple-600 text-white rounded-lg py-3 px-4 font-medium"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      {/* Menu fixo mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30">
        {menuItems.slice(0, 4).map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-purple-700"
          >
            {item.icon}
            <span className="mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
