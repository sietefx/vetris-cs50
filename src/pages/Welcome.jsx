
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Stethoscope, Heart, Users, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function WelcomePage() {
  const [userType, setUserType] = useState("tutor");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type");
    if (type === "veterinario") {
      setUserType("veterinario");
    }
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      if (userType === "veterinario") {
        window.location.href = createPageUrl("VetOnboarding");
      } else {
        // Para tutores, fazer login e depois redirecionar para onboarding
        await User.login();
        // Aguardar um pouco para o login ser processado
        setTimeout(() => {
          window.location.href = createPageUrl("TutorOnboarding");
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      // Em caso de erro, tentar redirecionar mesmo assim
      if (userType === "veterinario") {
        window.location.href = createPageUrl("VetOnboarding");
      } else {
        window.location.href = createPageUrl("TutorOnboarding");
      }
    } finally {
      setLoading(false);
    }
  };

  if (userType === "veterinario") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        {/* Logo externa no topo */}
        <div className="text-center pt-12 pb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/71990b_Asset8.png"
              alt="Vetris Logo"
              className="h-16 w-auto"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Bem-vindo ao <span className="text-purple-600">Vetris</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                A plataforma completa para veterinários gerenciarem seus pacientes e 
                acompanharem a saúde dos pets com tecnologia moderna.
              </p>
              <Badge className="mt-4 bg-purple-100 text-purple-800 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Plataforma Profissional Veterinária
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Gestão de Pacientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Acesse e gerencie o histórico completo de saúde de todos os seus pacientes em um só lugar.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Histórico Médico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Acompanhe vacinas, medicamentos, consultas e evolução da saúde de cada pet.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Convites de Tutores</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Receba convites de tutores para acompanhar a saúde de seus pets de forma colaborativa.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Pronto para revolucionar seu atendimento veterinário?
                </h2>
                <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                  Junte-se à plataforma que está transformando o cuidado veterinário no Brasil. 
                  Conecte-se com tutores e ofereça um acompanhamento de excelência.
                </p>
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3"
                >
                  {loading ? "Carregando..." : "Entrar como Veterinário"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-purple-200 text-sm mt-4">
                  Acesso gratuito • Cadastro em menos de 2 minutos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Interface para tutores
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Logo externa no topo */}
      <div className="text-center pt-12 pb-8">
        <div className="flex justify-center mb-4">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/71990b_Asset8.png"
            alt="Vetris Logo"
            className="h-16 w-auto"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo ao <span className="text-purple-600">Vetris</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              A plataforma completa para cuidar da saúde e bem-estar do seu pet com carinho e tecnologia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Saúde do Pet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Registre e acompanhe o histórico completo de saúde do seu pet em um só lugar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Diário do Pet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Mantenha um diário com fotos, atividades e momentos especiais do seu pet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Conecte-se com Vets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Convide veterinários para acompanhar a saúde do seu pet de forma colaborativa.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Comece a cuidar melhor do seu pet hoje mesmo
              </h2>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Venha fazer parte do Vetris, uma plataforma completa para cuidar da saúde do seu pet. 
                Registre-se e comece a acompanhar a saúde do seu pet de forma organizada.
              </p>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3"
              >
                {loading ? "Carregando..." : "Começar Agora"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-purple-200 text-sm mt-4">
                Gratuito • Fácil de usar • Seguro
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
