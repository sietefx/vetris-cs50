import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            Ops! Algo deu errado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>
              Erro no aplicativo
            </AlertTitle>
            <AlertDescription>
              Ocorreu um erro inesperado. Por favor, tente novamente.
            </AlertDescription>
          </Alert>
          
          <p className="text-gray-600 text-sm mb-2">
            Você pode tentar:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-4">
            <li>Recarregar a página</li>
            <li>Voltar para a página inicial</li>
            <li>Verificar sua conexão com a internet</li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
          
          <Link to={createPageUrl("Home")} className="w-full">
            <Button variant="ghost" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Ir para a página inicial
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}