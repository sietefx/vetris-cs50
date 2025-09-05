
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { User } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, Save, X, CheckCircle, RefreshCw, PlusCircle,
  Calendar, Heart, Activity, Edit, Phone, BookOpen, Link2 // Added new icons from outline
} from "lucide-react"; // Combined all necessary lucide-react imports
import { format } from "date-fns";
import NewPetPhotoUpload from "@/components/photo-upload/NewPetPhotoUpload";

export default function CompletePetForm({ pet, isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    species: "cachorro",
    breed: "",
    birth_date: "",
    photo_url: "",
    weight: "",
    height: "",
    color: "",
    size: "medio",
    background: "",
    allergies: [],
    health_condition: [],
    activity_level: "moderado",
    is_neutered: false,
    neutering_date: "",
    microchip_number: "",
    temperament: [],
    medications: [],
    veterinarian_name: "",
    veterinarian_phone: "",
    special_needs: "",
    emergency_contact: "",
    emergency_phone: "",
    favorite_foods: [],
    dislikes: [],
    grooming_notes: "",
    exercise_needs: "",
    registration_number: "",
    insurance_info: ""
  });

  // ADICIONADO: Effect para fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        console.log('🔄 [CompletePetForm] Fechando modal via tecla ESC');
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Resetar formulário quando pet mudar
  useEffect(() => {
    console.log('🔄 [CompletePetForm] Pet mudou, resetando formulário:', pet?.id);

    if (pet && isOpen) {
      // CARREGAR DADOS ATUALIZADOS DO PET DIRETAMENTE
      loadPetData(pet);
    } else if (!pet && isOpen) {
      // Novo pet - formulário limpo
      resetForm();
    }
  }, [pet, isOpen]);

  const loadPetData = async (petData) => {
    try {
      console.log('📊 [CompletePetForm] Carregando dados do pet:', petData.id);

      // BUSCAR DADOS FRESCOS DO BACKEND (não usar props diretamente)
      let freshPetData = petData;

      try {
        freshPetData = await Pet.get(petData.id);
        console.log('✅ [CompletePetForm] Dados frescos carregados do backend:', freshPetData.name);
      } catch (err) {
        console.warn('⚠️ [CompletePetForm] Erro ao buscar dados frescos, usando props:', err);
        freshPetData = petData;
      }

      // ATUALIZAR FORMDATA COM DADOS FRESCOS
      setFormData({
        name: freshPetData.name || "",
        species: freshPetData.species || "cachorro",
        breed: freshPetData.breed || "",
        birth_date: freshPetData.birth_date || "",
        photo_url: freshPetData.photo_url || "",
        weight: freshPetData.weight || "",
        height: freshPetData.height || "",
        color: freshPetData.color || "",
        size: freshPetData.size || "medio",
        background: freshPetData.background || "",
        allergies: freshPetData.allergies || [],
        health_condition: freshPetData.health_condition || [],
        activity_level: freshPetData.activity_level || "moderado",
        is_neutered: freshPetData.is_neutered || false,
        neutering_date: freshPetData.neutering_date || "",
        microchip_number: freshPetData.microchip_number || "",
        temperament: freshPetData.temperament || [],
        medications: freshPetData.medications || [],
        veterinarian_name: freshPetData.veterinarian_name || "",
        veterinarian_phone: freshPetData.veterinarian_phone || "",
        special_needs: freshPetData.special_needs || "",
        emergency_contact: freshPetData.emergency_contact || "",
        emergency_phone: freshPetData.emergency_phone || "",
        favorite_foods: freshPetData.favorite_foods || [],
        dislikes: freshPetData.dislikes || [],
        grooming_notes: freshPetData.grooming_notes || "",
        exercise_needs: freshPetData.exercise_needs || "",
        registration_number: freshPetData.registration_number || "",
        insurance_info: freshPetData.insurance_info || ""
      });

      console.log('📝 [CompletePetForm] FormData atualizado:', {
        name: freshPetData.name,
        species: freshPetData.species
      });

    } catch (err) {
      console.error('❌ [CompletePetForm] Erro ao carregar dados do pet:', err);
      setError("Erro ao carregar dados do pet");
    }
  };

  const resetForm = () => {
    console.log('🔄 [CompletePetForm] Resetando formulário para novo pet');

    setFormData({
      name: "",
      species: "cachorro",
      breed: "",
      birth_date: "",
      photo_url: "",
      weight: "",
      height: "",
      color: "",
      size: "medio",
      background: "",
      allergies: [],
      health_condition: [],
      activity_level: "moderado",
      is_neutered: false,
      neutering_date: "",
      microchip_number: "",
      temperament: [],
      medications: [],
      veterinarian_name: "",
      veterinarian_phone: "",
      special_needs: "",
      emergency_contact: "",
      emergency_phone: "",
      favorite_foods: [],
      dislikes: [],
      grooming_notes: "",
      exercise_needs: "",
      registration_number: "",
      insurance_info: ""
    });
    setError(null);
    setSuccess(false);
  };

  const handleChange = (field, value) => {
    console.log(`📝 [CompletePetForm] Alterando ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCheckboxChange = (field, checked) => {
    console.log(`☑️ [CompletePetForm] Checkbox ${field}:`, checked);
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleArrayChange = (field, value) => {
    const array = (value || '').split(',').map((item) => item.trim()).filter((item) => item);
    console.log(`📝 [CompletePetForm] Array ${field}:`, array);
    setFormData((prev) => ({ ...prev, [field]: array }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome do pet é obrigatório");
      return false;
    }

    if (!formData.species.trim()) {
      setError("Espécie é obrigatória");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      console.log('⏸️ [CompletePetForm] Salvamento já em andamento, ignorando');
      return;
    }

    if (!validateForm()) {
      console.log('❌ [CompletePetForm] Validação falhou');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log('💾 [CompletePetForm] Iniciando salvamento do pet...');
      console.log('📊 [CompletePetForm] Dados a serem salvos:', formData);

      const cleanFormData = {
        ...formData,
        name: formData.name.trim(),
        breed: formData.breed?.trim() || "",
        background: formData.background?.trim() || "",
        microchip_number: formData.microchip_number?.trim() || "",
        veterinarian_name: formData.veterinarian_name?.trim() || "",
        veterinarian_phone: formData.veterinarian_phone?.trim() || "",
        special_needs: formData.special_needs?.trim() || "",
        emergency_contact: formData.emergency_contact?.trim() || "",
        emergency_phone: formData.emergency_phone?.trim() || "",
        grooming_notes: formData.grooming_notes?.trim() || "",
        exercise_needs: formData.exercise_needs?.trim() || "",
        registration_number: formData.registration_number?.trim() || "",
        insurance_info: formData.insurance_info?.trim() || "",
        // Garantir que arrays estejam definidos
        allergies: formData.allergies || [],
        health_condition: formData.health_condition || [],
        temperament: formData.temperament || [],
        medications: formData.medications || [],
        favorite_foods: formData.favorite_foods || [],
        dislikes: formData.dislikes || [],
        // Tratar data de castração
        neutering_date: formData.is_neutered ? formData.neutering_date : null
      };

      let updatedPet;

      if (pet && pet.id) {
        // ATUALIZAÇÃO: verificar se o nome mudou
        const nameChanged = pet.name !== cleanFormData.name;
        console.log('🔄 [CompletePetForm] Pet existente - Nome mudou?', nameChanged, 'De:', pet.name, 'Para:', cleanFormData.name);

        // Atualizar pet no banco
        await Pet.update(pet.id, cleanFormData);
        console.log('✅ [CompletePetForm] Pet atualizado no banco');

        // AGUARDAR PROPAGAÇÃO NO BANCO
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // BUSCAR DADOS ATUALIZADOS DO BACKEND
        updatedPet = await Pet.get(pet.id);
        console.log('🔍 [CompletePetForm] Dados verificados no backend após atualização:', updatedPet.name);

        // Se o nome mudou, atualizar também nos convites
        if (nameChanged) {
          await updatePetNameInInvitations(pet.id, cleanFormData.name);
        }

      } else {
        // CRIAÇÃO: novo pet
        console.log('➕ [CompletePetForm] Criando novo pet');
        updatedPet = await Pet.create(cleanFormData);
        console.log('✅ [CompletePetForm] Novo pet criado:', updatedPet.id);
      }

      // VERIFICAR SE OS DADOS FORAM REALMENTE SALVOS
      if (updatedPet.name !== cleanFormData.name) {
        throw new Error(`Erro na persistência: esperado "${cleanFormData.name}", obtido "${updatedPet.name}"`);
      }

      console.log('🎉 [CompletePetForm] Pet salvo com sucesso:', updatedPet.name);

      setSuccess(true);

      // Aguardar um pouco antes de fechar para mostrar sucesso
      setTimeout(() => {
        setSuccess(false);
        onSave && onSave(updatedPet);
      }, 1500);

    } catch (err) {
      console.error('❌ [CompletePetForm] Erro ao salvar pet:', err);
      setError(err.message || "Erro ao salvar pet. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const updatePetNameInInvitations = async (petId, newName) => {
    try {
      console.log('🔄 [CompletePetForm] Atualizando nome do pet nos convites:', petId, newName);

      // Buscar convites que contêm este pet
      const allInvitations = await VetInvitation.list();
      const relevantInvitations = allInvitations.filter((invitation) =>
        invitation.pets &&
        Array.isArray(invitation.pets) &&
        invitation.pets.some((p) => p.pet_id === petId)
      );

      console.log(`📋 [CompletePetForm] Encontrados ${relevantInvitations.length} convites para atualizar`);

      for (const invitation of relevantInvitations) {
        try {
          // Atualizar o nome do pet na lista de pets do convite
          const updatedPets = invitation.pets.map((p) =>
            p.pet_id === petId ? { ...p, pet_name: newName } : p
          );

          await VetInvitation.update(invitation.id, {
            ...invitation,
            pets: updatedPets
          });

          console.log(`✅ [CompletePetForm] Convite ${invitation.id} atualizado`);
        } catch (inviteError) {
          console.warn(`⚠️ [CompletePetForm] Erro ao atualizar convite ${invitation.id}:`, inviteError);
        }
      }

    } catch (err) {
      console.warn('⚠️ [CompletePetForm] Erro ao atualizar convites (continuando):', err);
    }
  };

  const handleClose = () => {
    console.log('❌ [CompletePetForm] Fechando formulário');
    setError(null);
    setSuccess(false);
    onClose && onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !success} onOpenChange={(open) => {
        console.log('🔄 [CompletePetForm] Dialog onOpenChange:', open, 'isOpen prop:', isOpen);
        if (!open) {
          handleClose();
        }
      }}>
        <DialogContent
          className="w-[95vw] max-w-5xl mx-auto max-h-[90vh] overflow-y-auto p-6 sm:p-8"
          onInteractOutside={(e) => {
            console.log('🔄 [CompletePetForm] Clique fora do modal detectado');
            // CORREÇÃO: Só fechar se não for elemento do toast
            if (!e.target.closest('[data-radix-toast-viewport]')) {
              handleClose();
            }
          }}
        >
          {/* Botão fechar mobile (já existente) */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white shadow-sm border p-1"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>

          <DialogHeader className="mb-8">
            <DialogTitle className="text-xl font-semibold">
              {pet ? 'Editar Pet' : 'Adicionar Novo Pet'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Preencha as informações do seu pet. Campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="px-2">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Informações Básicas */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Informações Básicas</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Pet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Nome do seu pet"
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="species">Espécie *</Label>
                    <Select value={formData.species} onValueChange={(value) => handleChange("species", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cachorro">Cachorro</SelectItem>
                        <SelectItem value="gato">Gato</SelectItem>
                        <SelectItem value="roedor">Roedor</SelectItem>
                        <SelectItem value="ave">Ave</SelectItem>
                        <SelectItem value="reptil">Réptil</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="breed">Raça</Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => handleChange("breed", e.target.value)}
                      placeholder="Raça ou SRD"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleChange("birth_date", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleChange("color", e.target.value)}
                      placeholder="Cor do pet"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Foto do Pet */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Foto do Pet</h3>
                <div className="py-2">
                  <NewPetPhotoUpload
                    value={formData.photo_url}
                    onChange={(url) => handleChange("photo_url", url)}
                  />
                </div>
              </div>

              {/* Características Físicas */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Características Físicas</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      placeholder="Peso em kg"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => handleChange("height", e.target.value)}
                      placeholder="Altura em cm"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Porte</Label>
                    <Select value={formData.size} onValueChange={(value) => handleChange("size", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o porte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mini">Mini</SelectItem>
                        <SelectItem value="pequeno">Pequeno</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                        <SelectItem value="gigante">Gigante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="activity_level">Nível de Atividade</Label>
                    <Select value={formData.activity_level} onValueChange={(value) => handleChange("activity_level", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixo">Baixo</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="muito_alto">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_neutered"
                        checked={formData.is_neutered}
                        onCheckedChange={(checked) => handleCheckboxChange("is_neutered", checked)}
                      />
                      <Label htmlFor="is_neutered" className="text-sm font-normal">Pet castrado</Label>
                    </div>
                    {formData.is_neutered && (
                      <Input
                        type="date"
                        value={formData.neutering_date}
                        onChange={(e) => handleChange("neutering_date", e.target.value)}
                        placeholder="Data da castração"
                        className="h-12"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* História e Temperamento */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">História e Temperamento</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="background">História do Pet</Label>
                    <Textarea
                      id="background"
                      value={formData.background}
                      onChange={(e) => handleChange("background", e.target.value)}
                      placeholder="Conte sobre a história e personalidade do seu pet..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperament">Temperamento</Label>
                    <Input
                      id="temperament"
                      value={formData.temperament?.join(", ") || ""}
                      onChange={(e) => handleArrayChange("temperament", e.target.value)}
                      placeholder="Ex: amigável, brincalhão, calmo (separados por vírgula)"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Saúde */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Informações de Saúde</h3>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="health_condition">Condições de Saúde</Label>
                    <Input
                      id="health_condition"
                      value={formData.health_condition?.join(", ") || ""}
                      onChange={(e) => handleArrayChange("health_condition", e.target.value)}
                      placeholder="Ex: diabetes, artrite (separadas por vírgula)"
                      className="h-12"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Alergias</Label>
                      <Input
                        id="allergies"
                        value={formData.allergies?.join(", ") || ""}
                        onChange={(e) => handleArrayChange("allergies", e.target.value)}
                        placeholder="Ex: frango, pólen (separadas por vírgula)"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medications">Medicamentos em Uso</Label>
                      <Input
                        id="medications"
                        value={formData.medications?.join(", ") || ""}
                        onChange={(e) => handleArrayChange("medications", e.target.value)}
                        placeholder="Ex: insulina, anti-inflamatório (separados por vírgula)"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="microchip_number">Número do Microchip</Label>
                    <Input
                      id="microchip_number"
                      value={formData.microchip_number}
                      onChange={(e) => handleChange("microchip_number", e.target.value)}
                      placeholder="Número do microchip (se houver)"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Veterinário */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Veterinário</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="veterinarian_name">Nome do Veterinário</Label>
                    <Input
                      id="veterinarian_name"
                      value={formData.veterinarian_name}
                      onChange={(e) => handleChange("veterinarian_name", e.target.value)}
                      placeholder="Dr. João Silva"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="veterinarian_phone">Telefone do Veterinário</Label>
                    <Input
                      id="veterinarian_phone"
                      value={formData.veterinarian_phone}
                      onChange={(e) => handleChange("veterinarian_phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Contato de Emergência</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Nome</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => handleChange("emergency_contact", e.target.value)}
                      placeholder="Nome do contato de emergência"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Telefone</Label>
                    <Input
                      id="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={(e) => handleChange("emergency_phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Preferências */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Preferências e Cuidados</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="favorite_foods">Comidas Favoritas</Label>
                    <Input
                      id="favorite_foods"
                      value={formData.favorite_foods?.join(", ") || ""}
                      onChange={(e) => handleArrayChange("favorite_foods", e.target.value)}
                      placeholder="Ex: ração, frango, cenoura (separadas por vírgula)"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dislikes">Não Gosta De</Label>
                    <Input
                      id="dislikes"
                      value={formData.dislikes?.join(", ") || ""}
                      onChange={(e) => handleArrayChange("dislikes", e.target.value)}
                      placeholder="Ex: barulho alto, chuva (separados por vírgula)"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="special_needs">Necessidades Especiais</Label>
                    <Textarea
                      id="special_needs"
                      value={formData.special_needs}
                      onChange={(e) => handleChange("special_needs", e.target.value)}
                      placeholder="Descreva cuidados especiais que o pet precisa..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="grooming_notes">Cuidados com Higiene</Label>
                      <Textarea
                        id="grooming_notes"
                        value={formData.grooming_notes}
                        onChange={(e) => handleChange("grooming_notes", e.target.value)}
                        placeholder="Instruções sobre banho, tosa, escovação..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exercise_needs">Necessidades de Exercício</Label>
                      <Textarea
                        id="exercise_needs"
                        value={formData.exercise_needs}
                        onChange={(e) => handleChange("exercise_needs", e.target.value)}
                        placeholder="Tipo e quantidade de exercícios recomendados..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentação */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-gray-200 pb-3">Documentação</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Número de Registro/Pedigree</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => handleChange("registration_number", e.target.value)}
                      placeholder="Número de registro ou pedigree"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurance_info">Informações do Seguro Pet</Label>
                    <Input
                      id="insurance_info"
                      value={formData.insurance_info}
                      onChange={(e) => handleChange("insurance_info", e.target.value)}
                      placeholder="Seguradora e número da apólice"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 h-12"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="bg-purple-600 hover:bg-purple-700 flex-1 h-12"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 mr-2" />
                      {pet ? 'Atualizar Pet' : 'Adicionar Pet'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* CORREÇÃO: Success modal deve ser sempre renderizado quando success = true */}
      {success && (
        <Dialog open={success} onOpenChange={handleClose}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            {/* Botão fechar para o modal de sucesso (adicionado) */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white shadow-sm border p-1"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </button>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-green-800">
                {pet ? 'Pet atualizado com sucesso!' : 'Pet criado com sucesso!'}
              </h3>
              <p className="text-green-600">Aguarde...</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
