import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ErrorFallback({ error, resetError }) {
  const isNetworkError = error?.message?.includes('Network Error') || 
                        !navigator.onLine ||
                        error?.code === 'ERR_NETWORK';

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="mb-4">
          {isNetworkError ? (
            <WifiOff className="h-12 w-12 text-red-500 mx-auto" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          )}
        </div>
        
        <h2 className="text-xl font-bold mb-2">
          {isNetworkError ? "Erro de Conexão" : "Algo deu errado"}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isNetworkError 
            ? "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
            : "Ocorreu um erro inesperado. Por favor, tente novamente."}
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={resetError}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
          
          {isNetworkError && (
            <p className="text-sm text-gray-500">
              Status da conexão: {navigator.onLine ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}