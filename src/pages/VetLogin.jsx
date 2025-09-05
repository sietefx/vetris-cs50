
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, PawPrint, AlertTriangle, User as UserIcon, Mail, Lock, CheckCircle, Info
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";

export default function VetLoginPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("veterinario");
  const [registering, setRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    specialty: "",
    crmv: "",
    phone: ""
  });

  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0cd8cc_vetris_1.png";

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await User.me();
        if (user) {
          if (user.user_type === "veterinario") {
            navigate(createPageUrl("VetDashboard"));
          } else {
            navigate(createPageUrl("Home"));
          }
        }
      } catch (error) {
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleContinueAsVet = async () => {
    if (registering) {
      if (!validateForm()) {
        return;
      }
      
      try {
        setLoading(true);
        toast({
          description: "Solicitação de cadastro de veterinário enviada. Nossa equipe entrará em contato para verificação.",
          duration: 5000,
        });
        
        setRegistering(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: "Não foi possível realizar o cadastro. Tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        await User.login();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: "Não foi possível realizar o login. Tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = () => {
    if (!registerForm.fullName) {
      toast({
        variant: "destructive",
        description: "Por favor, informe seu nome completo.",
      });
      return false;
    }
    
    if (!registerForm.email) {
      toast({
        variant: "destructive",
        description: "Por favor, informe seu email.",
      });
      return false;
    }
    
    if (!registerForm.crmv) {
      toast({
        variant: "destructive",
        description: "Por favor, informe seu CRMV.",
      });
      return false;
    }
    
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white mb-4 border-2 border-purple-100">
            <img 
              src={logoUrl} 
              alt="Vetris"
              className="h-14 w-14 object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vetris</h1>
          <p className="text-gray-600 mt-1">Portal do Veterinário</p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{registering ? "Cadastro de Veterinário" : "Acesso para Veterinários"}</CardTitle>
            <CardDescription>
              {registering 
                ? "Preencha seus dados para solicitar acesso como veterinário" 
                : "Acesse para gerenciar os pets sob seus cuidados"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!registering ? (
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-100">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    Faça login com sua conta de email para acessar o painel de veterinário
                  </AlertDescription>
                </Alert>
                
                <Button 
                  className="w-full bg-purple-700 hover:bg-purple-800 font-medium"
                  onClick={handleContinueAsVet}
                  disabled={loading}
                >
                  {loading ? 
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </span> 
                  : "Continuar com Google"}
                </Button>
                
                <p className="text-center text-sm text-gray-500 mt-8">
                  Ainda não tem cadastro como veterinário?{" "}
                  <button 
                    onClick={() => setRegistering(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Solicitar acesso
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                    placeholder="Dr. Maria Silva"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    placeholder="maria.silva@clinicavet.com.br"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade (opcional)</Label>
                  <Input
                    id="specialty"
                    value={registerForm.specialty}
                    onChange={(e) => setRegisterForm({...registerForm, specialty: e.target.value})}
                    placeholder="Clínica Geral, Cirurgia, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crmv">CRMV</Label>
                  <Input
                    id="crmv"
                    value={registerForm.crmv}
                    onChange={(e) => setRegisterForm({...registerForm, crmv: e.target.value})}
                    placeholder="12345/SP"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <Alert className="bg-yellow-50 border-yellow-100">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Após o cadastro, nossa equipe verificará seus dados para liberação do acesso
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            {registering && (
              <div className="w-full space-y-4">
                <Button 
                  className="w-full bg-purple-700 hover:bg-purple-800 font-medium"
                  onClick={handleContinueAsVet}
                  disabled={loading}
                >
                  {loading ? 
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span> 
                  : "Solicitar cadastro"}
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setRegistering(false)}
                >
                  Voltar
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center">
          <Link to={createPageUrl("Home")} className="text-purple-600 hover:text-purple-700 text-sm">
            Voltar para a página inicial
          </Link>
          
          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} Vetris • Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
