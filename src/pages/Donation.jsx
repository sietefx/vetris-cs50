import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Heart, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DonationPage() {
  const [copied, setCopied] = useState(false);
  
  const pixInfo = {
    key: "admin@vetris.app",
    beneficiary: "Associação Vetris de Proteção Animal",
    qrCodeUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804b36_qr-code.jpg"
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixInfo.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => window.history.back()}
          className="text-purple-600 hover:text-purple-700 flex items-center mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Faça uma Doação</h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Ajude-nos a manter e melhorar o aplicativo para que você tenha seu pet sempre saudável.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-semibold mb-1">Pague com PIX</h2>
            <p className="text-purple-100">
              Escaneie o QR Code ou copie a chave PIX
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl shadow-inner">
                <img 
                  src={pixInfo.qrCodeUrl}
                  alt="QR Code PIX" 
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>

            <div>
              <Label>Chave PIX</Label>
              <div className="flex mt-1">
                <Input 
                  value={pixInfo.key} 
                  readOnly 
                  className="rounded-r-none bg-gray-50"
                />
                <Button 
                  onClick={handleCopyPixKey}
                  variant="outline" 
                  className={`rounded-l-none border-l-0 px-4 ${
                    copied ? 'bg-green-50 text-green-600' : ''
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg font-semibold">1</span>
                  </div>
                </div>
                <div className="ml-3">
                  <AlertTitle className="text-blue-800">Abra seu app</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Abra o aplicativo do seu banco
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            <Alert className="bg-blue-50 border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg font-semibold">2</span>
                  </div>
                </div>
                <div className="ml-3">
                  <AlertTitle className="text-blue-800">Escaneie ou cole</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Escaneie o QR Code ou cole a chave PIX
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            <Alert className="bg-blue-50 border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg font-semibold">3</span>
                  </div>
                </div>
                <div className="ml-3">
                  <AlertTitle className="text-blue-800">Confirme a doação</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Digite o valor desejado e confirme a transferência
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}