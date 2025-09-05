
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, User as UserIcon, Save, X, Stethoscope, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProfilePhotoUpload from "@/components/photo-upload/ProfilePhotoUpload";
import CRMVValidator from "@/components/vets/CRMVValidator";
import { updateUserProfile } from "@/api/functions"; // New import

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    photo_url: "",
    bio: "",
    // Campos específicos para veterinários
    crmv: "",
    crmv_uf: "",
    crmv_state: "",
    clinic_name: "",
    clinic_phone: "",
    clinic_address: "",
    vet_specialties: []
  });
  const [crmvValidated, setCrmvValidated] = useState(false);
  const [initialCrmvData, setInitialCrmvData] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      console.log("👤 User data loaded:", userData);
      
      setUser(userData);
      
      const initialData = {
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        address: userData.address || "",
        photo_url: userData.photo_url || "",
        bio: userData.bio || "",
        crmv: userData.crmv || "",
        crmv_uf: userData.crmv_uf || userData.crmv_state || "",
        crmv_state: userData.crmv_state || userData.crmv_uf || "",
        clinic_name: userData.clinic_name || "",
        clinic_phone: userData.clinic_phone || "",
        clinic_address: userData.clinic_address || "",
        vet_specialties: userData.vet_specialties || []
      };
      
      setFormData(initialData);
      
      // Se já tem CRMV validado previamente, marcar como validado
      if (userData.user_type === "veterinario" && userData.crmv && userData.crmv_uf) {
        console.log("✅ CRMV already validated:", userData.crmv, userData.crmv_uf);
        setCrmvValidated(true);
        setInitialCrmvData({
          crmv: userData.crmv,
          uf: userData.crmv_uf || userData.crmv_state
        });
      }
      
    } catch (error) {
      console.error("❌ Error loading user:", error);
      setError("Não foi possível carregar seus dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCrmvValidation = ({ isValid, data }) => {
    console.log("🔍 CRMV validation result:", { isValid, data });
    setCrmvValidated(isValid);
    
    if (isValid && data) {
      setFormData(prev => ({
        ...prev,
        crmv: data.crmv,
        crmv_uf: data.uf,
        crmv_state: data.uf // Manter ambos para compatibilidade
      }));
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`📝 Field changed: ${field} =`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("💾 Saving profile with data:", formData);

    // Validação para veterinários
    if (user?.user_type === "veterinario") {
      if (!crmvValidated) {
        toast({
          title: "Validação necessária",
          description: "Por favor, valide seu CRMV antes de salvar",
          variant: "destructive",
        });
        return;
      }

      if (!formData.full_name.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "Nome completo é obrigatório",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setSaving(true);
      
      console.log("🔄 Using backend function to update profile");
      
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        photo_url: formData.photo_url,
        bio: formData.bio.trim(),
      };

      if (user?.user_type === "veterinario") {
        Object.assign(payload, {
          crmv: formData.crmv,
          crmv_uf: formData.crmv_uf,
          clinic_name: formData.clinic_name.trim(),
          clinic_phone: formData.clinic_phone.trim(),
          clinic_address: formData.clinic_address.trim(),
          vet_specialties: formData.vet_specialties
        });
      }

      const { data } = await updateUserProfile(payload);

      if (data.success) {
        toast({
          title: "Perfil atualizado!",
          description: data.message || "Suas informações foram salvas com sucesso.",
          variant: "success", // Added variant for consistency
        });

        // Aguardar um pouco e redirecionar
        setTimeout(() => {
          if (user?.user_type === "veterinario") {
            window.location.href = createPageUrl("Profile?tab=profile");
          } else {
            window.location.href = createPageUrl("Profile?tab=tutor");
          }
        }, 2000); // Changed from 1500ms to 2000ms as per outline
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }

    } catch (err) {
      console.error("❌ Error saving profile:", err);
      toast({
        title: "Erro ao salvar",
        description: err.message || "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user?.user_type === "veterinario") {
      navigate(createPageUrl("Profile") + "?tab=profile");
    } else {
      navigate(createPageUrl("Profile"));
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-center text-gray-600">{error}</p>
            <Button onClick={loadUser} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 pb-24 md:pb-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
          <p className="text-gray-600">
            {user?.user_type === "veterinario" ? "Atualize suas informações profissionais" : "Atualize suas informações pessoais"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto do Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Foto do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfilePhotoUpload
              value={formData.photo_url}
              onChange={(url) => handleInputChange("photo_url", url)}
            />
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Seu endereço"
              />
            </div>

            <div>
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Profissionais - Só para veterinários */}
        {user?.user_type === "veterinario" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CRMV Validator */}
              <CRMVValidator
                onValidation={handleCrmvValidation}
                initialValue={initialCrmvData}
                skipValidationIfExists={true}
              />

              <div>
                <Label htmlFor="clinic_name">Nome da Clínica/Hospital *</Label>
                <Input
                  id="clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => handleInputChange("clinic_name", e.target.value)}
                  placeholder="Nome da sua clínica ou hospital"
                  required={user?.user_type === "veterinario"}
                />
              </div>

              <div>
                <Label htmlFor="clinic_phone">Telefone da Clínica *</Label>
                <Input
                  id="clinic_phone"
                  value={formData.clinic_phone}
                  onChange={(e) => handleInputChange("clinic_phone", e.target.value)}
                  placeholder="(00) 0000-0000"
                  required={user?.user_type === "veterinario"}
                />
              </div>

              <div>
                <Label htmlFor="clinic_address">Endereço do Consultório</Label>
                <Textarea
                  id="clinic_address"
                  value={formData.clinic_address}
                  onChange={(e) => handleInputChange("clinic_address", e.target.value)}
                  placeholder="Endereço completo do consultório"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de ação */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
