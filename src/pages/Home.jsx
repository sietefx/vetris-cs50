import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { Event } from "@/api/entities";
import { HealthLog } from "@/api/entities";
import { Record } from "@/api/entities";
import { User } from "@/api/entities";
import { VaccinationRecord } from "@/api/entities";
import { Reminder } from "@/api/entities";
import { MedicationRecord } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle, Calendar, Heart, PawPrint, Bell,
  ArrowRight, AlertTriangle, RefreshCw,
  Syringe, Activity, Plus, ChevronRight,
  Clock, BookOpen, Pill, Edit, Link2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays, isToday, isTomorrow, differenceInYears } from "date-fns";
import DonationCard from "@/components/donations/DonationCard";
import PetModal from "@/components/pets/PetModal";
import CompletePetForm from "@/components/pets/CompletePetForm";
import VetInfoCard from "@/components/pets/VetInfoCard";
import InviteVetForm from "@/components/vets/InviteVetForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const QuickActionButton = ({ icon, label, href }) => (
  <Link to={href} className="block">
    <Button
      variant="outline"
      className="w-full flex flex-col items-center justify-center py-6 h-auto border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
    >
      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  </Link>
);

const calculateAge = (birthDate) => {
  if (!birthDate) return "Idade não informada";

  try {
    const birthDateObj = new Date(birthDate);
    const today = new Date();

    if (isNaN(birthDateObj.getTime())) {
      return "Data inválida";
    }

    const years = differenceInYears(today, birthDateObj);
    const days = differenceInDays(today, birthDateObj);

    if (years === 0) {
      const months = Math.floor(days / 30);
      return months <= 0 ? `${days} dias` : `${months} meses`;
    } else if (years === 1) {
      return "1 ano";
    } else {
      return `${years} anos`;
    }
  } catch (error) {
    return "Erro no cálculo";
  }
};

