
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { User } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  PawPrint, Calendar as CalendarIcon, Heart, User as UserIcon,
  Phone, Mail, MapPin, Shield, AlertTriangle, RefreshCw,
  Pencil, Check, X, Save, Camera, Users, Star, Edit3,
  Stethoscope, Award, GraduationCap, Building2, Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { updateUserProfile } from "@/api/functions";
import ProfilePhotoUpload from "@/components/photo-upload/ProfilePhotoUpload";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [linkedPets, setLinkedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    photo_url: "",
    // Campos específicos para veterinários
    crmv: "",
    crmv_uf: "",
    vet_specialties: [],
    clinic_name: "",
    clinic_address: "",
    clinic_phone: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [Profile] Carregando dados do usuário...');

      const userData = await User.me().catch(async (err) => {
        console.warn('⚠️ [Profile] User.me() falhou, tentando alternativas:', err);
        
        // Tentativa alternativa - verificar se é erro de autenticação
        if (err.message?.includes('Network Error') || err.status === 401) {
          // Redirecionar para página de boas-vindas se não autenticado
          console.log('🔄 [Profile] Redirecionando para Welcome devido a erro de rede/auth');
          window.location.href = createPageUrl("Welcome");
          return null; // Return null to stop further processing in this function
        }
        
        throw err; // Re-throw other errors
      });

      if (!userData) {
        console.log('❌ [Profile] Usuário não encontrado ou redirecionado, parando execução');
        return;
      }

      console.log('✅ [Profile] Usuário carregado:', userData.user_type);
      setUser(userData);

      // Definir dados do formulário baseado no tipo de usuário
      setProfileData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        bio: userData.bio || "",
        photo_url: userData.photo_url || "",
        // Campos específicos para veterinários
        crmv: userData.crmv || "",
        crmv_uf: userData.crmv_uf || "",
        vet_specialties: userData.vet_specialties || [],
        clinic_name: userData.clinic_name || "",
        clinic_address: userData.clinic_address || "",
        clinic_phone: userData.clinic_phone || ""
      });

      // Carregar dados específicos conforme tipo de usuário
      if (userData.user_type === "veterinario") {
        // Para veterinários, carregar pets vinculados através de convites aceitos
        try {
          console.log('🐾 [Profile] Carregando pets vinculados para veterinário...');
          
          const invitations = await VetInvitation.filter({ 
            vet_email: userData.email, 
            status: "aceito" 
          }).catch((err) => {
            console.warn('⚠️ [Profile] Erro ao carregar convites:', err);
            return []; // Return empty array on error
          });

          const petsFromInvitations = invitations.reduce((acc, invitation) => {
            if (invitation.pets && Array.isArray(invitation.pets)) {
              return acc.concat(invitation.pets.map(pet => ({
                ...pet,
                owner_name: invitation.pet_owner_name,
                owner_email: invitation.pet_owner_email
              })));
            }
            return acc;
          }, []);
          
          console.log('✅ [Profile] Pets vinculados carregados:', petsFromInvitations.length);
          setLinkedPets(petsFromInvitations);
        } catch (err) {
          console.warn("⚠️ [Profile] Erro ao carregar pets vinculados:", err);
          setLinkedPets([]);
        }
      } else {
        // Para tutores, carregar pets próprios
        try {
          console.log('🐾 [Profile] Carregando pets próprios para tutor...');
          
          const petsData = await Pet.filter({ created_by: userData.email }).catch(async (err) => {
            console.warn('⚠️ [Profile] Pet.filter falhou, tentando Pet.list:', err);
            try {
              const allPets = await Pet.list();
              return allPets.filter(pet => pet.created_by === userData.email);
            } catch (listErr) {
              console.warn('⚠️ [Profile] Pet.list também falhou:', listErr);
              return [];
            }
          });
          
          console.log('✅ [Profile] Pets próprios carregados:', petsData.length);
          setPets(petsData);
        } catch (err) {
          console.warn("⚠️ [Profile] Erro ao carregar pets próprios:", err);
          setPets([]);
        }
      }

    } catch (err) {
      console.error("❌ [Profile] Erro geral ao carregar dados do usuário:", err);
      
      // Tratar diferentes tipos de erro
      if (err.message?.includes('Network Error')) {
        setError("Erro de conexão. Verifique sua internet e tente novamente.");
        toast({
          variant: "destructive",
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua internet.",
        });
      } else if (err.status === 401 || err.message?.includes('Unauthorized')) {
        setError("Sessão expirada. Redirecionando...");
        toast({
          variant: "destructive",
          title: "Sessão Expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
        });
        setTimeout(() => {
          window.location.href = createPageUrl("Welcome");
        }, 2000);
      } else {
        setError("Não foi possível carregar os dados do perfil. Tente novamente.");
        toast({
          variant: "destructive",
          title: "Erro ao Carregar Perfil",
          description: "Não foi possível carregar os dados do perfil.",
        });
      }
    } finally {
      setLoading(false);
      console.log('🏁 [Profile] Carregamento finalizado');
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const removeSpecialty = (specialtyToRemove) => {
    handleInputChange('vet_specialties', profileData.vet_specialties.filter(s => s !== specialtyToRemove));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await updateUserProfile(profileData);

      if (response.data && response.data.success) {
        setUser(response.data.user);
        setEditing(false);

        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });

        setTimeout(() => {
          loadUserData();
        }, 1000);

      } else {
        throw new Error(response.data?.error || "Erro desconhecido ao salvar perfil");
      }

    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      setError("Não foi possível salvar as alterações. Tente novamente.");

      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        photo_url: user.photo_url || "",
        crmv: user.crmv || "",
        crmv_uf: user.crmv_uf || "",
        vet_specialties: user.vet_specialties || [],
        clinic_name: user.clinic_name || "",
        clinic_address: user.clinic_address || "",
        clinic_phone: user.clinic_phone || ""
      });
    }
    setEditing(false);
    setError(null);
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    handleInputChange("photo_url", newPhotoUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Erro ao Carregar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadUserData} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVeterinarian = user?.user_type === "veterinario";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">
            {isVeterinarian
              ? "Gerencie suas informações profissionais e especialidades"
              : "Gerencie suas informações pessoais"}
          </p>
        </div>

        {/* Card Principal do Perfil */}
        <Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-0">
            {/* Header do Card com foto e informações */}
            <div className="relative bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="w-24 h-24 ring-4 ring-white/20 shadow-xl">
                    <AvatarImage src={profileData.photo_url} alt="Perfil" className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white text-2xl backdrop-blur-sm">
                      {isVeterinarian ? (
                        <Stethoscope className="w-12 h-12" />
                      ) : (
                        <UserIcon className="w-12 h-12" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {editing && (
                    <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                        <ProfilePhotoUpload
                            currentPhotoUrl={profileData.photo_url}
                            onPhotoUpdate={handlePhotoUpdate}
                            isSmallIcon={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Informações básicas */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {user?.full_name || "Usuário"}
                  </h2>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                    {isVeterinarian ? (
                      <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 px-4 py-1.5">
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Veterinário
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-500/20 text-purple-100 border-purple-400/30 px-4 py-1.5">
                        <Heart className="w-4 h-4 mr-2" />
                        Tutor
                      </Badge>
                    )}

                    {user?.created_date && (
                      <Badge variant="outline" className="text-purple-100 border-purple-300/50 bg-white/10 backdrop-blur-sm">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Membro desde {format(new Date(user.created_date), "MMM yyyy", { locale: ptBR })}
                      </Badge>
                    )}
                  </div>

                  {/* Informações de contato no header */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-100">
                    {profileData.email && (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{profileData.email}</span>
                      </div>
                    )}
                    {profileData.phone && (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de ação */}
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => setEditing(!editing)}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    {editing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Conteúdo do perfil */}
            <div className="p-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {editing ? (
                <div className="space-y-8">
                  {/* Upload de Foto - Simplificado */}
                  <div className="text-center py-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto do Perfil</h3>
                    <ProfilePhotoUpload
                      currentPhotoUrl={profileData.photo_url}
                      onPhotoUpdate={handlePhotoUpdate}
                    />
                  </div>

                  <Separator className="my-8" />

                  {/* Informações Básicas */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-purple-600" />
                      Informações Pessoais
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-base font-medium">Nome Completo *</Label>
                        <Input
                          id="full_name"
                          value={profileData.full_name}
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
                          placeholder="Seu nome completo"
                          className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="h-12 bg-gray-100 border-gray-300 text-gray-500"
                        />
                        <p className="text-xs text-gray-500">Email não pode ser alterado</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-medium">Telefone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-base font-medium">Localização</Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Sua cidade, estado"
                          className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label htmlFor="bio" className="text-base font-medium">
                        {isVeterinarian ? "Biografia Profissional" : "Sobre Você"}
                      </Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder={
                          isVeterinarian
                            ? "Fale sobre sua experiência e especialidades..."
                            : "Conte um pouco sobre você e seus pets..."
                        }
                        rows={4}
                        className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Campos específicos para veterinários */}
                  {isVeterinarian && (
                    <>
                      <Separator className="my-8" />

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          Informações Profissionais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="crmv" className="text-base font-medium">CRMV</Label>
                              <Input
                                id="crmv"
                                value={profileData.crmv}
                                onChange={(e) => handleInputChange("crmv", e.target.value)}
                                placeholder="Ex: 12345"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="crmv_uf" className="text-base font-medium">UF do CRMV</Label>
                              <Input
                                id="crmv_uf"
                                value={profileData.crmv_uf}
                                onChange={(e) => handleInputChange("crmv_uf", e.target.value.toUpperCase())}
                                placeholder="Ex: SP"
                                maxLength={2}
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="specialties" className="text-base font-medium">Especialidades</Label>
                              <Input
                                id="specialties"
                                placeholder="Digite e pressione Enter para adicionar"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    e.preventDefault();
                                    const newSpecialty = e.target.value.trim();
                                    if (!profileData.vet_specialties.includes(newSpecialty)) {
                                      handleInputChange('vet_specialties', [...profileData.vet_specialties, newSpecialty]);
                                    }
                                    e.target.value = '';
                                  }
                                }}
                              />
                              {profileData.vet_specialties.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {profileData.vet_specialties.map((specialty, index) => (
                                    <Badge key={index} variant="outline" className="text-sm py-1 px-3 bg-purple-50 text-purple-700 border-purple-200">
                                      <GraduationCap className="w-3 h-3 mr-1" />
                                      {specialty}
                                      <button
                                        type="button"
                                        onClick={() => removeSpecialty(specialty)}
                                        className="ml-2 text-purple-500 hover:text-purple-700"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="clinic_name" className="text-base font-medium">Nome da Clínica</Label>
                              <Input
                                id="clinic_name"
                                value={profileData.clinic_name}
                                onChange={(e) => handleInputChange("clinic_name", e.target.value)}
                                placeholder="Nome da clínica ou consultório"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="clinic_address" className="text-base font-medium">Endereço da Clínica</Label>
                              <Input
                                id="clinic_address"
                                value={profileData.clinic_address}
                                onChange={(e) => handleInputChange("clinic_address", e.target.value)}
                                placeholder="Endereço completo da clínica"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="clinic_phone" className="text-base font-medium">Telefone da Clínica</Label>
                              <Input
                                id="clinic_phone"
                                value={profileData.clinic_phone}
                                onChange={(e) => handleInputChange("clinic_phone", e.target.value)}
                                placeholder="(00) 0000-0000"
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg shadow-lg"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-3" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={saving}
                      className="flex-1 h-14 text-gray-700 border-gray-300 hover:bg-gray-50 font-semibold text-lg"
                    >
                      <X className="w-5 h-5 mr-3" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Informações de Visualização */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {profileData.phone && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Telefone</Label>
                            <p className="text-gray-900 font-medium">{profileData.phone}</p>
                          </div>
                        </div>
                      )}

                      {profileData.address && (
                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Localização</Label>
                            <p className="text-gray-900 font-medium">{profileData.address}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {profileData.bio && (
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <Label className="text-sm font-semibold text-purple-800 mb-2 block">
                            {isVeterinarian ? "Biografia Profissional" : "Sobre"}
                          </Label>
                          <p className="text-gray-900 leading-relaxed">{profileData.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações específicas do veterinário */}
                  {isVeterinarian && (
                    <>
                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-purple-600" />
                          Informações Profissionais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            {profileData.crmv && (
                              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <Award className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold text-emerald-800">CRMV</Label>
                                  <p className="text-gray-900 font-medium">
                                    {profileData.crmv}
                                    {profileData.crmv_uf && ` - ${profileData.crmv_uf}`}
                                  </p>
                                </div>
                              </div>
                            )}

                            {profileData.vet_specialties.length > 0 && (
                              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <Label className="text-sm font-semibold text-blue-800 mb-3 block">Especialidades</Label>
                                <div className="flex flex-wrap gap-2">
                                  {profileData.vet_specialties.map((specialty, index) => (
                                    <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                                      <GraduationCap className="w-3 h-3 mr-1" />
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            {profileData.clinic_name && (
                              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold text-amber-800">Clínica</Label>
                                  <p className="text-gray-900 font-medium">{profileData.clinic_name}</p>
                                </div>
                              </div>
                            )}

                            {profileData.clinic_address && (
                              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <MapPin className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Endereço da Clínica</Label>
                                  <p className="text-gray-900 font-medium">{profileData.clinic_address}</p>
                                </div>
                              </div>
                            )}

                            {profileData.clinic_phone && (
                              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Phone className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Telefone da Clínica</Label>
                                  <p className="text-gray-900 font-medium">{profileData.clinic_phone}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-14 h-14 bg-purple-500 rounded-full mx-auto mb-4 shadow-lg">
                {isVeterinarian ? (
                  <PawPrint className="w-7 h-7 text-white" />
                ) : (
                  <Heart className="w-7 h-7 text-white" />
                )}
              </div>
              <h3 className="text-3xl font-bold text-purple-800 mb-1">
                {isVeterinarian ? linkedPets.length : pets.length}
              </h3>
              <p className="text-purple-600 font-medium">
                {isVeterinarian ? "Pets Acompanhando" : "Meus Pets"}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-full mx-auto mb-4 shadow-lg">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-emerald-800 mb-1">
                {user?.created_date ?
                  Math.floor((new Date() - new Date(user.created_date)) / (1000 * 60 * 60 * 24))
                  : 0}
              </h3>
              <p className="text-emerald-600 font-medium">Dias na Plataforma</p>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-14 h-14 bg-amber-500 rounded-full mx-auto mb-4 shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-amber-800 mb-1">
                {user?.profile_setup_complete ? "100%" : "80%"}
              </h3>
              <p className="text-amber-600 font-medium">Perfil Completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pets */}
        {isVeterinarian ? (
          linkedPets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-purple-600" />
                  Pets que Acompanho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedPets.map((pet, index) => (
                    <div key={`${pet.pet_id}_${index}`} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{pet.pet_name}</h4>
                      <p className="text-sm text-gray-600">Tutor: {pet.owner_name}</p>
                      <p className="text-xs text-gray-500">{pet.owner_email}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          pets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-purple-600" />
                  Meus Pets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map((pet) => (
                    <Link
                      key={pet.id}
                      to={createPageUrl(`Health?pet=${pet.id}`)}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={pet.photo_url} alt={pet.name} />
                          <AvatarFallback className="bg-purple-100 text-purple-800">
                            <PawPrint className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                          <p className="text-sm text-gray-600">{pet.species} • {pet.breed || 'SRD'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
