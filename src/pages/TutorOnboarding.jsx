import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Heart, Users, ArrowRight, Check } from "lucide-react";
import { createPageUrl } from "@/utils";
import CompletePetForm from "@/components/pets/CompletePetForm";

export default function TutorOnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showPetForm, setShowPetForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    bio: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.profile_setup_complete) {
        window.location.href = createPageUrl("Home");
        return;
      }

      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        address: userData.address || "",
        bio: userData.bio || ""
      });
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      window.location.href = createPageUrl("Welcome");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddPet = () => {
    console.log('🎯 [TutorOnboarding] Abrindo formulário de pet');
    setShowPetForm(true);
  };

  const handlePetSaved = async (savedPet) => {
    console.log('🎉 [TutorOnboarding] Pet salvo com sucesso:', savedPet);
    setShowPetForm(false);
    await handleFinish();
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      
      await User.updateMyUserData({
        ...formData,
        user_type: "tutor",
        profile_setup_complete: true
      });

      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Logo */}
      <div className="text-center pt-12 pb-8">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/71990b_Asset8.png"
          alt="Vetris Logo"
          className="h-16 w-auto mx-auto"
        />
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 ${
                      step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {step === 1 && "Bem-vindo ao Vetris!"}
                {step === 2 && "Conte-nos sobre você"}
                {step === 3 && "Quase pronto!"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              {step === 1 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-10 h-10 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Bem-vindo ao Vetris!</h3>
                    <p className="text-gray-600 mb-6">
                      A plataforma completa para cuidar da saúde e bem-estar do seu pet com carinho e tecnologia.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-4">O que você pode fazer:</h4>
                    <div className="grid grid-cols-1 gap-3 text-sm text-purple-700">
                      <div className="flex items-center">
                        <PawPrint className="w-4 h-4 mr-2" />
                        <span>Registre e acompanhe o histórico completo de saúde do seu pet em um só lugar</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        <span>Mantenha um diário com fotos, atividades e momentos especiais do seu pet</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Convide veterinários para acompanhar a saúde do seu pet de forma colaborativa</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Conte-nos sobre você</h3>
                    <p className="text-gray-600">Essas informações nos ajudam a personalizar sua experiência</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Nome completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Seu nome completo"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone (opcional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Endereço (opcional)</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Cidade, Estado"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Conte um pouco sobre você e seus pets (opcional)</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Ex: Sou apaixonado por animais, tenho 2 cachorros..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Quase pronto!</h3>
                    <p className="text-gray-600 mb-6">
                      Agora você pode adicionar seu primeiro pet ou pular esta etapa e fazer isso mais tarde.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-4">O que você pode fazer:</h4>
                    <div className="grid grid-cols-1 gap-3 text-sm text-purple-700">
                      <div className="flex items-center">
                        <PawPrint className="w-4 h-4 mr-2" />
                        <span>Adicionar informações do seu pet</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        <span>Registrar histórico de saúde</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Conectar-se com veterinários</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleAddPet}
                      className="bg-purple-600 hover:bg-purple-700 w-full"
                      type="button"
                      disabled={loading}
                    >
                      <PawPrint className="w-4 h-4 mr-2" />
                      Adicionar Pet
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={handleFinish}
                      disabled={loading}
                      type="button"
                    >
                      Pular e ir para o app
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6 border-t">
                {step > 1 && step < 3 && (
                  <Button variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                )}
                
                <div className="ml-auto">
                  {step < 2 ? (
                    <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : step === 2 ? (
                    <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                      Finalizar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modal para adicionar pet */}
          <CompletePetForm
            pet={null}
            isOpen={showPetForm}
            onClose={() => {
              console.log('❌ [TutorOnboarding] Fechando modal do pet');
              setShowPetForm(false);
            }}
            onSave={handlePetSaved}
          />
        </div>
      </div>
    </div>
  );
}