
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { PetUser } from "@/api/entities/PetUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { UserCheck, AlertTriangle, PawPrint, Mail, ArrowRight, CheckCircle2, Clock, X, RefreshCw, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const inviteType = searchParams.get("type");
  const inviteCode = searchParams.get("code");
  const inviteEmail = searchParams.get("email");
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [inviteAccepted, setInviteAccepted] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { toast } = useToast();
  
  useEffect(() => {
    checkUser();
  }, []);
  
  useEffect(() => {
    if (currentUser && inviteCode) {
      fetchInvitation();
    }
  }, [currentUser, inviteCode]);
  
  const checkUser = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);
      console.log("Usuário autenticado:", userData.email);
    } catch (error) {
      console.log("Usuário não autenticado");
    }
  };
  
  const fetchInvitation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os convites
      const invitations = await VetInvitation.list();
      
      console.log(`Buscando convite com código: ${inviteCode}`);
      
      // Filtrar pelo código do convite
      const foundInvitation = invitations.find(
        inv => inv.invite_code === inviteCode && inv.status === "pendente"
      );
      
      if (foundInvitation) {
        console.log("Convite encontrado:", foundInvitation);
        setInvitation(foundInvitation);
        
        // Verificar se o email do convite corresponde ao email atual
        if (inviteEmail && inviteEmail !== currentUser.email) {
          setError(`Este convite foi enviado para ${inviteEmail}. Você está logado com ${currentUser.email}. Para aceitar, faça login com a conta correta.`);
        }
      } else {
        console.log("Convite não encontrado ou já processado");
        setError("O código de convite é inválido, expirou ou já foi processado.");
        
        setDebugInfo({
          inviteCode: inviteCode,
          inviteType: inviteType,
          invitations: invitations.map(inv => ({
            id: inv.id,
            code: inv.invite_code,
            status: inv.status
          }))
        });
      }
    } catch (err) {
      console.error("Erro ao buscar convite:", err);
      setError("Ocorreu um erro ao processar o convite. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptInvite = async () => {
    if (!invitation || !currentUser) return;
    
    try {
      setProcessing(true);
      console.log("Processando aceitação de convite...");
      
      // Atualizar o status do convite
      await VetInvitation.update(invitation.id, {
        ...invitation,
        status: "aceito",
        response_date: new Date().toISOString().split('T')[0]
      });
      
      console.log("Convite atualizado com sucesso");
      
      // Criar a relação PetUser para cada pet no convite
      if (invitation.pets && invitation.pets.length > 0) {
        for (const petInfo of invitation.pets) {
          try {
            // Verificar se já existe uma relação
            const existingRelations = await PetUser.filter({
              pet_id: petInfo.pet_id,
              user_email: currentUser.email
            });
            
            if (!existingRelations || existingRelations.length === 0) {
              // Criar nova relação
              await PetUser.create({
                pet_id: petInfo.pet_id,
                user_id: currentUser.id,
                user_email: currentUser.email,
                relationship_type: "vet",
                permissions: ["read", "write"],
                added_by: invitation.pet_owner_id,
                added_date: new Date().toISOString().split('T')[0],
                is_active: true
              });
              
              console.log(`Relação PetUser criada para o pet ${petInfo.pet_name}`);
            } else {
              console.log(`Relação PetUser já existe para o pet ${petInfo.pet_id}`);
            }
          } catch (error) {
            console.error(`Erro ao criar relação para o pet ${petInfo.pet_id}:`, error);
          }
        }
      }
      
      // Atualizar as configurações de usuário para indicar que é um veterinário
      try {
        console.log("Atualizando dados do usuário para veterinário...");
        const updateResult = await User.updateMyUserData({
          user_type: "veterinario",
          profile_setup_complete: true
        });
        
        console.log("Dados do usuário atualizados com sucesso:", updateResult);
        
        setInviteAccepted(true);
        
        // Redirecionar para a dashboard de veterinário após 2 segundos
        setTimeout(() => {
          console.log("Redirecionando para VetDashboard...");
          window.location.href = "/VetDashboard";
        }, 2000);
        
      } catch (error) {
        console.error("Erro ao atualizar dados do usuário:", error);
        throw error;
      }
      
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      setError("Ocorreu um erro ao aceitar o convite. Por favor, tente novamente.");
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando informações do convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (inviteAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 px-6 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Convite Aceito!</h2>
            <p className="text-gray-600 mb-6">
              Seu acesso como veterinário foi confirmado. Redirecionando para sua dashboard...
            </p>
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Erro no Convite
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Não foi possível processar o convite</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="flex flex-col space-y-4">
              <Link to={createPageUrl("Home")}>
                <Button className="w-full" variant="outline">
                  Ir para página inicial
                </Button>
              </Link>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="default"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
            
            {debugInfo && (
              <div className="mt-8 p-4 border border-gray-200 rounded-md text-xs bg-gray-50 font-mono overflow-auto">
                <details>
                  <summary className="cursor-pointer mb-2 text-gray-700 font-medium">Informações de depuração</summary>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-amber-600 flex items-center justify-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Convite não encontrado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <Alert variant="warning" className="mb-6">
              <AlertTitle>Convite inválido ou expirado</AlertTitle>
              <AlertDescription>
                Não foi possível encontrar um convite ativo com este código.
                O convite pode ter expirado ou já foi utilizado.
              </AlertDescription>
            </Alert>
            
            <Link to={createPageUrl("Home")}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Ir para página inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center border-b pb-6">
          <div className="mx-auto mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f6c0fa_AppIconV.png" 
              alt="Vetris Logo"
              className="h-16 w-16 mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Convite para Veterinário</CardTitle>
          <CardDescription className="mt-2">
            Você foi convidado a acompanhar a saúde de um pet como veterinário
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-900">{invitation.vet_name}</h3>
                <p className="text-sm text-purple-700">{invitation.vet_email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Convite de:</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {invitation.pet_owner_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{invitation.pet_owner_name}</p>
                  <p className="text-sm text-gray-500">{invitation.pet_owner_email}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Pets incluídos no convite:</h3>
              <div className="space-y-2">
                {invitation.pets && invitation.pets.map((petInfo, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <PawPrint className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{petInfo.pet_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {invitation.message && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Mensagem:</h3>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 italic">
                  "{invitation.message}"
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-700" />
                Você terá as seguintes permissões:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 bg-purple-50 rounded-md text-sm text-purple-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Ver histórico médico
                </div>
                <div className="p-2 bg-purple-50 rounded-md text-sm text-purple-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Adicionar registros de saúde
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto order-2 sm:order-1"
            onClick={() => window.history.back()}
          >
            <X className="mr-2 h-4 w-4" />
            Recusar
          </Button>
          
          <Button 
            className="w-full sm:w-auto order-1 sm:order-2 bg-purple-600 hover:bg-purple-700"
            onClick={handleAcceptInvite}
            disabled={processing}
          >
            {processing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aceitar Convite e Acessar como Veterinário
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
