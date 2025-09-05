import React, { useState, useEffect } from "react";
import { X, Cookie, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// Função utilitária para concatenar classes condicionalmente
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Sempre habilitado
    analytics: true,
    marketing: false,
    preferences: true
  });

  useEffect(() => {
    // Verificar se o usuário já consentiu com os cookies
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      // Pequeno delay para mostrar o modal após o carregamento da página
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const saveConsent = (settings) => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      preferences: settings
    }));
    
    setOpen(false);
  };

  const handleTogglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      
      <div className="relative bg-white rounded-t-lg sm:rounded-lg shadow-lg w-full max-w-lg mx-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Cookie className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium">Permissão de Cookies</h3>
          </div>
          {!showDetails && (
            <button
              onClick={() => setOpen(false)} 
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {!showDetails ? (
          <>
            <p className="text-gray-600 mb-6">
              Utilizamos cookies para melhorar sua experiência e fornecer serviços relevantes. 
              Ao clicar em "Aceitar Todos", você concorda com nosso uso de cookies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(true)}
                className="order-3 sm:order-1"
              >
                Personalizar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => saveConsent({
                  necessary: true,
                  analytics: false,
                  marketing: false,
                  preferences: false
                })}
                className="order-2"
              >
                Apenas Necessários
              </Button>
              <Button 
                onClick={handleAcceptAll}
                className="bg-purple-600 hover:bg-purple-700 order-1 sm:order-3"
              >
                Aceitar Todos
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <h4 className="font-medium">Cookies Necessários</h4>
                    <p className="text-sm text-gray-500">
                      Essenciais para o funcionamento do site.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.necessary} 
                    disabled={true}
                  />
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <h4 className="font-medium">Cookies Analíticos</h4>
                    <p className="text-sm text-gray-500">
                      Nos ajudam a entender como você usa o site.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics} 
                    onCheckedChange={() => handleTogglePreference('analytics')}
                  />
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <h4 className="font-medium">Cookies de Preferências</h4>
                    <p className="text-sm text-gray-500">
                      Permitem que o site lembre suas escolhas.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.preferences} 
                    onCheckedChange={() => handleTogglePreference('preferences')}
                  />
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <h4 className="font-medium">Cookies de Marketing</h4>
                    <p className="text-sm text-gray-500">
                      Usados para exibir publicidade relevante.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing} 
                    onCheckedChange={() => handleTogglePreference('marketing')}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(false)}
                className="order-2 sm:order-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleAcceptSelected}
                className="bg-purple-600 hover:bg-purple-700 order-1 sm:order-2"
              >
                Salvar Preferências
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}