const PetCard = ({ pet, isSelected, onClick, onEdit, lastWeight, onManageVet, hasLinkedVet }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [pet.id, pet.photo_url]);

  if (!pet || !pet.id || !pet.name) {
    return null;
  }

  const finalWeight = pet.weight ? `${pet.weight} kg` : lastWeight;
  const displayAge = calculateAge(pet.birth_date);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg group ${
        isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200 bg-gray-100 relative">
            {pet.photo_url && !imageError ? (
              <>
                <img
                  key={`card-${pet.id}-${pet.photo_url}`}
                  src={pet.photo_url}
                  alt={pet.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(false);
                  }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100">
                <PawPrint className="w-8 h-8 text-purple-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold truncate">{pet.name}</h3>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {pet.species === 'gato' ? 'Gato' :
               pet.species === 'cachorro' ? 'Cachorro' :
               pet.species || 'Pet'} • {pet.breed || 'SRD'}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-500">Idade</p>
                <p className="font-medium">{displayAge}</p>
              </div>
              <div>
                <p className="text-gray-500">Peso</p>
                <p className="font-medium">{finalWeight || "Não informado"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pet);
            }}
          >
            <Edit className="h-4 w-4" />
            <span>Editar Pet</span>
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-purple-600 hover:bg-purple-50 border-purple-200"
            onClick={(e) => {
              e.stopPropagation();
              onManageVet(pet);
            }}
            disabled={!pet?.id || !pet?.name}
          >
            <Link2 className="h-4 w-4" />
            <span>{hasLinkedVet ? 'Gerenciar Veterinário' : 'Convidar Veterinário'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [healthData, setHealthData] = useState({ records: [], healthLogs: [] });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [medications, setMedications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedPetForModal, setSelectedPetForModal] = useState(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  // Vet management states
  const [showVetManagement, setShowVetManagement] = useState(false);
  const [managingPet, setManagingPet] = useState(null);
  const [petsVetStatus, setPetsVetStatus] = useState({});

  // Main image states
  const [mainImageError, setMainImageError] = useState(false);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedPet && user) {
      loadPetData();
    }
  }, [selectedPet, user]);

  useEffect(() => {
    setMainImageError(false);
    setMainImageLoaded(false);
  }, [selectedPet]);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.user_type === "veterinario") {
        window.location.href = createPageUrl("VetDashboard");
        return;
      }
      
      await loadData(userData);
    } catch (error) {
      console.log("Usuário não autenticado", error);
      window.location.href = createPageUrl("Welcome");
    }
  };

  const checkVetStatusForPets = async (petsData) => {
    if (!petsData || petsData.length === 0) {
      setPetsVetStatus({});
      return;
    }

    const initialStatus = {};
    petsData.forEach(pet => {
      initialStatus[pet.id] = { hasVet: false, loading: true };
    });
    setPetsVetStatus(initialStatus);

    try {
      const invitations = await VetInvitation.filter({
        status: "aceito"
      }).catch(() => []);

      const statusMap = {};
      petsData.forEach(pet => {
        const petInvitation = invitations.find(invitation => 
          invitation.pets && 
          Array.isArray(invitation.pets) && 
          invitation.pets.some(p => p.pet_id === pet.id)
        );
        
        statusMap[pet.id] = {
          hasVet: !!petInvitation,
          loading: false
        };
      });

      setPetsVetStatus(statusMap);
    } catch (error) {
      console.error("Erro ao verificar status vet:", error);
      const statusMap = {};
      petsData.forEach(pet => {
        statusMap[pet.id] = { hasVet: false, loading: false };
      });
      setPetsVetStatus(statusMap);
    }
  };

  const loadData = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      let petsData = [];
      
      try {
        petsData = await Pet.filter({ created_by: userData.email }).catch(async () => {
          const allPets = await Pet.list();
          return allPets.filter(pet => pet.created_by === userData.email);
        });
      } catch (err) {
        console.error("Erro ao carregar pets:", err);
        petsData = [];
      }

      setPets([...petsData]);
      
      if (userData.user_type !== "veterinario") {
        try {
          await checkVetStatusForPets(petsData);
        } catch (vetError) {
          console.warn('Erro ao verificar status vet:', vetError);
        }
      }
      
      if (petsData.length > 0) {
        const currentSelectedPet = selectedPet && petsData.find(p => p.id === selectedPet);
        if (!currentSelectedPet) {
          setSelectedPet(petsData[0].id);
        }
      } else {
        setSelectedPet(null);
      }

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  };

  const loadPetData = async () => {
    if (!selectedPet || !user) return;

    try {
      const results = await Promise.allSettled([
        HealthLog.filter({ pet_id: selectedPet }).catch(() => []),
        Record.filter({ pet_id: selectedPet }).catch(() => []),
        Event.filter({ pet_id: selectedPet }).catch(() => []),
        MedicationRecord.filter({ pet_id: selectedPet }).catch(() => []),
        VaccinationRecord.filter({ pet_id: selectedPet }).catch(() => []),
        Reminder.filter({ pet_id: selectedPet }).catch(() => [])
      ]);

      const healthLogs = results[0].status === 'fulfilled' ? results[0].value : [];
      const records = results[1].status === 'fulfilled' ? results[1].value : [];
      const events = results[2].status === 'fulfilled' ? results[2].value : [];
      const medRecords = results[3].status === 'fulfilled' ? results[3].value : [];
      const vaccines = results[4].status === 'fulfilled' ? results[4].value : [];
      const reminderData = results[5].status === 'fulfilled' ? results[5].value : [];

      setHealthData({ 
        records: Array.isArray(records) ? records : [], 
        healthLogs: Array.isArray(healthLogs) ? healthLogs : [] 
      });

      // Próximos eventos
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

      const upcoming = (Array.isArray(events) ? events : [])
        .filter(event => {
          if (!event?.date) return false;
          try {
            const eventDate = new Date(event.date);
            return !isNaN(eventDate.getTime()) && 
                   eventDate >= now && 
                   eventDate <= sevenDaysFromNow && 
                   event.status === "pendente";
          } catch (err) {
            return false;
          }
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

      setUpcomingEvents(upcoming);

      // Próximas vacinas
      const upcomingVaccines = (Array.isArray(vaccines) ? vaccines : [])
        .filter(v => {
          if (!v?.next_date) return false;
          try {
            const nextDate = new Date(v.next_date);
            return !isNaN(nextDate.getTime()) && nextDate > now;
          } catch (err) {
            return false;
          }
        })
        .sort((a, b) => new Date(a.next_date) - new Date(b.next_date))
        .slice(0, 3);

      setVaccinationRecords(upcomingVaccines);

      // Medicamentos ativos
      const activeMeds = (Array.isArray(medRecords) ? medRecords : [])
        .filter(med => {
          if (!med) return false;
          try {
            if (med.is_continuous) return true;
            if (!med.end_date) return true;
            const endDate = new Date(med.end_date);
            return !isNaN(endDate.getTime()) && endDate >= now;
          } catch (err) {
            return false;
          }
        });

      setMedications(activeMeds);

      // Lembretes
      const upcomingReminders = (Array.isArray(reminderData) ? reminderData : [])
        .filter(reminder => {
          if (!reminder || reminder.status !== "ativo" || !reminder.date) return false;
          try {
            const reminderDate = new Date(reminder.date);
            return !isNaN(reminderDate.getTime()) && reminderDate >= now;
          } catch (err) {
            return false;
          }
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2);

      const upcomingEventsAsReminders = upcoming.slice(0, 2).map(event => ({
        ...event,
        type: "agenda",
        reminder_type: event.type
      }));

      const combinedReminders = [...upcomingReminders, ...upcomingEventsAsReminders]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

      setReminders(combinedReminders);

    } catch (error) {
      console.error("Erro ao carregar dados do pet:", error);
      setHealthData({ records: [], healthLogs: [] });
      setUpcomingEvents([]);
      setVaccinationRecords([]);
      setMedications([]);
      setReminders([]);
    }
  };

  // Handlers for pet actions
  const handlePetClick = (pet) => {
    setSelectedPet(pet.id);
  };

  const handlePetModalOpen = (pet) => {
    setSelectedPetForModal(pet);
    setShowPetModal(true);
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setShowPetForm(true);
    setShowPetModal(false);
  };

  const handleSavePet = async () => {
    setShowPetForm(false);
    setEditingPet(null);
    setSelectedPetForModal(null);
    
    setTimeout(async () => {
      try {
        setPets([]);
        setSelectedPet(null);
        
        setTimeout(async () => {
          await loadData(user);
        }, 500);
        
      } catch (err) {
        console.error("Erro ao recarregar dados:", err);
        setTimeout(() => loadData(user), 2000);
      }
    }, 1000);
  };

  const handleDeletePet = async () => {
    if (!petToDelete) return;

    try {
      setLoading(true);
      setError(null);
      await Pet.delete(petToDelete.id);
      setPetToDelete(null);
      setShowDeleteConfirm(false);
      await handleSavePet(); 
    } catch (error) {
      console.error("Erro ao deletar pet:", error);
      setError("Erro ao excluir pet. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getLastWeight = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (pet && pet.weight) {
      return `${pet.weight} kg`;
    }

    const weightRecords = healthData.records
      .filter(r => r.type === "peso" && r.pet_id === petId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (weightRecords.length === 0) return null;
    return `${weightRecords[0].value} kg`;
  };

  const handleManageVet = (pet) => {
    if (!pet || typeof pet !== 'object') {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Pet não encontrado. Recarregue a página."
      });
      return;
    }

    const petId = pet.id;
    const petName = pet.name;

    if (!petId || !petName) {
      toast({
        variant: "destructive",
        title: "Erro", 
        description: "Dados do pet incompletos."
      });
      return;
    }

    const validPet = {
      id: String(petId).trim(),
      name: String(petName).trim()
    };

    setManagingPet(validPet);
    setShowVetManagement(true);
  };

  const handleVetManagementSuccess = async () => {
    setShowVetManagement(false);
    setManagingPet(null);
    
    if (pets.length > 0 && user) {
      await checkVetStatusForPets(pets);
    }

    toast({
      title: "Sucesso",
      description: "Veterinário gerenciado com sucesso!"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Erro ao Carregar</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <Button
          onClick={() => loadData(user)}
          className="bg-purple-700 hover:bg-purple-800"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ec5f2f_Asset9.png"
          alt="Logo Vetris"
          className="w-24 h-24 mb-8"
        />

        <h2 className="text-2xl font-bold mb-4">
          Bem-vindo ao Vetris{user ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Comece adicionando seu primeiro pet para gerenciar sua saúde e bem-estar
        </p>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-sm mb-8 max-w-md">
          <h3 className="font-semibold text-purple-700 mb-2">O que você pode fazer:</h3>
          <ul className="space-y-2 text-left">
            <li className="flex items-center">
              <span className="bg-purple-100 p-1 rounded-full mr-2">
                <PawPrint className="w-4 h-4 text-purple-700" />
              </span>
              Registrar os dados de saúde do seu pet
            </li>
            <li className="flex items-center">
              <span className="bg-purple-100 p-1 rounded-full mr-2">
                <Heart className="w-4 h-4 text-purple-700" />
              </span>
              Acompanhar a saúde e bem-estar
            </li>
            <li className="flex items-center">
              <span className="bg-purple-100 p-1 rounded-full mr-2">
                <BookOpen className="w-4 h-4 text-purple-700" />
              </span>
              Manter um diário do seu pet
            </li>
          </ul>
        </div>

        <Button 
          onClick={() => {
            setEditingPet(null);
            setShowPetForm(true);
          }}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Adicionar Pet
        </Button>
      </div>
    );
  }

  const selectedPetObj = pets.find(p => p.id === selectedPet);
  const currentPetWeight = selectedPetObj ? getLastWeight(selectedPetObj.id) : null;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6 pb-24 md:pb-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user ? user.full_name.split(' ')[0] : 'Tutor'}
        </h1>
        <p className="text-gray-600">Bem-vindo ao dashboard de saúde dos seus pets</p>
      </header>

      {/* Cards dos Pets */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meus Pets</h2>
          <Button
            onClick={() => {
              setEditingPet(null);
              setShowPetForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pet
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pets.map(pet => {
            if (!pet || !pet.id || !pet.name) {
              return null;
            }

            const petWeight = getLastWeight(pet.id);
            const vetStatus = petsVetStatus[pet.id] || { hasVet: false, loading: true };
            
            return (
              <PetCard
                key={pet.id}
                pet={pet}
                isSelected={selectedPet === pet.id}
                onClick={() => handlePetClick(pet)}
                onEdit={handleEditPet}
                onManageVet={handleManageVet}
                lastWeight={petWeight}
                hasLinkedVet={vetStatus.hasVet}
              />
            );
          })}
        </div>
      </div>

      {/* Dashboard do Pet Selecionado */}
      {selectedPetObj && (
        <>
          {/* Card Principal do Pet */}
          <Card className="shadow-md overflow-hidden border-0 mb-6">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 relative">
                  <div
                    className="w-full h-64 md:h-full bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden rounded-lg"
                    onClick={() => handlePetModalOpen(selectedPetObj)}
                  >
                    {selectedPetObj.photo_url && !mainImageError ? (
                      <>
                        <img
                          key={`main-${selectedPetObj.id}-${selectedPetObj.photo_url}`}
                          src={selectedPetObj.photo_url}
                          alt={selectedPetObj.name}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            mainImageLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => setMainImageLoaded(true)}
                          onError={() => {
                            setMainImageError(true);
                            setMainImageLoaded(false);
                          }}
                        />
                        {!mainImageLoaded && (
                           <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                           </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-100">
                        <PawPrint className="w-16 h-16 text-purple-300" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 p-4 md:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold mb-1 truncate">{selectedPetObj.name}</h3>
                      <p className="text-gray-500 text-sm md:text-base mb-3">
                        {selectedPetObj.species === 'gato' ? 'Gato' : 
                         selectedPetObj.species === 'cachorro' ? 'Cachorro' : 
                         selectedPetObj.species} • {selectedPetObj.breed || 'SRD'}
                      </p>

                      <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Idade</p>
                          <p className="font-medium">
                            {selectedPetObj.birth_date ?
                              calculateAge(selectedPetObj.birth_date) :
                              "Não informada"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Peso</p>
                          <p className="font-medium">
                            {currentPetWeight || "Não informado"}
                          </p>
                        </div>
                      </div>

                      <VetInfoCard petId={selectedPetObj.id} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <Link to={createPageUrl("Health")} className="flex-1 sm:flex-initial">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
                        Ver Histórico de Saúde
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePetModalOpen(selectedPetObj)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full sm:w-auto text-xs md:text-sm"
                    >
                      Ver Detalhes Completos
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard de Dados */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Medicamentos e Ações */}
            <div className="space-y-6">
              {/* Ações Rápidas */}
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold mb-3">Ações Rápidas</h2>
                <div className="grid grid-cols-2 gap-3">
                  <QuickActionButton
                    icon={<Heart className="w-6 h-6 text-purple-600" />}
                    label="Saúde"
                    href={createPageUrl("Health")}
                  />
                  <QuickActionButton
                    icon={<Bell className="w-6 h-6 text-blue-600" />}
                    label="Lembretes"
                    href={createPageUrl("Reminders")}
                  />
                  <QuickActionButton
                    icon={<BookOpen className="w-6 h-6 text-green-600" />}
                    label="Diário"
                    href={createPageUrl("Diary")}
                  />
                  <QuickActionButton
                    icon={<PawPrint className="w-6 h-6 text-amber-600" />}
                    label="Perfil"
                    href={createPageUrl("Profile")}
                  />
                </div>
              </div>

              {/* Medicamentos Ativos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="w-4 h-4 text-purple-600" />
                    Medicamentos Ativos
                    {medications.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {medications.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {medications.length > 0 ? (
                    <div className="space-y-2">
                      {medications.slice(0, 3).map((med, idx) => (
                        <div key={med.id || idx} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex-1">
                            <span className="font-medium">{med.name}</span>
                            <div className="text-sm text-gray-600">
                              {med.dosage} • {med.frequency}
                            </div>
                          </div>
                        </div>
                      ))}
                      {medications.length > 3 && (
                        <div className="text-center pt-2">
                          <Link to={createPageUrl("Health")}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              Ver todos ({medications.length})
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      Sem medicamentos ativos
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna 2: Próximos Eventos */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Próximos Eventos
                    {upcomingEvents.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {upcomingEvents.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingEvents.map((event, idx) => {
                        const eventDate = new Date(event.date);

                        let timeText = "";
                        if (isToday(eventDate)) {
                          timeText = `Hoje às ${format(eventDate, "HH:mm")}`;
                        } else if (isTomorrow(eventDate)) {
                          timeText = "Amanhã";
                        } else {
                          timeText = format(eventDate, "dd/MM");
                        }

                        return (
                          <div key={event.id || idx} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                event.type === "consulta" ? "bg-blue-500" :
                                event.type === "banho" ? "bg-green-500" :
                                event.type === "tosa" ? "bg-purple-500" :
                                "bg-gray-500"
                              }`}></div>
                              <span className="text-sm font-medium">{event.title}</span>
                            </div>
                            <span className="text-xs text-gray-500">{timeText}</span>
                          </div>
                        );
                      })}
                      <div className="text-center pt-2">
                        <Link to={createPageUrl("Calendar")}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Ver agenda completa
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      Sem eventos próximos
                      <div className="mt-2">
                        <Link to={createPageUrl("Calendar")}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Criar evento
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Próximas Vacinas */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-green-600" />
                    Próximas Vacinas
                    {vaccinationRecords.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {vaccinationRecords.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vaccinationRecords.length > 0 ? (
                    <div className="space-y-2">
                      {vaccinationRecords.map((vaccine, idx) => {
                        const daysUntil = differenceInDays(new Date(vaccine.next_date), new Date());

                        return (
                          <div key={vaccine.id || idx} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                daysUntil <= 7 ? 'bg-red-500' :
                                daysUntil <= 30 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                              <span className="text-sm font-medium">{vaccine.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {daysUntil === 0 ? 'Hoje' :
                               daysUntil === 1 ? 'Amanhã' :
                               `${daysUntil} dias`}
                            </span>
                          </div>
                        );
                      })}
                      <div className="text-center pt-2">
                        <Link to={createPageUrl("VaccineHistory")}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Ver histórico de vacinas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      Sem vacinas agendadas
                      <div className="mt-2">
                        <Link to={createPageUrl("Health")}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Registrar vacina
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna 3: Lembretes */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-600" />
                    Próximos Lembretes
                    {reminders.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {reminders.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reminders.length > 0 ? (
                    <div className="space-y-2">
                      {reminders.map((reminder, idx) => {
                        const reminderDate = new Date(reminder.date);
                        const daysUntil = differenceInDays(reminderDate, new Date());

                        let timeText = "";
                        if (daysUntil === 0) {
                          timeText = `Hoje às ${format(reminderDate, "HH:mm")}`;
                        } else if (daysUntil === 1) {
                          timeText = "Amanhã";
                        } else if (daysUntil > 1) {
                          timeText = `Em ${daysUntil} dias`;
                        } else {
                          timeText = format(reminderDate, "dd/MM");
                        }

                        let icon;
                        let bgColor = "";

                        if (reminder.type === "agenda") {
                          icon = <Calendar className="h-4 w-4 text-blue-500" />;
                          bgColor = "bg-blue-50";
                        } else if (reminder.type === "consulta") {
                          icon = <Calendar className="h-4 w-4 text-blue-500" />;
                        } else if (reminder.type === "vacina") {
                          icon = <Syringe className="h-4 w-4 text-red-500" />;
                        } else if (reminder.type === "medicamento") {
                          icon = <Pill className="h-4 w-4 text-purple-500" />;
                        } else {
                          icon = <Bell className="h-4 w-4 text-gray-500" />;
                        }

                        return (
                          <div key={reminder.id || idx} className={`p-2 border rounded-md ${bgColor}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {icon}
                              <span className="text-sm font-medium">{reminder.title}</span>
                            </div>
                            <span className="text-xs text-gray-500">{timeText}</span>
                            {reminder.type === "agenda" && (
                              <div className="text-xs text-blue-600 mt-1">
                                {reminder.reminder_type === "consulta" ? "Consulta" :
                                 reminder.reminder_type === "banho" ? "Banho" :
                                 reminder.reminder_type === "tosa" ? "Tosa" : "Evento"} na agenda
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className="text-center pt-2">
                        <Link to={createPageUrl("Reminders")}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Ver todos os lembretes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      Nenhum lembrete próximo
                      <div className="mt-2">
                        <Link to={createPageUrl("Reminders")}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Criar lembrete
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Card de Doação */}
      <div className="mt-16">
        <DonationCard />
      </div>

      {/* Modals */}
      {showPetModal && selectedPetForModal && (
        <PetModal
          pet={selectedPetForModal}
          isOpen={showPetModal}
          onClose={() => {
            setShowPetModal(false);
            setSelectedPetForModal(null);
          }}
          onEdit={handleEditPet}
          onDelete={() => {
            setPetToDelete(selectedPetForModal);
            setShowDeleteConfirm(true);
            setShowPetModal(false);
          }}
        />
      )}

      {showPetForm && (
        <CompletePetForm
          pet={editingPet}
          isOpen={showPetForm}
          onClose={() => {
            setShowPetForm(false);
            setEditingPet(null);
          }}
          onSave={handleSavePet}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir {petToDelete?.name || "este pet"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os dados associados a este pet,
              incluindo histórico de saúde, eventos, vacinas e lembretes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPetToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePet} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de gerenciamento de veterinários */}
      {showVetManagement && managingPet && (
        <InviteVetForm
          petId={managingPet.id}
          petName={managingPet.name}
          isOpen={showVetManagement}
          onClose={() => {
            setShowVetManagement(false);
            setManagingPet(null);
          }}
          onSuccess={handleVetManagementSuccess}
        />
      )}
    </div>
  );
}