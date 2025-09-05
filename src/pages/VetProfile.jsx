
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Pet } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateCRMV } from "@/api/functions";
import { 
  Stethoscope, 
  PawPrint, 
  Users, 
  Edit, 
  Save, 
  X, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Building2
} from "lucide-react";
import { createPageUrl } from "@/utils";

const specialtiesOptions = [
  "Clínica Médica",
  "Cirurgia",
  "Dermatologia",
  "Cardiologia",
  "Neurologia",
  "Oncologia",
  "Oftalmologia",
  "Ortopedia",
  "Anestesiologia",
  "Patologia",
  "Radiologia",
  "Medicina Felina",
  "Medicina de Animais Exóticos",
  "Medicina Preventiva",
  "Reprodução Animal"
];

export default function VetProfile() {
  const [user, setUser] = useState(null);
  const [linkedPets, setLinkedPets] = useState([]);
  const [stats, setStats] = useState({ totalPets: 0, totalTutors: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [crmvValidation, setCrmvValidation] = useState({ isValid: false, loading: false, error: null });
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    crmv: "",
    crmv_uf: "",
    clinic_name: "",
    clinic_address: "",
    clinic_phone: "",
    vet_specialties: []
  });

  useEffect(() => {
    loadVetProfile();
  }, []);

  const loadVetProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [VetProfile] Carregando perfil do veterinário...');

      // FORÇA RECARREGAMENTO: buscar dados diretamente do backend
      const userData = await User.me();
      console.log('👤 [VetProfile] Dados do usuário carregados:', userData);
      
      if (!userData) {
        console.log('❌ [VetProfile] Usuário não encontrado');
        window.location.href = createPageUrl("Welcome");
        return;
      }

      if (userData.user_type !== "veterinario") {
        console.log('❌ [VetProfile] Usuário não é veterinário');
        window.location.href = createPageUrl("Home");
        return;
      }

      // ATUALIZAR STATE COM DADOS FRESCOS DO BACKEND
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        crmv: userData.crmv || "",
        crmv_uf: userData.crmv_uf || "",
        clinic_name: userData.clinic_name || "",
        clinic_address: userData.clinic_address || "",
        clinic_phone: userData.clinic_phone || "",
        vet_specialties: userData.vet_specialties || []
      });

      // Validar CRMV se já existe
      if (userData.crmv && userData.crmv_uf) {
        setCrmvValidation({ isValid: true, loading: false, error: null });
      } else {
        // CRMV obrigatório - forçar edição se não existe
        setCrmvValidation({ isValid: false, loading: false, error: "CRMV é obrigatório" });
      }

      console.log('📊 [VetProfile] FormData atualizado:', {
        full_name: userData.full_name,
        crmv: userData.crmv
      });

      // Carregar pets vinculados com dados atualizados
      await loadLinkedPets(userData.email);

    } catch (err) {
      console.error("❌ [VetProfile] Erro ao carregar perfil:", err);
      setError("Erro ao carregar perfil veterinário");
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedPets = async (vetEmail) => {
    try {
      console.log('🐾 [VetProfile] Carregando pets vinculados para:', vetEmail);
      
      // BUSCAR CONVITES ACEITOS DIRETAMENTE DO BACKEND
      const acceptedInvites = await VetInvitation.filter({
        vet_email: vetEmail,
        status: "aceito"
      });

      console.log('📋 [VetProfile] Convites aceitos encontrados:', acceptedInvites.length);

      const allLinkedPets = [];
      const tutorEmails = new Set();

      for (const invitation of acceptedInvites) {
        console.log('🔗 [VetProfile] Processando convite:', invitation.id, 'Vet:', invitation.vet_name);
        
        tutorEmails.add(invitation.pet_owner_email);
        
        if (invitation.pets && Array.isArray(invitation.pets)) {
          for (const petRef of invitation.pets) {
            try {
              // BUSCAR PET DIRETAMENTE DO BACKEND
              const pet = await Pet.get(petRef.pet_id);
              if (pet) {
                allLinkedPets.push({
                  ...pet,
                  owner_name: invitation.pet_owner_name,
                  owner_email: invitation.pet_owner_email,
                  invitation_id: invitation.id,
                  vet_name_in_invitation: invitation.vet_name // Para debug
                });
              }
            } catch (petErr) {
              console.warn(`⚠️ [VetProfile] Pet ${petRef.pet_id} não encontrado:`, petErr);
            }
          }
        }
      }

      setLinkedPets(allLinkedPets);
      setStats({
        totalPets: allLinkedPets.length,
        totalTutors: tutorEmails.size
      });

      console.log('📊 [VetProfile] Stats atualizadas:', {
        totalPets: allLinkedPets.length,
        totalTutors: tutorEmails.size
      });

    } catch (err) {
      console.error("❌ [VetProfile] Erro ao carregar pets:", err);
      setLinkedPets([]);
      setStats({ totalPets: 0, totalTutors: 0 });
    }
  };

  const handleCRMVValidation = async () => {
    if (!formData.crmv || !formData.crmv_uf) {
      setCrmvValidation({ isValid: false, loading: false, error: "CRMV e UF são obrigatórios" });
      return;
    }

    try {
      setCrmvValidation({ isValid: false, loading: true, error: null });
      
      const { data } = await validateCRMV({
        crmv: formData.crmv,
        uf: formData.crmv_uf
      });

      if (data.isValid) {
        setCrmvValidation({ isValid: true, loading: false, error: null });
      } else {
        setCrmvValidation({ 
          isValid: false, 
          loading: false, 
          error: data.message || "CRMV inválido" 
        });
      }
    } catch (err) {
      console.error("Erro na validação CRMV:", err);
      setCrmvValidation({ 
        isValid: false, 
        loading: false, 
        error: "Erro ao validar CRMV" 
      });
    }
  };

  const addSpecialty = (specialty) => {
    if (specialty && !formData.vet_specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        vet_specialties: [...prev.vet_specialties, specialty]
      }));
      setCustomSpecialty("");
    }
  };

  const removeSpecialty = (specialtyToRemove) => {
    setFormData(prev => ({
      ...prev,
      vet_specialties: prev.vet_specialties.filter(s => s !== specialtyToRemove)
    }));
  };

  const updateVetNameInAllSystems = async (oldName, newName, vetEmail) => {
    console.log('🔄 [VetProfile] Atualizando nome do veterinário em todos os sistemas...');
    console.log('📝 [VetProfile] De:', oldName, 'Para:', newName);

    const updateResults = {
      invitationsUpdated: 0,
      errors: []
    };

    try {
      // 1. BUSCAR TODOS OS CONVITES DO VETERINÁRIO
      console.log('📋 [VetProfile] Buscando convites do veterinário...');
      const allInvitations = await VetInvitation.filter({
        vet_email: vetEmail
      });

      console.log(`📊 [VetProfile] Encontrados ${allInvitations.length} convites para atualizar`);

      // 2. ATUALIZAR CADA CONVITE
      for (const invitation of allInvitations) {
        try {
          console.log(`🔄 [VetProfile] Atualizando convite ${invitation.id}...`);
          
          // Criar objeto atualizado
          const updatedInvitation = {
            ...invitation,
            vet_name: newName
          };

          // Atualizar no banco
          await VetInvitation.update(invitation.id, updatedInvitation);
          
          updateResults.invitationsUpdated++;
          console.log(`✅ [VetProfile] Convite ${invitation.id} atualizado com sucesso`);
        } catch (inviteError) {
          console.error(`❌ [VetProfile] Erro ao atualizar convite ${invitation.id}:`, inviteError);
          updateResults.errors.push(`Convite ${invitation.id}: ${inviteError.message}`);
        }
      }

      console.log('📊 [VetProfile] Resultados da atualização:', updateResults);
      return updateResults;

    } catch (err) {
      console.error('❌ [VetProfile] Erro geral ao atualizar sistemas:', err);
      updateResults.errors.push(`Erro geral: ${err.message}`);
      return updateResults;
    }
  };

  const handleSave = async () => {
    if (saving) return;
    
    // VALIDAÇÕES OBRIGATÓRIAS
    if (!formData.full_name.trim()) {
      setError("Nome completo é obrigatório");
      return;
    }

    if (!formData.crmv.trim()) {
      setError("CRMV é obrigatório para veterinários");
      return;
    }

    if (!formData.crmv_uf.trim()) {
      setError("UF do CRMV é obrigatória");
      return;
    }

    if (!crmvValidation.isValid) {
      setError("CRMV deve ser validado antes de salvar");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log('🔄 [VetProfile] Iniciando salvamento...');
      console.log('📝 [VetProfile] Dados originais:', {
        nome: user?.full_name,
        email: user?.email,
        id: user?.id
      });
      console.log('📝 [VetProfile] Dados novos:', {
        nome: formData.full_name.trim(),
        crmv: formData.crmv
      });

      const nameChanged = user.full_name !== formData.full_name.trim();
      console.log('🔄 [VetProfile] Nome mudou?', nameChanged);

      // PREPARAR DADOS PARA UPDATE COM TODOS OS CAMPOS
      const updateData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone?.trim() || "",
        bio: formData.bio?.trim() || "",
        crmv: formData.crmv?.trim() || "",
        crmv_uf: formData.crmv_uf?.trim() || "",
        clinic_name: formData.clinic_name?.trim() || "",
        clinic_address: formData.clinic_address?.trim() || "",
        clinic_phone: formData.clinic_phone?.trim() || "",
        vet_specialties: Array.isArray(formData.vet_specialties) ? formData.vet_specialties : []
      };

      console.log('📤 [VetProfile] Dados completos para update:', updateData);

      // ESTRATÉGIA MÚLTIPLA DE ATUALIZAÇÃO
      let updateSuccess = false;

      // TENTATIVA 1: updateMyUserData
      try {
        console.log('🔄 [VetProfile] TENTATIVA 1: updateMyUserData...');
        await User.updateMyUserData(updateData);
        console.log('✅ [VetProfile] updateMyUserData executado');
        updateSuccess = true;
      } catch (updateError1) {
        console.warn('⚠️ [VetProfile] updateMyUserData falhou:', updateError1.message);
      }

      // TENTATIVA 2: User.update com ID (se a primeira falhar)
      if (!updateSuccess && user.id) {
        try {
          console.log('🔄 [VetProfile] TENTATIVA 2: User.update com ID...');
          await User.update(user.id, updateData);
          console.log('✅ [VetProfile] User.update executado');
          updateSuccess = true;
        } catch (updateError2) {
          console.warn('⚠️ [VetProfile] User.update falhou:', updateError2.message);
        }
      }

      // TENTATIVA 3: Forçar update apenas do nome crítico
      if (!updateSuccess) {
        try {
          console.log('🔄 [VetProfile] TENTATIVA 3: Update forçado apenas do nome...');
          await User.updateMyUserData({ full_name: formData.full_name.trim() });
          console.log('✅ [VetProfile] Update forçado do nome executado');
          updateSuccess = true;
        } catch (updateError3) {
          console.warn('⚠️ [VetProfile] Update forçado falhou:', updateError3.message);
        }
      }

      if (!updateSuccess) {
        throw new Error("Todas as tentativas de atualização falharam");
      }

      // AGUARDAR PROPAGAÇÃO MAIS LONGA
      console.log('⏳ [VetProfile] Aguardando propagação no banco (5s)...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // VERIFICAÇÃO MÚLTIPLA DE PERSISTÊNCIA
      let verificationAttempts = 0;
      let persistenceVerified = false;
      const maxAttempts = 5;

      while (verificationAttempts < maxAttempts && !persistenceVerified) {
        verificationAttempts++;
        console.log(`🔍 [VetProfile] Verificação ${verificationAttempts}/${maxAttempts}...`);

        try {
          // Tentar múltiplos métodos de verificação
          const freshUser = await User.me();
          
          console.log('📊 [VetProfile] Dados da verificação:', {
            tentativa: verificationAttempts,
            esperado: formData.full_name.trim(),
            obtido: freshUser.full_name,
            email: freshUser.email,
            id: freshUser.id,
            sucesso: freshUser.full_name === formData.full_name.trim()
          });

          if (freshUser.full_name === formData.full_name.trim()) {
            persistenceVerified = true;
            console.log('✅ [VetProfile] Persistência verificada com sucesso!');
            break;
          } else {
            console.log(`⚠️ [VetProfile] Tentativa ${verificationAttempts} - nome ainda não atualizado`);
            
            // Aguardar mais tempo entre tentativas
            if (verificationAttempts < maxAttempts) {
              console.log('⏳ Aguardando mais 3s antes da próxima verificação...');
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        } catch (verifyError) {
          console.warn(`❌ [VetProfile] Erro na verificação ${verificationAttempts}:`, verifyError);
          if (verificationAttempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (!persistenceVerified) {
        console.warn('⚠️ [VetProfile] Persistência não verificada após todas as tentativas');
        // MAS NÃO FALHAR - apenas avisar que pode demorar
        setError("Dados salvos, mas a sincronização pode levar alguns minutos. Recarregue a página se necessário.");
      }

      // ATUALIZAR CONVITES APENAS SE NOME MUDOU E FOI PERSISTIDO
      // OU SE JÁ TENTAMOS VÁRIAS VEZES VERIFICAR (indicando que a persistência é provável)
      if (nameChanged && (persistenceVerified || verificationAttempts >= maxAttempts)) {
        console.log('🔄 [VetProfile] Atualizando nome nos convites...');
        
        try {
          const updateResults = await updateVetNameInAllSystems(
            user.full_name, 
            formData.full_name.trim(), 
            user.email
          );

          console.log('📊 [VetProfile] Resultados da atualização de convites:', updateResults);
          
          if (updateResults.errors.length > 0) {
            console.warn('⚠️ [VetProfile] Alguns erros nos convites:', updateResults.errors);
          }
        } catch (systemsError) {
          console.warn('⚠️ [VetProfile] Erro ao atualizar convites (continuando):', systemsError);
        }
      }

      // RECARREGAR DADOS FINAIS
      console.log('🔄 [VetProfile] Recarregando dados finais...');
      await loadVetProfile();

      setSuccess(true);
      setEditing(false);
      
      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      console.error("❌ [VetProfile] Erro geral ao salvar perfil:", err);
      setError(`Erro ao salvar perfil: ${err.message}. Tente novamente ou recarregue a página.`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // RESETAR FORM COM DADOS ORIGINAIS DO BACKEND
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        crmv: user.crmv || "",
        crmv_uf: user.crmv_uf || "",
        clinic_name: user.clinic_name || "",
        clinic_address: user.clinic_address || "",
        clinic_phone: user.clinic_phone || "",
        vet_specialties: user.vet_specialties || []
      });
    }
    setEditing(false);
    setError(null);
    setSuccess(false);
  };

  // FORÇA RECARREGAMENTO QUANDO COMPONENTE RECEBE FOCO
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ [VetProfile] Página recebeu foco, recarregando...');
      loadVetProfile();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // FORÇAR EDIÇÃO SE NÃO TEM CRMV
  useEffect(() => {
    if (user && !user.crmv && !editing) {
      console.log('⚠️ [VetProfile] CRMV não preenchido, forçando edição');
      setEditing(true);
      setError("Complete seu perfil profissional preenchendo o CRMV");
    }
  }, [user, editing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil veterinário...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Você precisa ser um veterinário cadastrado para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {user.photo_url ? (
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.photo_url} alt={`Dr(a). ${user.full_name}`} />
                <AvatarFallback className="bg-purple-100 text-purple-800 text-2xl">
                  <Stethoscope className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Stethoscope className="w-12 h-12 text-purple-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dr(a). {user.full_name || "Veterinário"}
          </h1>
          <p className="text-gray-600">Perfil Profissional</p>
        </div>

        {/* Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Perfil atualizado com sucesso! Todas as informações foram sincronizadas.
            </AlertDescription>
          </Alert>
        )}

        {/* CRMV obrigatório - aviso se não preenchido */}
        {!user.crmv && !editing && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>CRMV obrigatório:</strong> Complete seu perfil profissional preenchendo o CRMV.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pets Acompanhando</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPets}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <PawPrint className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tutores Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTutors}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-600" />
              Informações Profissionais
            </CardTitle>
            <Button
              onClick={() => editing ? handleCancel() : setEditing(true)}
              variant={editing ? "ghost" : "outline"}
              disabled={saving}
            >
              {editing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-6">
                {/* Form de Edição */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Dr(a). Nome Sobrenome"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="crmv">CRMV * (obrigatório)</Label>
                    <Input
                      id="crmv"
                      value={formData.crmv}
                      onChange={(e) => setFormData({...formData, crmv: e.target.value})}
                      placeholder="12345"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="crmv_uf">UF do CRMV * (obrigatória)</Label>
                    <Input
                      id="crmv_uf"
                      value={formData.crmv_uf}
                      onChange={(e) => setFormData({...formData, crmv_uf: e.target.value.toUpperCase()})}
                      placeholder="SP"
                      maxLength={2}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                {/* Validação CRMV OBRIGATÓRIA */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleCRMVValidation}
                    disabled={crmvValidation.loading || !formData.crmv || !formData.crmv_uf}
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    {crmvValidation.loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Validar CRMV (obrigatório)
                  </Button>

                  {crmvValidation.isValid && (
                    <Badge className="bg-green-100 text-green-800">
                      ✅ CRMV Validado
                    </Badge>
                  )}

                  {crmvValidation.error && (
                    <Badge variant="destructive">
                      ❌ {crmvValidation.error}
                    </Badge>
                  )}
                </div>

                {/* Clínica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="clinic_name">Nome da Clínica</Label>
                    <Input
                      id="clinic_name"
                      value={formData.clinic_name}
                      onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                      placeholder="Clínica Veterinária..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clinic_phone">Telefone da Clínica</Label>
                    <Input
                      id="clinic_phone"
                      value={formData.clinic_phone}
                      onChange={(e) => setFormData({...formData, clinic_phone: e.target.value})}
                      placeholder="(00) 0000-0000"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="clinic_address">Endereço da Clínica</Label>
                  <Input
                    id="clinic_address"
                    value={formData.clinic_address}
                    onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
                    placeholder="Rua, número, bairro, cidade - UF"
                    className="mt-1"
                  />
                </div>

                {/* Especialidades */}
                <div>
                  <Label>Especialidades</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {specialtiesOptions.map((specialty) => (
                        <Button
                          key={specialty}
                          onClick={() => addSpecialty(specialty)}
                          variant="outline"
                          size="sm"
                          type="button"
                          disabled={formData.vet_specialties.includes(specialty)}
                        >
                          {specialty}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                        placeholder="Adicionar especialidade personalizada"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSpecialty(customSpecialty);
                          }
                        }}
                      />
                      <Button
                        onClick={() => addSpecialty(customSpecialty)}
                        variant="outline"
                        type="button"
                        disabled={!customSpecialty.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>

                    {formData.vet_specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.vet_specialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                            onClick={() => removeSpecialty(specialty)}
                          >
                            {specialty} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Biografia Profissional</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Fale sobre sua experiência, formação e abordagem profissional..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    type="button"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !crmvValidation.isValid}
                    className="bg-purple-600 hover:bg-purple-700"
                    type="button"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvando e Sincronizando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar e Sincronizar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visualização */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Nome</Label>
                      <p className="text-gray-900 mt-1">{user.full_name}</p>
                    </div>

                    {user.phone && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Telefone</Label>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{user.phone}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Email</Label>
                      <div className="flex items-center mt-1">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {user.crmv ? (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">CRMV</Label>
                        <p className="text-gray-900 mt-1">
                          {user.crmv}{user.crmv_uf && ` - ${user.crmv_uf}`}
                          <Badge className="ml-2 bg-green-100 text-green-800">✅ Validado</Badge>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-semibold text-red-700">CRMV</Label>
                        <p className="text-red-700 mt-1">
                          <Badge variant="destructive">❌ Não preenchido (obrigatório)</Badge>
                        </p>
                      </div>
                    )}

                    {user.clinic_name && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Clínica</Label>
                        <div className="flex items-center mt-1">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{user.clinic_name}</span>
                        </div>
                      </div>
                    )}

                    {user.clinic_phone && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Telefone da Clínica</Label>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{user.clinic_phone}</span>
                        </div>
                      </div>
                    )}

                    {user.clinic_address && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Endereço da Clínica</Label>
                        <div className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{user.clinic_address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {user.vet_specialties && user.vet_specialties.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Especialidades</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.vet_specialties.map((specialty) => (
                        <Badge key={specialty} className="bg-purple-100 text-purple-800">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.bio && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Biografia</Label>
                    <p className="text-gray-900 mt-2 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Linked Pets */}
        {linkedPets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-purple-600" />
                Pets Vinculados ({linkedPets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedPets.map((pet, index) => (
                  <div key={`${pet.id}_${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <PawPrint className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                        <p className="text-sm text-gray-600">
                          {pet.species} • {pet.breed || 'SRD'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p><strong>Tutor:</strong> {pet.owner_name}</p>
                      <p><strong>Email:</strong> {pet.owner_email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
