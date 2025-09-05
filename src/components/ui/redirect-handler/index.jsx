import React, { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { retryOperation } from "../api-utils";
import { ErrorFallback } from "../error-boundary";

export default function RedirectHandler() {
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        const userTypeInvite = localStorage.getItem('userTypeInvite');
        
        if (!redirectUrl || !userTypeInvite) return;

        // Limpar dados do localStorage antes do redirecionamento
        localStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('userTypeInvite');
        localStorage.removeItem('inviteCode');
        localStorage.removeItem('inviteEmail');

        // Usar retry para garantir que o redirecionamento aconteça
        await retryOperation(async () => {
          window.location.href = redirectUrl;
        });

      } catch (err) {
        console.error("Erro no redirecionamento:", err);
        setError(err);
        toast({
          title: "Erro no redirecionamento",
          description: "Não foi possível completar o redirecionamento. Tente novamente.",
          variant: "destructive",
        });
      }
    };

    handleRedirect();
  }, [toast]);

  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        resetError={() => window.location.reload()} 
      />
    );
  }

  return null;
}