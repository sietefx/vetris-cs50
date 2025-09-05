import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { testEmailDelivery } from "@/api/functions";
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function TestEmailPage() {
  const [email, setEmail] = useState("emporiotesser@gmail.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Por favor, informe um email para teste."
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, informe um email válido."
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      console.log('🧪 Enviando email de teste para:', email);
      
      const { data } = await testEmailDelivery({ email });
      
      console.log('📋 Resultado do teste:', data);
      setResult(data);

      if (data.success) {
        toast({
          title: "Email enviado!",
          description: `Email de teste enviado para ${email}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Falha no envio",
          description: data.error || "Erro desconhecido"
        });
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        variant: "destructive",
        title: "Erro no teste",
        description: "Não foi possível executar o teste de email."
      });
      setResult({
        success: false,
        error: error.message,
        testFailed: true
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast({
        title: "Resultado copiado",
        description: "Resultado do teste copiado para área de transferência."
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => window.history.back()}
          className="text-purple-600 hover:text-purple-700 flex items-center mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Teste de Email</h1>
            <p className="text-gray-600">Verificar funcionamento do sistema de emails via Resend</p>
          </div>
        </div>
      </div>

      {/* Formulário de Teste */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Enviar Email de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email de Destino</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email para teste"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSendTest}
              disabled={loading || !email}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Teste
                </>
              )}
            </Button>

            {result && (
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {result.success ? 'Sucesso' : 'Falha'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado do Teste */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Resultado do Teste
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyResult}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Email enviado com sucesso!</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Destinatário:</span>
                    <p className="text-gray-900">{result.testEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Timestamp:</span>
                    <p className="text-gray-900">{new Date(result.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                  {result.result?.id && (
                    <div>
                      <span className="font-medium text-gray-700">Resend ID:</span>
                      <p className="text-gray-900 font-mono text-xs">{result.result.id}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Domínio:</span>
                    <p className="text-gray-900">vetris.app ✅</p>
                  </div>
                </div>

                <p className="text-green-700 mt-3">
                  ✅ {result.message}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Falha no envio</span>
                </div>
                
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Erro:</span>
                    <p className="text-red-900 bg-red-100 p-2 rounded mt-1 font-mono text-xs">
                      {result.error}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Email de destino:</span>
                    <p className="text-gray-900">{result.testEmail || email}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Possíveis soluções:</p>
                      <ul className="text-yellow-700 mt-1 space-y-1">
                        <li>• Verificar se o domínio vetris.app está verificado no Resend</li>
                        <li>• Confirir a API key do Resend</li>
                        <li>• Verificar limites de envio</li>
                        <li>• Checar logs detalhados no dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detalhes técnicos */}
            <details className="border rounded-lg">
              <summary className="cursor-pointer p-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                Detalhes Técnicos
              </summary>
              <div className="p-3 bg-gray-50">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Como funciona o teste
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Processo do teste:</p>
              <ol className="list-decimal list-inside text-gray-600 mt-1 space-y-1">
                <li>Sistema conecta com Resend API</li>
                <li>Cria email HTML profissional com logo Vetris</li>
                <li>Envia via domínio verificado noreply@vetris.app</li>
                <li>Retorna resultado detalhado com diagnóstico</li>
              </ol>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">O que verificar no email recebido:</p>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                <li>Logo Vetris aparece corretamente</li>
                <li>Layout responsivo e profissional</li>
                <li>Informações do teste detalhadas</li>
                <li>Remetente: noreply@vetris.app</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}