import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [accepted, setAccepted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const cookiesAccepted = localStorage.getItem('cookies-accepted');
    if (!cookiesAccepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setAccepted(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="fixed bottom-4 left-4 max-w-sm z-50 shadow-lg">
      <CardContent className="p-4">
        <p className="text-sm mb-4">
          Este site utiliza cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa política de cookies.
        </p>
        <div className="flex justify-end">
          <Button onClick={handleAccept} size="sm">
            Aceitar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}