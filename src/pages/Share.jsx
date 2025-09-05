
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Copy, Share2, ArrowLeft, Check, Users, UserPlus, PawPrint, Shield, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function SharePage() {
  const { toast } = useToast();
  // URL base apontando para a nova página de boas-vindas
  const baseUrl = window.location.origin + createPageUrl("Welcome");

  const getInviteLink = (type) => {
    return `${baseUrl}${type === "veterinario" ? "?type=veterinario" : ""}`;
  };

  const getInviteMessage = (type) => {
    if (type === "veterinario") {
      return "Olá! Gostaria de convidar você para fazer parte do Vetris como veterinário. Ao criar sua conta, você poderá gerenciar seus pacientes e acompanhar a saúde dos pets de forma moderna e eficiente.";
    }
    return "Olá! Venha fazer parte do Vetris, uma plataforma completa para cuidar da saúde do seu pet. Registre-se e comece a acompanhar a saúde do seu pet de forma organizada.";
  };

  const handleCopy = (type) => {
    const link = getInviteLink(type);
    
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link copiado!",
        description: "Agora é só compartilhar com quem você quiser convidar.",
        variant: "success"
      });
    }).catch(() => {
      // Fallback para navegadores mais antigos ou ambientes restritos
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed'; // Evita scroll
      textArea.style.opacity = '0'; // Torna invisível
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast({
            title: "Link copiado!",
            description: "Agora é só compartilhar com quem você quiser convidar.",
            variant: "success"
          });
        } else {
          toast({
            title: "Falha ao copiar",
            description: "Por favor, copie o link manualmente: " + link,
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
        toast({
          title: "Falha ao copiar",
          description: "Por favor, copie o link manualmente: " + link,
          variant: "destructive"
        });
      } finally {
        document.body.removeChild(textArea);
      }
    });
  };

  const handleShare = (type) => {
    const link = getInviteLink(type);
    const message = getInviteMessage(type); // Get message here for both branches
    
    // Verificar se está em iframe ou se Web Share API não está disponível
    const isInIframe = window !== window.top;
    const hasWebShare = navigator.share && !isInIframe;
    
    if (hasWebShare) {
      navigator.share({
        title: type === "veterinario" ? "Convite para Veterinário - Vetris" : "Convite para Vetris",
        text: message,
        url: link
      }).catch(err => {
        console.error("Erro ao compartilhar:", err);
        // Fallback para WhatsApp se share nativo falhar (as per outline)
        const encodedMessage = encodeURIComponent(message + "\n\n" + link);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });
    } else {
      // Para iframes ou navegadores sem suporte, criar link do WhatsApp
      const encodedMessage = encodeURIComponent(message + "\n\n" + link);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      
      // Tentar abrir em nova aba
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      // Se popup foi bloqueado, copiar link e informar (using original robust check and toast)
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        handleCopy(type); // Still copy as a final fallback
        toast({
          title: "Popup bloqueado",
          description: "Link copiado! Cole no WhatsApp para compartilhar.",
          variant: "default"
        });
      }
    }
  };

  const FeatureItem = ({ icon, title, description }) => (
    <div className="flex gap-3 items-start">
      <div className="bg-purple-50 p-2 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-20 md:pb-8">
      <div className="mb-6">
        <Link 
          to={createPageUrl("Home")} 
          className="text-purple-600 hover:text-purple-700 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Convide para o Vetris</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Compartilhe a plataforma com veterinários e tutores de pets
          </p>
        </div>

        <Tabs defaultValue="tutor" className="mb-8">
          <TabsList className="w-full max-w-md mx-auto mb-6 grid grid-cols-2">
            <TabsTrigger value="tutor">Tutores</TabsTrigger>
            <TabsTrigger value="vet">Veterinários</TabsTrigger>
          </TabsList>

          <TabsContent value="tutor" className="space-y-6">
            <Card className="border-blue-100 shadow-md">
              <div className="flex flex-col md:flex-row">
                {/* Header para Mobile */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 md:hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <PawPrint className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xl text-gray-900">Convide Tutores</h2>
                      <p className="text-gray-600 text-sm">Compartilhe o Vetris</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar para Desktop */}
                <div className="hidden md:block md:w-1/3 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <PawPrint className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <h2 className="font-bold text-xl text-center text-gray-900">Convide Tutores</h2>
                  <p className="text-gray-600 text-center text-sm mt-2">
                    Compartilhe o Vetris com outros tutores
                  </p>
                </div>

                <div className="flex-1 p-4 md:p-6">
                  <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-xl">Convite para Tutores</CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">Pet Lover</Badge>
                    </div>
                    <CardDescription className="mt-2">
                      Ajude outros tutores a cuidar melhor da saúde de seus pets
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-0 space-y-6">
                    <div className="space-y-4">
                      <FeatureItem 
                        icon={<PawPrint className="h-5 w-5 text-blue-600" />}
                        title="Registro de Pets"
                        description="Cadastre todos os seus pets na plataforma"
                      />
                      <FeatureItem 
                        icon={<Shield className="h-5 w-5 text-blue-600" />}
                        title="Histórico de Saúde"
                        description="Acesso ao histórico completo de saúde"
                      />
                      <FeatureItem 
                        icon={<UserPlus className="h-5 w-5 text-blue-600" />}
                        title="Conexão com Veterinários"
                        description="Compartilhe dados com profissionais"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col px-0 space-y-4">
                    <div className="p-4 bg-blue-50 rounded-md text-sm text-blue-800">
                      <p>O link direciona para uma página de boas-vindas personalizada</p>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => handleShare("tutor")}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleCopy("tutor")}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="vet" className="space-y-6">
            <Card className="border-purple-100 shadow-md">
              <div className="flex flex-col md:flex-row">
                {/* Header para Mobile */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 md:hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xl text-gray-900">Convide Veterinários</h2>
                      <p className="text-gray-600 text-sm">Amplie sua rede</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar para Desktop */}
                <div className="hidden md:block md:w-1/3 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-10 w-10 text-purple-600" />
                    </div>
                  </div>
                  <h2 className="font-bold text-xl text-center text-gray-900">Convide Veterinários</h2>
                  <p className="text-gray-600 text-center text-sm mt-2">
                    Amplie sua rede profissional
                  </p>
                </div>

                <div className="flex-1 p-4 md:p-6">
                  <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-xl">Convite para Veterinários</CardTitle>
                      <Badge className="bg-purple-100 text-purple-800">Profissional</Badge>
                    </div>
                    <CardDescription className="mt-2">
                      Conecte-se com outros profissionais
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-0 space-y-6">
                    <div className="space-y-4">
                      <FeatureItem 
                        icon={<Users className="h-5 w-5 text-purple-600" />}
                        title="Gestão de Pacientes"
                        description="Acompanhe seus pacientes"
                      />
                      <FeatureItem 
                        icon={<Shield className="h-5 w-5 text-purple-600" />}
                        title="Histórico Médico"
                        description="Acesso ao histórico completo"
                      />
                      <FeatureItem 
                        icon={<PawPrint className="h-5 w-5 text-purple-600" />}
                        title="Registros Profissionais"
                        description="Adicione consultas"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col px-0 space-y-4">
                    <div className="p-4 bg-purple-50 rounded-md text-sm text-purple-800">
                      <p>Link para veterinários se cadastrarem</p>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => handleShare("veterinario")}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleCopy("veterinario")}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Como funciona o convite
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                <span className="font-medium text-blue-700">1</span>
              </div>
              <h4 className="font-medium mb-2">Compartilhe o link</h4>
              <p className="text-sm text-gray-600">Envie o convite por WhatsApp, email ou outra rede social</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                <span className="font-medium text-blue-700">2</span>
              </div>
              <h4 className="font-medium mb-2">Cadastro</h4>
              <p className="text-sm text-gray-600">O convidado cria uma conta ou faz login através do link</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                <span className="font-medium text-blue-700">3</span>
              </div>
              <h4 className="font-medium mb-2">Acesso imediato</h4>
              <p className="text-sm text-gray-600">Após o cadastro, o acesso às funcionalidades é liberado automaticamente</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
