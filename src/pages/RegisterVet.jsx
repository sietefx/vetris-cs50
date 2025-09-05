import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { validateCRMV } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Stethoscope, CheckCircle, AlertTriangle, RefreshCw,
  PawPrint, User as UserIcon, Mail, Phone, MapPin,
  GraduationCap, Calendar, ArrowRight, X
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function RegisterVetPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Estados do convite
  const [inviteData, setInviteData] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    crmv: "",
    crmv_uf: "",
    clinic_name: "",
    clinic_address: "",
    clinic_phone: "",
    vet_specialties: [],
    bio: ""
  });

  // Estados de validação CRMV
  const [crmvValidation, setCrmvValidation] = useState({
    isValid: null,
    isValidating: false,
    error: null
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkInviteAndAuth();
  }, []);

  const checkInviteAndAuth = async () => {
    try {
      setLoading(true);
      
      // Verificar se há código de convite na URL
      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');

      if (!inviteCode) {
        setInviteError("Código de convite não encontrado na URL");
        setLoading(false);
        return;
      }

      // Buscar dados do convite
      const invitations = await VetInvitation.filter({
        invite_code: inviteCode
      }).catch(() => []);

      const invitation = invitations[0];

      if (!invitation) {
        setInviteError("Convite não encontrado ou inválido");
        setLoading(false);
        return;
      }

      if (invitation.status === "aceito") {
        setInviteError("Este convite já foi aceito");
        setLoading(false);
        return;
      }

      if (invitation.status === "expirado") {
        setInviteError("Este convite expirou");
        setLoading(false);
        return;
      }

      // Verificar se o convite não expirou
      const expiryDate = new Date(invitation.expiry_date);
      if (expiryDate < new Date()) {
        setInviteError("Este convite expirou");
        setLoading(false);
        return;
      }

      setInviteData(invitation);

      // Pré-preencher email se disponível
      setFormData(prev => ({
        ...prev,
        email: invitation.vet_email || ""
      }));

      // Verificar se já está autenticado
      try {
        const userData = await User.me();
        setCurrentUser(userData);

        // Se já é veterinário autenticado, apenas aceitar o convite
        if (userData.user_type === "veterinario") {
          await acceptInvitation(invitation, userData);
          return;
        }

        // Se é tutor, mostrar erro
        if (userData.user_type === "tutor") {
          setError("Você já possui uma conta como tutor. Para aceitar este convite, faça logout e cadastre-se como veterinário.");
          setLoading(false);
          return;
        }
      } catch (authError) {
        // Usuário não autenticado - continuar com o formulário de registro
        console.log("Usuário não autenticado, prosseguindo com registro");
      }

    } catch (error) {
      console.error("Erro ao verificar convite:", error);
      setInviteError("Erro ao verificar convite");
    } finally {
      setLoading(false);
    }
  };

  const validateCRMVInfo = async () => {
    if (!formData.crmv || !formData.crmv_uf) {
      setCrmvValidation({
        isValid: false,
        isValidating: false,
        error: "CRMV e UF são obrigatórios"
      });
      return;
    }

    try {
      setCrmvValidation(prev => ({ ...prev, isValidating: true, error: null }));

      const { data } = await validateCRMV({
        crmv: formData.crmv,
        uf: formData.crmv_uf
      });

      setCrmvValidation({
        isValid: data.isValid,
        isValidating: false,
        error: data.isValid ? null : (data.error || "CRMV inválido")
      });

    } catch (error) {
      console.error("Erro na validação do CRMV:", error);
      setCrmvValidation({
        isValid: false,
        isValidating: false,
        error: "Erro ao validar CRMV"
      });
    }
  };

  const acceptInvitation = async (invitation, user) => {
    try {
      await VetInvitation.update(invitation.id, {
        ...invitation,
        status: "aceito",
        response_date: new Date().toISOString().split('T')[0]
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = createPageUrl("VetDashboard");
      }, 2000);

    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      setError("Erro ao aceitar convite");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset validação CRMV se campos relevantes mudaram
    if (field === "crmv" || field === "crmv_uf") {
      setCrmvValidation({
        isValid: null,
        isValidating: false,
        error: null
      });
    }
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData(prev => ({
      ...prev,
      vet_specialties: prev.vet_specialties.includes(specialty)
        ? prev.vet_specialties.filter(s => s !== specialty)
        : [...prev.vet_specialties, specialty]
    }));
  };

  const validateForm = () => {
    const requiredFields = ['full_name', 'email', 'crmv', 'crmv_uf'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`);
      return false;
    }

    if (!crmvValidation.isValid) {
      setError("CRMV deve ser validado antes do cadastro");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      // 1. Fazer login/registro do usuário
      await User.login();

      // 2. Aguardar autenticação
      setTimeout(async () => {
        try {
          const userData = await User.me();
          
          // 3. Atualizar dados do usuário
          await User.updateMyUserData({
            ...formData,
            user_type: "veterinario",
            profile_setup_complete: true,
            vet_onboarding_complete: true
          });

          // 4. Aceitar o convite
          await acceptInvitation(inviteData, userData);

        } catch (updateError) {
          console.error("Erro ao atualizar dados:", updateError);
          setError("Erro ao finalizar cadastro");
          setSubmitting(false);
        }
      }, 2000);

    } catch (error) {
      console.error("Erro ao processar registro:", error);
      setError("Erro ao processar cadastro");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando convite...</p>
        </div>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Card className="text-center">
            <CardContent className="p-8">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Convite Inválido</h2>
              <p className="text-gray-600 mb-6">{inviteError}</p>
              <Button
                onClick={() => window.location.href = createPageUrl("Welcome")}
                variant="outline"
              >
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Bem-vindo ao Vetris!</h2>
              <p className="text-gray-600 mb-6">
                Convite aceito com sucesso. Redirecionando para seu dashboard...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const availableSpecialties = [
    "Clínica Geral",
    "Cirurgia",
    "Dermatologia",
    "Cardiologia",
    "Oncologia",
    "Oftalmologia",
    "Ortopedia",
    "Neurologia",
    "Endocrinologia",
    "Comportamento",
    "Animais Silvestres",
    "Emergência"
  ];

  const brazilianStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Logo */}
      <div className="text-center pt-8 pb-6">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/71990b_Asset8.png"
          alt="Vetris Logo"
          className="h-12 w-auto mx-auto"
        />
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header do Convite */}
          {inviteData && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-green-800">
                      Você foi convidado por {inviteData.pet_owner_name}
                    </h2>
                    <p className="text-green-700 text-sm">
                      Para acompanhar {inviteData.pets?.map(p => p.pet_name).join(', ')} no Vetris
                    </p>
                    {inviteData.message && (
                      <div className="mt-2 p-3 bg-white rounded border border-green-200">
                        <p className="text-sm italic text-gray-700">"{inviteData.message}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg">
            <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Stethoscope className="w-8 h-8" />
                Cadastro de Veterinário
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dados Pessoais */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                    Dados Pessoais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name">Nome Completo *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Dr(a). João Silva"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="veterinario@clinica.com"
                        required
                        disabled={!!inviteData?.vet_email}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Profissionais */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Dados Profissionais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="crmv">CRMV *</Label>
                      <Input
                        id="crmv"
                        value={formData.crmv}
                        onChange={(e) => handleInputChange("crmv", e.target.value)}
                        placeholder="12345"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="crmv_uf">UF do CRMV *</Label>
                      <select
                        id="crmv_uf"
                        value={formData.crmv_uf}
                        onChange={(e) => handleInputChange("crmv_uf", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Selecione</option>
                        {brazilianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={validateCRMVInfo}
                        disabled={crmvValidation.isValidating || !formData.crmv || !formData.crmv_uf}
                        className="w-full"
                        variant={crmvValidation.isValid ? "default" : "outline"}
                      >
                        {crmvValidation.isValidating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Validando...
                          </>
                        ) : crmvValidation.isValid ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Validado
                          </>
                        ) : (
                          "Validar CRMV"
                        )}
                      </Button>
                    </div>
                  </div>

                  {crmvValidation.error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {crmvValidation.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {crmvValidation.isValid && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        CRMV validado com sucesso!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Especialidades */}
                <div className="space-y-4">
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSpecialties.map(specialty => (
                      <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.vet_specialties.includes(specialty)}
                          onChange={() => handleSpecialtyChange(specialty)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clínica */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Dados da Clínica
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clinic_name">Nome da Clínica</Label>
                      <Input
                        id="clinic_name"
                        value={formData.clinic_name}
                        onChange={(e) => handleInputChange("clinic_name", e.target.value)}
                        placeholder="Clínica Veterinária São Francisco"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clinic_phone">Telefone da Clínica</Label>
                      <Input
                        id="clinic_phone"
                        value={formData.clinic_phone}
                        onChange={(e) => handleInputChange("clinic_phone", e.target.value)}
                        placeholder="(11) 3333-4444"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="clinic_address">Endereço da Clínica</Label>
                    <Input
                      id="clinic_address"
                      value={formData.clinic_address}
                      onChange={(e) => handleInputChange("clinic_address", e.target.value)}
                      placeholder="Rua das Flores, 123 - Centro - São Paulo/SP"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Sobre você</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Fale um pouco sobre sua experiência e abordagem profissional..."
                    rows={4}
                  />
                </div>

                {/* Botão de Submit */}
                <div className="pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={submitting || !crmvValidation.isValid}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        Aceitar Convite e Cadastrar-se
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}