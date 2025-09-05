
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { Record } from "@/api/entities";
import { HealthLog } from "@/api/entities";
import { HealthGoal } from "@/api/entities/HealthGoal";
import { User } from "@/api/entities";
import { MedicationRecord } from "@/api/entities";
import { VaccinationRecord } from "@/api/entities";
import { Reminder } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart, Scale, Activity, PlusCircle, Syringe, Plus, Target,
  Pill, AlertTriangle, PawPrint, Calendar, Edit, Trash2, Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function HealthPage() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [vaccineData, setVaccineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  // Estados dos modais
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [showAddLogDialog, setShowAddLogDialog] = useState(false);
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [showAddVaccineDialog, setShowAddVaccineDialog] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);

  // Estados para edição
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ type: null, id: null });

  const [selectedRecordType, setSelectedRecordType] = useState("peso");

  // Estados dos formulários
  const [newRecord, setNewRecord] = useState({
    pet_id: "",
    type: "peso",
    value: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  });

  const [newHealthLog, setNewHealthLog] = useState({
    pet_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    weight: "",
    activity_level: "moderado",
    activity_minutes: "",
    water_intake: "normal",
    notes: "",
    symptoms: []
  });

  const [newHealthGoal, setNewHealthGoal] = useState({
    pet_id: "",
    title: "",
    category: "peso",
    target_value: "",
    target_date: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  });

  const [newMedication, setNewMedication] = useState({
    pet_id: "",
    name: "",
    dosage: "",
    frequency: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    is_continuous: false,
    notes: "",
    reminder_enabled: true,
    reminder_times: ["08:00", "20:00"]
  });

  const [newVaccine, setNewVaccine] = useState({
    pet_id: "",
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    next_date: "",
    vet_name: "",
    notes: ""
  });

  useEffect(() => {
    loadPets();
    
    // Verificar se há parâmetros na URL
    const urlParams = new URLSearchParams(window.location.search);
    const petParam = urlParams.get('pet');
    
    if (petParam) {
      setSelectedPet(petParam);
      setNewRecord(prev => ({ ...prev, pet_id: petParam }));
      setNewHealthLog(prev => ({ ...prev, pet_id: petParam }));
      setNewHealthGoal(prev => ({ ...prev, pet_id: petParam }));
      setNewMedication(prev => ({ ...prev, pet_id: petParam }));
      setNewVaccine(prev => ({ ...prev, pet_id: petParam }));
    }
  }, []);

  useEffect(() => {
    if (selectedPet && user) {
      loadPetData();
      // Atualizar formulários com o pet selecionado
      setNewRecord(prev => ({ ...prev, pet_id: selectedPet }));
      setNewHealthLog(prev => ({ ...prev, pet_id: selectedPet }));
      setNewHealthGoal(prev => ({ ...prev, pet_id: selectedPet }));
      setNewMedication(prev => ({ ...prev, pet_id: selectedPet }));
      setNewVaccine(prev => ({ ...prev, pet_id: selectedPet }));
    }
  }, [selectedPet, user]);

  // Fechar modais com ESC
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showAddRecordDialog) {
          setShowAddRecordDialog(false);
        }
        if (showAddVaccineDialog) {
          setShowAddVaccineDialog(false);
        }
        if (isMedicationModalOpen) {
          setIsMedicationModalOpen(false);
        }
        if (showAddGoalDialog) {
          setShowAddGoalDialog(false);
        }
        if (showAddLogDialog) {
          setShowAddLogDialog(false);
        }
      }
    };

    if (showAddRecordDialog || showAddVaccineDialog || isMedicationModalOpen || showAddGoalDialog || showAddLogDialog) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAddRecordDialog, showAddVaccineDialog, isMedicationModalOpen, showAddGoalDialog, showAddLogDialog]);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await User.me();
      console.log("User data loaded:", userData);
      setUser(userData);

      let petsData = [];
      if (userData.user_type === "veterinario") {
        // Se for veterinário, carregar pets dos convites aceitos
        try {
          const invitations = await VetInvitation.filter({
            vet_email: userData.email,
            status: "aceito"
          });

          const petIds = new Set();
          invitations.forEach(invite => {
            if (invite.pets && Array.isArray(invite.pets)) {
              invite.pets.forEach(pet => {
                if (pet.pet_id) petIds.add(pet.pet_id);
              });
            }
          });

          // Carregar dados dos pets
          for (const petId of petIds) {
            try {
              const pet = await Pet.get(petId);
              if (pet) petsData.push(pet);
            } catch (err) {
              console.error(`Erro ao carregar pet ${petId}:`, err);
            }
          }
        } catch (err) {
          console.error("Erro ao carregar convites do veterinário:", err);
        }
      } else {
        // Se for tutor, carregar pets próprios
        petsData = await Pet.filter({ created_by: userData.email });
      }

      console.log("Pets data loaded:", petsData);
      setPets(petsData);

      // Verificar se há um pet específico na URL
      const urlParams = new URLSearchParams(window.location.search);
      const petParam = urlParams.get('pet');

      if (petParam && petsData.find(p => p.id === petParam)) {
        setSelectedPet(petParam);
      } else if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0].id);
      }

      if (petsData.length === 0) {
        setError("no_pets");
      }

    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      setError("load_error");
    } finally {
      setLoading(false);
    }
  };

  const loadPetData = async () => {
    if (!selectedPet || !user) return;

    try {
      console.log("Loading pet data for:", selectedPet);
      
      // FORÇAR uso de .list() para garantir sincronização COMPLETA
      const [recordsData, logsData, goalsData, medicationsData, vaccinesData] = await Promise.all([
        Record.list().catch(() => []),
        HealthLog.list().catch(() => []),
        HealthGoal.list().catch(() => []),
        MedicationRecord.list().catch(() => []),
        VaccinationRecord.list().catch(() => [])
      ]);
      
      console.log("Raw data loaded from .list():", {
        totalRecords: recordsData.length,
        totalLogs: logsData.length,
        totalGoals: goalsData.length,
        totalMedications: medicationsData.length,
        totalVaccines: vaccinesData.length
      });
      
      // Filtrar por pet_id DEPOIS de carregar todos os dados
      const filteredRecords = recordsData.filter(r => r.pet_id === selectedPet);
      const filteredLogs = logsData.filter(h => h.pet_id === selectedPet);
      const filteredGoals = goalsData.filter(g => g.pet_id === selectedPet);
      const filteredMedications = medicationsData.filter(m => m.pet_id === selectedPet);
      const filteredVaccines = vaccinesData.filter(v => v.pet_id === selectedPet);

      console.log("Filtered data for pet", selectedPet, ":", {
        records: filteredRecords.length,
        logs: filteredLogs.length,
        goals: filteredGoals.length,
        medications: filteredMedications.length,
        vaccines: filteredVaccines.length
      });

      console.log("All vaccines found:", vaccinesData);
      console.log("Vaccines for this pet:", filteredVaccines);

      setRecords(filteredRecords);
      setHealthLogs(filteredLogs);
      setHealthGoals(filteredGoals);
      setMedications(filteredMedications);
      setVaccineData(filteredVaccines);
      
    } catch (error) {
      console.error("Erro ao carregar dados do pet:", error);
    }
  };

  // Função para iniciar edição de registro
  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setNewRecord({
      pet_id: record.pet_id,
      type: record.type,
      value: record.value,
      date: record.date,
      notes: record.notes || ""
    });
    setSelectedRecordType(record.type);
    setShowAddRecordDialog(true);
  };

  // Função para iniciar edição de meta
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewHealthGoal({
      pet_id: goal.pet_id,
      title: goal.title,
      category: goal.category,
      target_value: goal.target_value,
      target_date: goal.target_date,
      notes: goal.notes || ""
    });
    setShowAddGoalDialog(true);
  };

  // Função para excluir registro
  const handleDeleteRecord = async (recordId) => {
    if (confirmDelete.type === "record" && confirmDelete.id === recordId) {
      try {
        setSaving(true);
        await Record.delete(recordId);
        await loadPetData();
        setConfirmDelete({ type: null, id: null });
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
      } finally {
        setSaving(false);
      }
    } else {
      setConfirmDelete({ type: "record", id: recordId });
    }
  };

  // Função para excluir meta
  const handleDeleteGoal = async (goalId) => {
    if (confirmDelete.type === "goal" && confirmDelete.id === goalId) {
      try {
        setSaving(true);
        await HealthGoal.delete(goalId);
        await loadPetData();
        setConfirmDelete({ type: null, id: null });
      } catch (error) {
        console.error("Erro ao excluir meta:", error);
      } finally {
        setSaving(false);
      }
    } else {
      setConfirmDelete({ type: "goal", id: goalId });
    }
  };

  const handleOpenAddRecord = () => {
    setEditingRecord(null);
    setSelectedRecordType("peso");
    setNewRecord({
      pet_id: selectedPet,
      type: "peso",
      value: "",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: ""
    });
    setShowAddRecordDialog(true);
  };

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setNewHealthGoal({
      pet_id: selectedPet,
      title: "",
      category: "peso",
      target_value: "",
      target_date: format(new Date(), "yyyy-MM-dd"),
      notes: ""
    });
    setShowAddGoalDialog(true);
  };

  // Função para atualizar o formulário baseado no tipo selecionado
  const handleRecordTypeChange = (type) => {
    setSelectedRecordType(type);
    setNewRecord({
      ...newRecord,
      type: type,
      value: "",
      notes: ""
    });
  };

  // Função para obter configuração do campo baseado no tipo
  const getRecordConfig = (type) => {
    const configs = {
      peso: {
        label: "Peso (kg)",
        placeholder: "Ex: 15.5",
        inputType: "number",
        step: "0.1",
        unit: "kg"
      },
      consulta: {
        label: "Tipo de Consulta",
        placeholder: "Ex: Consulta de rotina, Emergência",
        inputType: "text",
        unit: ""
      },
      exame: {
        label: "Tipo de Exame",
        placeholder: "Ex: Hemograma, Raio-X, Ultrassom",
        inputType: "text",
        unit: ""
      },
      medicamento: {
        label: "Nome do Medicamento",
        placeholder: "Ex: Rimadyl, Antibiótico",
        inputType: "text",
        unit: ""
      },
      vacina: {
        label: "Nome da Vacina",
        placeholder: "Ex: V10, Antirrábica",
        inputType: "text",
        unit: ""
      },
      temperatura: {
        label: "Temperatura (°C)",
        placeholder: "Ex: 38.5",
        inputType: "number",
        step: "0.1",
        unit: "°C"
      },
      outro: {
        label: "Descrição",
        placeholder: "Descreva o registro",
        inputType: "text",
        unit: ""
      }
    };
    return configs[type] || configs.outro;
  };

  // Atualizar função handleAddRecord para suportar edição
  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.pet_id || !newRecord.value) return;

    try {
      setSaving(true);

      if (editingRecord) {
        await Record.update(editingRecord.id, newRecord);
      } else {
        await Record.create(newRecord);
      }

      // Resetar formulário
      setNewRecord({
        pet_id: selectedPet,
        type: "peso",
        value: "",
        date: format(new Date(), "yyyy-MM-dd"),
        notes: ""
      });

      setShowAddRecordDialog(false);
      setEditingRecord(null);
      await loadPetData();
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddHealthLog = async (e) => {
    e.preventDefault();
    if (!newHealthLog.pet_id) return;

    try {
      setSaving(true);
      await HealthLog.create(newHealthLog);

      setNewHealthLog({
        pet_id: selectedPet,
        date: format(new Date(), "yyyy-MM-dd"),
        weight: "",
        activity_level: "moderado",
        water_intake: "normal",
        notes: "",
        symptoms: []
      });

      setShowAddLogDialog(false);
      await loadPetData();
    } catch (error) {
      console.error("Erro ao salvar log de saúde:", error);
    } finally {
      setSaving(false);
    }
  };

  // Atualizar função handleAddGoal para suportar edição
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newHealthGoal.pet_id || !newHealthGoal.title) return;

    try {
      setSaving(true);

      if (editingGoal) {
        await HealthGoal.update(editingGoal.id, newHealthGoal);
      } else {
        await HealthGoal.create(newHealthGoal);
      }

      setNewHealthGoal({
        pet_id: selectedPet,
        title: "",
        category: "peso",
        target_value: "",
        target_date: format(new Date(), "yyyy-MM-dd"),
        notes: ""
      });

      setShowAddGoalDialog(false);
      setEditingGoal(null);
      await loadPetData();
    } catch (error) {
      console.error("Erro ao salvar meta de saúde:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!newMedication.pet_id || !newMedication.name) return;

    try {
      setSaving(true);

      // Salvar medicamento
      const savedMedication = await MedicationRecord.create(newMedication);

      // Se lembretes estão habilitados, criar lembretes automáticos
      if (newMedication.reminder_enabled && newMedication.reminder_times.length > 0) {
        const pet = pets.find(p => p.id === newMedication.pet_id);

        // Criar lembretes para os próximos 7 dias (ou até a data de término)
        const endDate = newMedication.end_date && !newMedication.is_continuous
            ? new Date(newMedication.end_date)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const startDate = new Date(newMedication.start_date);

        const remindersToCreate = [];

        // Ensure effective start date for reminders is today or later
        const effectiveStartDate = new Date(startDate);
        effectiveStartDate.setHours(0, 0, 0, 0); // Normalize to start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (effectiveStartDate < today) {
          effectiveStartDate.setDate(today.getDate()); // Start reminders from today if start_date is in the past
        }

        for (let date = new Date(effectiveStartDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          for (const time of newMedication.reminder_times) {
            const [hours, minutes] = time.split(':');
            const reminderDate = new Date(date);
            reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            // Só criar lembretes para datas futuras (or very near past, e.g., within the last minute)
            if (reminderDate > new Date(Date.now() - 60 * 1000)) {
              remindersToCreate.push({
                pet_id: newMedication.pet_id,
                title: `Medicamento: ${newMedication.name}`,
                description: `Administrar ${newMedication.dosage} - ${newMedication.frequency}`,
                date: reminderDate.toISOString(),
                type: "medicamento",
                status: "ativo",
                notification_time: ["15min"],
                is_recurring: false // These are individual instances
              });
            }
          }
        }

        // Criar lembretes em lote, limitando para evitar sobrecarga
        for (const reminder of remindersToCreate.slice(0, 14)) { // Limitar a 14 lembretes
          try {
            await Reminder.create(reminder);
          } catch (err) {
            console.error("Erro ao criar lembrete:", err);
          }
        }
      }

      setNewMedication({
        pet_id: selectedPet,
        name: "",
        dosage: "",
        frequency: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        is_continuous: false,
        notes: "",
        reminder_enabled: true,
        reminder_times: ["08:00", "20:00"]
      });

      setIsMedicationModalOpen(false);
      await loadPetData();
    } catch (error) {
      console.error("Erro ao salvar medicamento:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    if (!newVaccine.pet_id || !newVaccine.name) return;

    try {
      setSaving(true);
      await VaccinationRecord.create(newVaccine);

      setNewVaccine({
        pet_id: selectedPet,
        name: "",
        date: format(new Date(), "yyyy-MM-dd"),
        next_date: "",
        vet_name: "",
        notes: ""
      });

      setShowAddVaccineDialog(false);
      await loadPetData();
    } catch (error) {
      console.error("Erro ao salvar vacina:", error);
    } finally {
      setSaving(false);
    }
  };

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : "Pet não encontrado";
  };

  const getPetPhoto = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.photo_url || null;
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
          <p className="text-gray-500">Carregando...</p>
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
          <p className="text-gray-500 mb-6">Você precisa cadastrar um pet para acessar os dados de saúde.</p>
          <Link to={createPageUrl("AddPet")}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Pet
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error === "load_error") {
    return (
      <div className="p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-500 mb-6">Não foi possível carregar os dados de saúde.</p>
          <Button onClick={loadPets} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 pb-24 md:pb-6">
      {/* Header com informações do pet e botão voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Botão voltar para veterinários */}
          {user?.user_type === "veterinario" && (
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              ← Voltar
            </Button>
          )}

          {/* Foto e nome do pet */}
          {selectedPet && (
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-purple-100 overflow-hidden">
                {getPetPhoto(selectedPet) ? (
                  <img
                    src={getPetPhoto(selectedPet)}
                    alt={getPetName(selectedPet)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-8 h-8 text-purple-500" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{getPetName(selectedPet)}</h1>
                <p className="text-gray-600">Histórico de Saúde</p>
              </div>
            </div>
          )}
        </div>

        {!selectedPet && (
          <h1 className="text-2xl font-bold text-gray-900">Saúde dos Pets</h1>
        )}
      </div>

      {selectedPet && (
        <div className="flex flex-col sm:flex-row gap-3">
          {pets.length > 1 && (
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Selecione um pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={handleOpenAddRecord}
            className="bg-purple-700 hover:bg-purple-800"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Registro
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="records">Registros</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Cards de ações rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleOpenAddRecord}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Scale className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Registrar Peso</h3>
                  <p className="text-xs text-gray-500">Acompanhe a evolução</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAddLogDialog(true)}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="bg-green-100 p-3 rounded-full">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Atividade</h3>
                  <p className="text-xs text-gray-500">Registre o dia</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAddVaccineDialog(true)}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="bg-red-100 p-3 rounded-full">
                  <Syringe className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Vacinas</h3>
                  <p className="text-xs text-gray-500">Vacinações</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsMedicationModalOpen(true)}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Pill className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Medicamentos</h3>
                  <p className="text-xs text-gray-500">Controle médico</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo básico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Último Peso Registrado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {records.filter(r => r.type === "peso").length > 0 ? (
                  <div>
                    <p className="text-2xl font-bold">
                      {records.filter(r => r.type === "peso").sort((a, b) => new Date(b.date) - new Date(a.date))[0].value} kg
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(records.filter(r => r.type === "peso").sort((a, b) => new Date(b.date) - new Date(a.date))[0].date), "dd/MM/yyyy")}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum registro de peso</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Metas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {healthGoals.filter(g => g.status === "em_andamento").length}
                </p>
                <p className="text-sm text-gray-500">
                  {healthGoals.filter(g => g.status === "atingida").length} concluídas
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Registros de Saúde</h2>
            <Button onClick={handleOpenAddRecord}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          </div>

          <div className="space-y-3">
            {records.length > 0 ? (
              records.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{record.type}: {record.value}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(record.date), "dd/MM/yyyy")}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge>{record.type}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className={`${
                            confirmDelete.type === "record" && confirmDelete.id === record.id
                              ? "text-red-800 bg-red-100"
                              : "text-red-600 hover:text-red-800"
                          }`}
                        >
                          {confirmDelete.type === "record" && confirmDelete.id === record.id ? (
                            <span className="text-xs">Confirmar?</span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum registro encontrado</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Metas de Saúde</h2>
            <Button onClick={handleOpenAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>

          <div className="space-y-3">
            {healthGoals.length > 0 ? (
              healthGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-gray-500">
                          Meta: {goal.target_value} - {goal.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          Prazo: {format(new Date(goal.target_date), "dd/MM/yyyy")}
                        </p>
                        {goal.notes && (
                          <p className="text-sm text-gray-600 mt-1">{goal.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={
                          goal.status === "em_andamento" ? "bg-blue-100 text-blue-800" :
                          goal.status === "atingida" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {goal.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGoal(goal)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className={`${
                            confirmDelete.type === "goal" && confirmDelete.id === goal.id
                              ? "text-red-800 bg-red-100"
                              : "text-red-600 hover:text-red-800"
                          }`}
                        >
                          {confirmDelete.type === "goal" && confirmDelete.id === goal.id ? (
                            <span className="text-xs">Confirmar?</span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma meta definida</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-bold">Análise de Saúde</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total de Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{records.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vacinas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{vaccineData.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medicamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{medications.length}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal para adicionar/editar registro */}
      <Dialog open={showAddRecordDialog} onOpenChange={(open) => {
        setShowAddRecordDialog(open);
        if (!open) {
          setEditingRecord(null);
          setConfirmDelete({ type: null, id: null });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Editar Registro de Saúde" : "Adicionar Registro de Saúde"}
            </DialogTitle>
            <DialogDescription>
              {editingRecord ? "Edite o registro" : "Adicione um novo registro"} de saúde para {pets.find(p => p.id === selectedPet)?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRecord} className="space-y-4">
            <div>
              <Label>Tipo de Registro</Label>
              <Select
                value={newRecord.type}
                onValueChange={handleRecordTypeChange}
                disabled={!!editingRecord}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peso">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-600" />
                      <span>Peso</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="temperatura">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>Temperatura</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="consulta">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>Consulta</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="exame">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span>Exame</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medicamento">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-orange-600" />
                      <span>Medicamento</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="vacina">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-red-600" />
                      <span>Vacina</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="outro">
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-gray-600" />
                      <span>Outro</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{getRecordConfig(newRecord.type).label}</Label>
              <div className="relative">
                <Input
                  type={getRecordConfig(newRecord.type).inputType}
                  step={getRecordConfig(newRecord.type).step}
                  placeholder={getRecordConfig(newRecord.type).placeholder}
                  value={newRecord.value}
                  onChange={(e) => setNewRecord({...newRecord, value: e.target.value})}
                  required
                  className={getRecordConfig(newRecord.type).unit ? "pr-12" : ""}
                />
                {getRecordConfig(newRecord.type).unit && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {getRecordConfig(newRecord.type).unit}
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label>Data do Registro</Label>
              <Input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                required
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div>
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Observações sobre este registro..."
                value={newRecord.notes}
                onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                rows={3}
                className="resize-none"
              />
            </div>

            <DialogFooter className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddRecordDialog(false);
                  setEditingRecord(null);
                  setConfirmDelete({ type: null, id: null });
                }}
                disabled={saving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !newRecord.value}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {editingRecord ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingRecord ? "Atualizar Registro" : "Salvar Registro"}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar log de saúde */}
      <Dialog open={showAddLogDialog} onOpenChange={setShowAddLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Log de Atividade</DialogTitle>
            <DialogDescription>
              Registre a atividade e saúde do seu pet hoje
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddHealthLog} className="space-y-4">
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={newHealthLog.date}
                onChange={(e) => setNewHealthLog({...newHealthLog, date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="15.5"
                value={newHealthLog.weight}
                onChange={(e) => setNewHealthLog({...newHealthLog, weight: e.target.value})}
              />
            </div>

            <div>
              <Label>Nível de Atividade</Label>
              <Select
                value={newHealthLog.activity_level}
                onValueChange={(value) => setNewHealthLog({...newHealthLog, activity_level: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Minutos de Atividade</Label>
              <Input
                type="number"
                placeholder="30"
                value={newHealthLog.activity_minutes}
                onChange={(e) => setNewHealthLog({...newHealthLog, activity_minutes: e.target.value})}
              />
            </div>

            <div>
              <Label>Consumo de Água</Label>
              <Select
                value={newHealthLog.water_intake}
                onValueChange={(value) => setNewHealthLog({...newHealthLog, water_intake: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Como foi o dia do seu pet..."
                value={newHealthLog.notes}
                onChange={(e) => setNewHealthLog({...newHealthLog, notes: e.target.value})}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddLogDialog(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar/editar meta */}
      <Dialog open={showAddGoalDialog} onOpenChange={(open) => {
        setShowAddGoalDialog(open);
        if (!open) {
          setEditingGoal(null);
          setConfirmDelete({ type: null, id: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Editar Meta de Saúde" : "Nova Meta de Saúde"}
            </DialogTitle>
            <DialogDescription>
              {editingGoal ? "Edite a meta" : "Defina uma nova meta"} de saúde para seu pet
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <Label>Título da Meta</Label>
              <Input
                placeholder="Ex: Perder 2kg"
                value={newHealthGoal.title}
                onChange={(e) => setNewHealthGoal({...newHealthGoal, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <Select
                value={newHealthGoal.category}
                onValueChange={(value) => setNewHealthGoal({...newHealthGoal, category: value})}
                disabled={!!editingGoal}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peso">Peso</SelectItem>
                  <SelectItem value="atividade">Atividade</SelectItem>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="medicacao">Medicação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor Alvo</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ex: 15.0"
                value={newHealthGoal.target_value}
                onChange={(e) => setNewHealthGoal({...newHealthGoal, target_value: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Data Alvo</Label>
              <Input
                type="date"
                value={newHealthGoal.target_date}
                onChange={(e) => setNewHealthGoal({...newHealthGoal, target_date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Detalhes sobre a meta..."
                value={newHealthGoal.notes}
                onChange={(e) => setNewHealthGoal({...newHealthGoal, notes: e.target.value})}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddGoalDialog(false);
                  setEditingGoal(null);
                  setConfirmDelete({ type: null, id: null });
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingGoal ? "Atualizar Meta" : "Salvar Meta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar medicamento */}
      <Dialog open={isMedicationModalOpen} onOpenChange={setIsMedicationModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Medicamento</DialogTitle>
            <DialogDescription>
              Registre um novo medicamento para seu pet
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMedication} className="space-y-4">
            <div>
              <Label>Nome do Medicamento</Label>
              <Input
                placeholder="Ex: Rimadyl"
                value={newMedication.name}
                onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Dosagem</Label>
              <Input
                placeholder="Ex: 50mg, 1 comprimido"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Frequência</Label>
              <Input
                placeholder="Ex: 2x ao dia, a cada 8h"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={newMedication.start_date}
                  onChange={(e) => setNewMedication({...newMedication, start_date: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>Data de Término</Label>
                <Input
                  type="date"
                  value={newMedication.end_date}
                  onChange={(e) => setNewMedication({...newMedication, end_date: e.target.value})}
                  disabled={newMedication.is_continuous}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_continuous"
                checked={newMedication.is_continuous}
                onChange={(e) => setNewMedication({
                  ...newMedication,
                  is_continuous: e.target.checked,
                  end_date: e.target.checked ? "" : newMedication.end_date
                })}
              />
              <Label htmlFor="is_continuous">Medicamento contínuo (uso prolongado)</Label>
            </div>

            {/* Seção de Lembretes */}
            <div className="border rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-600" />
                  Lembretes e Notificações
                </Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reminder_enabled"
                    checked={newMedication.reminder_enabled}
                    onChange={(e) => setNewMedication({...newMedication, reminder_enabled: e.target.checked})}
                  />
                  <Label htmlFor="reminder_enabled">Ativar lembretes</Label>
                </div>
              </div>

              {newMedication.reminder_enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-purple-700 mb-2 block">
                      Horários dos lembretes diários
                    </Label>
                    <div className="space-y-2">
                      {newMedication.reminder_times.map((time, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...newMedication.reminder_times];
                              newTimes[index] = e.target.value;
                              setNewMedication({...newMedication, reminder_times: newTimes});
                            }}
                            className="w-32"
                          />
                          {newMedication.reminder_times.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTimes = newMedication.reminder_times.filter((_, i) => i !== index);
                                setNewMedication({...newMedication, reminder_times: newTimes});
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newTimes = [...newMedication.reminder_times, "12:00"];
                          setNewMedication({...newMedication, reminder_times: newTimes});
                        }}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar horário
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-purple-200">
                    <p className="text-sm text-purple-700 flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Como funcionam os lembretes:
                    </p>
                    <ul className="text-xs text-purple-600 space-y-1 ml-6">
                      <li>• Lembretes serão criados para os próximos 7 dias</li>
                      <li>• Você receberá notificação 15 minutos antes de cada horário</li>
                      <li>• Para medicamentos contínuos, novos lembretes podem ser criados automaticamente no futuro, mediante acompanhamento da aplicação</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações sobre o medicamento..."
                value={newMedication.notes}
                onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                rows={3}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMedicationModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Salvar Medicamento
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar vacina */}
      <Dialog open={showAddVaccineDialog} onOpenChange={setShowAddVaccineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Vacina</DialogTitle>
            <DialogDescription>
              Registre uma nova vacina para seu pet
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddVaccine} className="space-y-4">
            <div>
              <Label>Nome da Vacina</Label>
              <Input
                placeholder="Ex: V10"
                value={newVaccine.name}
                onChange={(e) => setNewVaccine({...newVaccine, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Data da Aplicação</Label>
              <Input
                type="date"
                value={newVaccine.date}
                onChange={(e) => setNewVaccine({...newVaccine, date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Próxima Dose</Label>
              <Input
                type="date"
                value={newVaccine.next_date}
                onChange={(e) => setNewVaccine({...newVaccine, next_date: e.target.value})}
              />
            </div>

            <div>
              <Label>Veterinário</Label>
              <Input
                placeholder="Nome do veterinário"
                value={newVaccine.vet_name}
                onChange={(e) => setNewVaccine({...newVaccine, vet_name: e.target.value})}
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações sobre a vacina..."
                value={newVaccine.notes}
                onChange={(e) => setNewVaccine({...newVaccine, notes: e.target.value})}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddVaccineDialog(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
