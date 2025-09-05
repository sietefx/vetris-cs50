
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { VaccinationRecord } from "@/api/entities";
import { User } from "@/api/entities";
import { VetInvitation } from "@/api/entities"; // New import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Syringe, Plus, Edit, Trash2, Calendar, AlertTriangle,
  PawPrint, ChevronLeft, Clock, CheckCircle, X // X is new from outline
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale"; // New import

export default function VaccineHistoryPage() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(""); // Changed initial state to "" for "Todos os pets" option
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("applied");
  const [user, setUser] = useState(null); // New state for user info

  // Estados do modal
  const [showVaccineDialog, setShowVaccineDialog] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [vaccineForm, setVaccineForm] = useState({
    pet_id: "",
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    next_date: "",
    vet_name: "",
    vet_clinic: "",
    lot_number: "",
    notes: "",
    has_side_effects: false,
    side_effects: ""
  });

  // Initial data loading effect
  useEffect(() => {
    loadData();
  }, []);

  // Effect to load vaccines whenever selectedPet or pets change
  useEffect(() => {
    // Only load vaccines if selectedPet is properly initialized (not null)
    // This handles the initial load after pets are set by loadData
    // and subsequent changes from the pet selector.
    if (selectedPet !== null) { 
      loadVaccines();
      // Update vaccineForm's pet_id if a specific pet is selected
      if (selectedPet) { 
        setVaccineForm(prev => ({ ...prev, pet_id: selectedPet }));
      } else if (pets.length > 0) { // If "Todos os pets" is selected but pets exist, default form to first pet
        setVaccineForm(prev => ({ ...prev, pet_id: pets[0].id }));
      } else { // No pets available
        setVaccineForm(prev => ({ ...prev, pet_id: "" }));
      }
    }
  }, [selectedPet, pets.length]); // Added pets.length as dependency to re-trigger if pets change (e.g. initial load)

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [VaccineHistory] Iniciando carregamento de dados...');

      const userData = await User.me();
      if (!userData) {
        console.log('❌ [VaccineHistory] Usuário não encontrado');
        window.location.href = createPageUrl("Welcome");
        return;
      }

      setUser(userData);
      console.log('👤 [VaccineHistory] Usuário carregado:', userData.user_type);

      let petsData = [];

      if (userData.user_type === "veterinario") {
        // Para veterinários - carregar pets através de convites aceitos
        try {
          console.log('🐾 [VaccineHistory] Carregando pets para veterinário...');
          
          const invitations = await VetInvitation.filter({
            vet_email: userData.email,
            status: "aceito"
          }).catch(err => {
            console.warn('⚠️ [VaccineHistory] Erro ao carregar convites:', err);
            return [];
          });

          console.log('📋 [VaccineHistory] Convites aceitos encontrados:', invitations.length);

          const petIds = new Set();
          invitations.forEach(invite => {
            if (invite.pets && Array.isArray(invite.pets)) {
              invite.pets.forEach(pet => {
                if (pet.pet_id) petIds.add(pet.pet_id);
              });
            }
          });

          console.log('🎯 [VaccineHistory] Pet IDs únicos:', [...petIds]);

          // Carregar dados dos pets com fallback robusto
          for (const petId of petIds) {
            try {
              const pet = await Pet.get(petId).catch(async (err) => {
                console.warn(`⚠️ [VaccineHistory] Pet.get(${petId}) falhou, tentando Pet.list:`, err);
                try {
                  const allPets = await Pet.list();
                  return allPets.find(p => p.id === petId);
                } catch (listErr) {
                  console.warn(`⚠️ [VaccineHistory] Pet.list também falhou:`, listErr);
                  return null;
                }
              });

              if (pet) {
                const invitation = invitations.find(inv =>
                  inv.pets && inv.pets.some(p => p.pet_id === petId)
                );
                
                // Adicionar informações do tutor
                pet.owner_name = invitation?.pet_owner_name || "Tutor não identificado";
                pet.owner_email = invitation?.pet_owner_email || "";
                
                petsData.push(pet);
                console.log('✅ [VaccineHistory] Pet carregado:', pet.name, 'Tutor:', pet.owner_name);
              }
            } catch (err) {
              console.warn(`❌ [VaccineHistory] Falha ao carregar pet ${petId}:`, err);
            }
          }
        } catch (error) {
          console.error("❌ [VaccineHistory] Erro ao carregar pets do veterinário:", error);
          petsData = [];
        }
      } else {
        // Para tutores - carregar pets próprios com fallback robusto
        try {
          console.log('🐾 [VaccineHistory] Carregando pets para tutor...');
          
          petsData = await Pet.filter({ created_by: userData.email }).catch(async (err) => {
            console.warn('⚠️ [VaccineHistory] Pet.filter falhou, tentando Pet.list:', err);
            try {
              const allPets = await Pet.list();
              return allPets.filter(pet => pet.created_by === userData.email);
            } catch (listErr) {
              console.warn('⚠️ [VaccineHistory] Pet.list também falhou:', listErr);
              return [];
            }
          });
        } catch (error) {
          console.error("❌ [VaccineHistory] Erro ao carregar pets do tutor:", error);
          petsData = [];
        }
      }

      console.log('📊 [VaccineHistory] Total de pets carregados:', petsData.length);
      setPets(petsData);

      if (petsData.length > 0 && !selectedPet) { // Only set if not already set (e.g. from a previous session)
        setSelectedPet(petsData[0].id);
        console.log('🎯 [VaccineHistory] Pet selecionado inicialmente:', petsData[0].name);
      } else if (petsData.length === 0) {
        setError("no_pets");
        setSelectedPet(""); // Ensure no pet is selected if there are no pets
      }

    } catch (err) {
      console.error("❌ [VaccineHistory] Erro geral no carregamento:", err);
      setError("Não foi possível carregar os dados. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const loadVaccines = async () => {
    // Wait until selectedPet is properly initialized by loadData or user interaction
    if (selectedPet === null) {
      console.log('Waiting for selectedPet to be initialized...');
      return;
    }

    try {
      let vaccinesData = [];
      if (selectedPet === "") { // "Todos os pets" selected
        console.log('💉 [VaccineHistory] Carregando todas as vacinas para pets acessíveis...');
        const accessiblePetIds = pets.map(pet => pet.id);
        
        // ESTRATÉGIA 1: VaccinationRecord.list (mais confiável para "todos")
        vaccinesData = await VaccinationRecord.list().then(allVaccines => {
          return allVaccines.filter(vaccine => accessiblePetIds.includes(vaccine.pet_id));
        }).catch(async (err) => {
          console.warn('⚠️ [VaccineHistory] VaccinationRecord.list falhou, tentando VaccinationRecord.filter para cada pet:', err);
          
          // ESTRATÉGIA 2: VaccinationRecord.filter para cada pet como fallback
          const vaccinePromises = accessiblePetIds.map(petId => 
            VaccinationRecord.filter({ pet_id: petId }).catch(err => {
              console.warn(`⚠️ [VaccineHistory] VaccinationRecord.filter para pet ${petId} falhou:`, err);
              return [];
            })
          );
          
          const vaccineResults = await Promise.allSettled(vaccinePromises);
          const collectedVaccines = [];
          vaccineResults.forEach(result => {
            if (result.status === 'fulfilled' && Array.isArray(result.value)) {
              collectedVaccines.push(...result.value);
            }
          });
          
          // Remover duplicatas caso haja (ex: se diferentes chamadas de filtro retornarem o mesmo registro)
          const uniqueVaccines = Array.from(new Map(collectedVaccines.map(v => [v.id, v])).values());
          return uniqueVaccines;
        });
      } else { // Specific pet selected
        console.log(`💉 [VaccineHistory] Carregando vacinas para o pet selecionado (${selectedPet})...`);
        vaccinesData = await VaccinationRecord.filter({ pet_id: selectedPet }).catch(async (err) => {
          console.warn('⚠️ [VaccineHistory] VaccinationRecord.filter falhou, usando VaccinationRecord.list:', err);
          try {
            const allVaccines = await VaccinationRecord.list();
            return allVaccines.filter(vaccine => vaccine.pet_id === selectedPet);
          } catch (listErr) {
            console.warn('⚠️ [VaccineHistory] VaccinationRecord.list também falhou:', listErr);
            return [];
          }
        });
      }
      
      console.log('📊 [VaccineHistory] Total de vacinas carregadas:', vaccinesData.length);
      setVaccines(vaccinesData);
    } catch (error) {
      console.error("❌ [VaccineHistory] Erro ao carregar vacinas:", error);
      // Não define erro global, apenas loga. Este é um erro específico para busca de vacinas.
    }
  };

  const handleOpenAddVaccine = () => {
    setEditingVaccine(null);
    setVaccineForm({
      pet_id: selectedPet || (pets.length > 0 ? pets[0].id : ""), // Pre-select first pet if available, or current selected
      name: "",
      date: format(new Date(), "yyyy-MM-dd"),
      next_date: "",
      vet_name: "",
      vet_clinic: "",
      lot_number: "",
      notes: "",
      has_side_effects: false,
      side_effects: ""
    });
    setShowVaccineDialog(true);
  };

  const handleEditVaccine = (vaccine) => {
    setEditingVaccine(vaccine);
    setVaccineForm({
      pet_id: vaccine.pet_id,
      name: vaccine.name || "",
      date: vaccine.date || format(new Date(), "yyyy-MM-dd"),
      next_date: vaccine.next_date || "",
      vet_name: vaccine.vet_name || "",
      vet_clinic: vaccine.vet_clinic || "",
      lot_number: vaccine.lot_number || "",
      notes: vaccine.notes || "",
      has_side_effects: vaccine.has_side_effects || false,
      side_effects: vaccine.side_effects || ""
    });
    setShowVaccineDialog(true);
  };

  const handleDeleteVaccine = async (vaccineId) => {
    if (confirmDelete === vaccineId) {
      try {
        setSaving(true);
        await VaccinationRecord.delete(vaccineId);
        await loadVaccines(); // Reload vaccines for the current selection
        setConfirmDelete(null);
      } catch (error) {
        console.error("Erro ao excluir vacina:", error);
      } finally {
        setSaving(false);
      }
    } else {
      setConfirmDelete(vaccineId);
    }
  };

  const handleSubmitVaccine = async (e) => {
    e.preventDefault();
    if (!vaccineForm.name || !vaccineForm.date || !vaccineForm.pet_id) {
        setError("Por favor, preencha o nome da vacina, a data e selecione o pet.");
        return;
    }

    try {
      setSaving(true);

      if (editingVaccine) {
        await VaccinationRecord.update(editingVaccine.id, vaccineForm);
      } else {
        await VaccinationRecord.create(vaccineForm);
      }

      setShowVaccineDialog(false);
      setEditingVaccine(null);
      await loadVaccines(); // Reload vaccines for the current selection
    } catch (error) {
      console.error("Erro ao salvar vacina:", error);
      setError("Não foi possível salvar a vacina. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const getVaccineStatus = (vaccine) => {
    const vaccineDate = new Date(vaccine.date);
    const nextDate = vaccine.next_date ? new Date(vaccine.next_date) : null;
    const now = new Date();

    if (isPast(vaccineDate) && (!nextDate || isPast(nextDate))) { // If no next date or next date is past, it's applied
      return { status: "applied", color: "bg-green-100 text-green-800", label: "Aplicada" };
    }
    
    if (nextDate && isFuture(nextDate)) {
      const daysUntil = differenceInDays(nextDate, now);
      if (daysUntil <= 7) {
        return { status: "due_soon", color: "bg-red-100 text-red-800", label: "Vence em breve" };
      } else if (daysUntil <= 30) {
        return { status: "due_month", color: "bg-yellow-100 text-yellow-800", label: "Próxima dose" };
      } else {
        return { status: "scheduled", color: "bg-blue-100 text-blue-800", label: "Agendada" };
      }
    }

    if (nextDate && isPast(nextDate)) {
      return { status: "overdue", color: "bg-red-100 text-red-800", label: "Atrasada" };
    }

    return { status: "applied", color: "bg-green-100 text-green-800", label: "Aplicada" };
  };

  const appliedVaccines = vaccines.filter(vaccine => {
    const status = getVaccineStatus(vaccine);
    return status.status === "applied";
  });

  const upcomingVaccines = vaccines.filter(vaccine => {
    const status = getVaccineStatus(vaccine);
    return ["due_soon", "due_month", "scheduled", "overdue"].includes(status.status);
  });

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : "Pet não encontrado";
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error === "no_pets") {
    return (
      <div className="p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum pet cadastrado</h2>
          <p className="text-gray-500 mb-6">
            {user?.user_type === "veterinario" 
              ? "Você ainda não tem pets vinculados por tutores."
              : "Você precisa cadastrar um pet para ver o histórico de vacinas."
            }
          </p>
          {user?.user_type !== "veterinario" && (
            <Link to={createPageUrl("AddPet")}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Pet
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 pb-24 md:pb-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl("Health")}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Syringe className="w-6 h-6 text-green-600" />
            Histórico de Vacinas
          </h1>
          <p className="text-gray-600 text-sm">Gerencie as vacinas do seu pet</p>
        </div>
      </div>
      
      {/* Botão separado para melhor responsividade */}
      <div className="mb-6">
        <Button 
          onClick={handleOpenAddVaccine} 
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          disabled={pets.length === 0} // Disable if no pets to associate vaccine with
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Vacina
        </Button>
      </div>

      {/* General error display as per outline */}
      {error && error !== "no_pets" && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {pets.length > 0 && ( // Only show pet selector if there are pets
        <div className="mb-6">
          <Label>Pet selecionado</Label>
          <Select value={selectedPet || ""} onValueChange={setSelectedPet}> {/* Use "" for "Todos os pets" */}
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Selecione um pet" />
            </SelectTrigger>
            <SelectContent>
              {user?.user_type === "veterinario" && (
                <SelectItem key="all-pets" value="">Todos os pets</SelectItem> // Option for "all pets" for vets
              )}
              {pets.map(pet => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name}
                  {user?.user_type === "veterinario" && pet.owner_name && (
                    <span className="text-sm text-gray-500 ml-2">
                      - {pet.owner_name}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applied" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Aplicadas ({appliedVaccines.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Próximas ({upcomingVaccines.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applied" className="space-y-4">
          {appliedVaccines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma vacina aplicada</h3>
                <p className="text-gray-500 mb-4">Registre as vacinas já aplicadas no seu pet</p>
                <Button onClick={handleOpenAddVaccine} className="bg-green-600 hover:bg-green-700" disabled={pets.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Vacina
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appliedVaccines
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(vaccine => {
                  const status = getVaccineStatus(vaccine);
                  return (
                    <Card key={vaccine.id} className="overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate mb-3">
                                {vaccine.name}
                                {selectedPet === "" && ( // Show pet name if "Todos os pets" is selected
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({getPetName(vaccine.pet_id)})
                                    </span>
                                )}
                            </h3>
                            {/* Grid responsivo de informações - otimizado para mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 text-sm">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 text-xs mb-1">Data da aplicação</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(vaccine.date)}
                                </p>
                              </div>
                              
                              {vaccine.next_date && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="text-blue-600 text-xs mb-1">Próxima dose</p>
                                  <p className="font-medium text-blue-800">
                                    {formatDate(vaccine.next_date)}
                                  </p>
                                </div>
                              )}
                              
                              {vaccine.vet_name && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <p className="text-green-600 text-xs mb-1">Veterinário</p>
                                  <p className="font-medium text-green-800 truncate" title={vaccine.vet_name}>
                                    {vaccine.vet_name}
                                  </p>
                                </div>
                              )}
                              
                              {vaccine.vet_clinic && (
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <p className="text-purple-600 text-xs mb-1">Clínica</p>
                                  <p className="font-medium text-purple-800 truncate" title={vaccine.vet_clinic}>
                                    {vaccine.vet_clinic}
                                  </p>
                                </div>
                              )}
                              
                              {vaccine.lot_number && (
                                <div className="bg-amber-50 p-3 rounded-lg">
                                  <p className="text-amber-600 text-xs mb-1">Lote</p>
                                  <p className="font-medium text-amber-800 break-all">
                                    {vaccine.lot_number}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {vaccine.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                                <p className="text-xs text-gray-500 mb-1">Observações</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {vaccine.notes}
                                </p>
                              </div>
                            )}
                            
                            {vaccine.has_side_effects && vaccine.side_effects && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg border-l-4 border-l-red-400">
                                <p className="text-xs font-medium text-red-800 mb-1">
                                  ⚠️ Efeitos colaterais
                                </p>
                                <p className="text-sm text-red-700 leading-relaxed">
                                  {vaccine.side_effects}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex lg:flex-col gap-2 justify-end lg:justify-start shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVaccine(vaccine)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteVaccine(vaccine.id)}
                              className={`px-3 ${
                                confirmDelete === vaccine.id
                                  ? "text-red-800 bg-red-100 border-red-300"
                                  : "text-red-600 hover:text-red-800 hover:bg-red-50"
                              }`}
                            >
                              {confirmDelete === vaccine.id ? (
                                <>
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  <span className="text-xs">Confirmar</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  <span className="hidden sm:inline">Excluir</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingVaccines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma vacina agendada</h3>
                <p className="text-gray-500 mb-4">Agende as próximas vacinas do seu pet</p>
                <Button onClick={handleOpenAddVaccine} className="bg-green-600 hover:bg-green-700" disabled={pets.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Vacina
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingVaccines
                .sort((a, b) => new Date(a.next_date || a.date) - new Date(b.next_date || b.date))
                .map(vaccine => {
                  const status = getVaccineStatus(vaccine);
                  const targetDate = vaccine.next_date ? new Date(vaccine.next_date) : new Date(vaccine.date);
                  const daysUntil = differenceInDays(targetDate, new Date());
                  
                  return (
                    <Card key={vaccine.id} className="overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                                {vaccine.name}
                                {selectedPet === "" && ( // Show pet name if "Todos os pets" is selected
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({getPetName(vaccine.pet_id)})
                                    </span>
                                )}
                              </h3>
                              <Badge className={`${status.color} w-fit shrink-0`}>
                                {status.label}
                              </Badge>
                            </div>
                            
                            {/* Grid responsivo para próximas vacinas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 text-sm">
                              <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-400">
                                <p className="text-indigo-600 text-xs mb-1">Data agendada</p>
                                <p className="font-medium text-indigo-800">
                                  {formatDate(targetDate)}
                                </p>
                              </div>
                              
                              <div className={`p-3 rounded-lg border-l-4 ${
                                daysUntil < 0 ? 'bg-red-50 border-red-400' : 
                                daysUntil <= 7 ? 'bg-red-50 border-red-400' : 
                                daysUntil <= 30 ? 'bg-yellow-50 border-yellow-400' : 
                                'bg-green-50 border-green-400'
                              }`}>
                                <p className={`text-xs mb-1 ${
                                  daysUntil < 0 ? 'text-red-600' : 
                                  daysUntil <= 7 ? 'text-red-600' : 
                                  daysUntil <= 30 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  Tempo restante
                                </p>
                                <p className={`font-medium text-sm ${
                                  daysUntil < 0 ? 'text-red-800' : 
                                  daysUntil <= 7 ? 'text-red-800' : 
                                  daysUntil <= 30 ? 'text-yellow-800' : 'text-green-800'
                                }`}>
                                  {daysUntil < 0 ? `⚠️ ${Math.abs(daysUntil)} dias atrasada` :
                                   daysUntil === 0 ? '🔥 Hoje!' :
                                   daysUntil === 1 ? '📅 Amanhã' :
                                   `⏱️ ${daysUntil} dias`}
                                </p>
                              </div>
                              
                              {vaccine.vet_name && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <p className="text-green-600 text-xs mb-1">Veterinário</p>
                                  <p className="font-medium text-green-800 truncate" title={vaccine.vet_name}>
                                    {vaccine.vet_name}
                                  </p>
                                </div>
                              )}
                              
                              {vaccine.vet_clinic && (
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <p className="text-purple-600 text-xs mb-1">Clínica</p>
                                  <p className="font-medium text-purple-800 truncate" title={vaccine.vet_clinic}>
                                    {vaccine.vet_clinic}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {vaccine.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                                <p className="text-xs text-gray-500 mb-1">Observações</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {vaccine.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex lg:flex-col gap-2 justify-end lg:justify-start shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVaccine(vaccine)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteVaccine(vaccine.id)}
                              className={`px-3 ${
                                confirmDelete === vaccine.id
                                  ? "text-red-800 bg-red-100 border-red-300"
                                  : "text-red-600 hover:text-red-800 hover:bg-red-50"
                              }`}
                            >
                              {confirmDelete === vaccine.id ? (
                                <>
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  <span className="text-xs">Confirmar</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  <span className="hidden sm:inline">Excluir</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal para adicionar/editar vacina */}
      <Dialog open={showVaccineDialog} onOpenChange={setShowVaccineDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVaccine ? "Editar Vacina" : "Registrar Nova Vacina"}
            </DialogTitle>
            <DialogDescription>
              {editingVaccine ? "Edite as informações da vacina" : "Registre uma nova vacina"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitVaccine} className="space-y-4">
            <div>
              <Label>Nome da Vacina *</Label>
              <Input
                placeholder="Ex: V10, Antirrábica, Giárdia"
                value={vaccineForm.name}
                onChange={(e) => setVaccineForm({...vaccineForm, name: e.target.value})}
                required
              />
            </div>

            {/* Select for pet in the dialog, if adding and user is vet with multiple pets or owner */}
            {pets.length > 0 && !editingVaccine && ( // Only show pet select if adding and pets exist
                <div>
                    <Label>Pet *</Label>
                    <Select
                        value={vaccineForm.pet_id}
                        onValueChange={(value) => setVaccineForm({...vaccineForm, pet_id: value})}
                        required
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o pet" />
                        </SelectTrigger>
                        <SelectContent>
                            {pets.map(pet => (
                                <SelectItem key={pet.id} value={pet.id}>
                                    {pet.name}
                                    {user?.user_type === "veterinario" && pet.owner_name && (
                                      <span className="text-sm text-gray-500 ml-2">
                                        - {pet.owner_name}
                                      </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {editingVaccine && ( // If editing, show pet name as read-only
                <div>
                    <Label>Pet</Label>
                    <Input value={getPetName(vaccineForm.pet_id)} disabled className="opacity-75" />
                </div>
            )}
            {pets.length === 0 && !editingVaccine && (
                <div className="text-red-500 text-sm">
                    Você precisa cadastrar um pet para registrar uma vacina.
                </div>
            )}


            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data da Aplicação *</Label>
                <Input
                  type="date"
                  value={vaccineForm.date}
                  onChange={(e) => setVaccineForm({...vaccineForm, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Próxima Dose</Label>
                <Input
                  type="date"
                  value={vaccineForm.next_date}
                  onChange={(e) => setVaccineForm({...vaccineForm, next_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Veterinário</Label>
                <Input
                  placeholder="Nome do veterinário"
                  value={vaccineForm.vet_name}
                  onChange={(e) => setVaccineForm({...vaccineForm, vet_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Clínica/Hospital</Label>
                <Input
                  placeholder="Nome da clínica"
                  value={vaccineForm.vet_clinic}
                  onChange={(e) => setVaccineForm({...vaccineForm, vet_clinic: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Número do Lote</Label>
              <Input
                placeholder="Número do lote da vacina"
                value={vaccineForm.lot_number}
                onChange={(e) => setVaccineForm({...vaccineForm, lot_number: e.target.value})}
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações sobre a vacina..."
                value={vaccineForm.notes}
                onChange={(e) => setVaccineForm({...vaccineForm, notes: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_side_effects"
                  checked={vaccineForm.has_side_effects}
                  onChange={(e) => setVaccineForm({...vaccineForm, has_side_effects: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="has_side_effects">Houve efeitos colaterais</Label>
              </div>
              
              {vaccineForm.has_side_effects && (
                <div>
                  <Label>Descrição dos efeitos colaterais</Label>
                  <Textarea
                    placeholder="Descreva os efeitos colaterais observados..."
                    value={vaccineForm.side_effects}
                    onChange={(e) => setVaccineForm({...vaccineForm, side_effects: e.target.value})}
                    rows={2}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVaccineDialog(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !vaccineForm.name || !vaccineForm.pet_id} // Disable if no pet selected for new vaccine
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {editingVaccine ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingVaccine ? "Atualizar" : "Registrar"}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
