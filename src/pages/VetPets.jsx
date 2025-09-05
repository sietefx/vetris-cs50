import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Pet } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Record } from "@/api/entities";
import { VaccinationRecord } from "@/api/entities";
import { MedicationRecord } from "@/api/entities";
import { HealthLog } from "@/api/entities";
import { Event } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PawPrint, Search, Heart, Calendar, Syringe,
  Pill, Activity, AlertTriangle, RefreshCw,
  ChevronRight, Mail, Phone, User as UserIcon,
  Filter, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays, differenceInYears } from "date-fns";

const calculateAge = (birthDate) => {
  if (!birthDate) return "Idade não informada";

  try {
    const years = differenceInYears(new Date(), new Date(birthDate));
    const days = differenceInDays(new Date(), new Date(birthDate));

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

const PetCard = ({ pet, ownerInfo, lastVisit, urgentAlerts, onClick }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={() => onClick(pet)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 bg-gray-100">
            {pet.photo_url && !imageError ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100">
                <PawPrint className="w-8 h-8 text-purple-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold truncate">{pet.name}</h3>
              {urgentAlerts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {urgentAlerts} alerta{urgentAlerts > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {pet.species === 'gato' ? 'Gato' :
               pet.species === 'cachorro' ? 'Cachorro' :
               pet.species || 'Pet'} • {pet.breed || 'SRD'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Idade</p>
                <p className="font-medium">{calculateAge(pet.birth_date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Peso</p>
                <p className="font-medium">{pet.weight ? `${pet.weight} kg` : "N/I"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Tutor */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Tutor</span>
          </div>
          <p className="text-sm font-medium">{ownerInfo?.name || 'Nome não informado'}</p>
          {ownerInfo?.email && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {ownerInfo.email}
            </p>
          )}
        </div>

        {/* Última Consulta */}
        {lastVisit && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Última consulta:</span> {format(new Date(lastVisit), "dd/MM/yyyy")}
          </div>
        )}

        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Saúde
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Agenda
            </Badge>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function VetPetsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pets, searchTerm, selectedSpecies, sortBy]);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      
      if (!userData || userData.user_type !== "veterinario") {
        window.location.href = createPageUrl("Welcome");
        return;
      }

      setUser(userData);
      await loadPets(userData);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      window.location.href = createPageUrl("Welcome");
    }
  };

  const loadPets = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar convites aceitos
      const acceptedInvites = await VetInvitation.filter({
        vet_email: userData.email,
        status: "aceito"
      }).catch(() => []);

      if (acceptedInvites.length === 0) {
        setPets([]);
        setFilteredPets([]);
        setLoading(false);
        return;
      }

      // 2. Extrair IDs dos pets
      const petIds = new Set();
      const ownerMap = new Map();

      acceptedInvites.forEach(invite => {
        if (invite.pets && Array.isArray(invite.pets)) {
          invite.pets.forEach(pet => {
            if (pet.pet_id) {
              petIds.add(pet.pet_id);
              ownerMap.set(pet.pet_id, {
                name: invite.pet_owner_name,
                email: invite.pet_owner_email
              });
            }
          });
        }
      });

      const petIdsArray = Array.from(petIds);

      // 3. Buscar dados completos dos pets
      const allPets = await Pet.list();
      const petsData = allPets.filter(pet => petIdsArray.includes(pet.id));

      // 4. Enriquecer dados dos pets com informações adicionais
      const enrichedPets = await Promise.all(
        petsData.map(async (pet) => {
          try {
            // Buscar última consulta
            const events = await Event.filter({ pet_id: pet.id }).catch(() => []);
            const consultations = events.filter(e => e.type === "consulta" && e.status === "concluido");
            const lastVisit = consultations.length > 0 
              ? consultations.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
              : null;

            // Verificar alertas urgentes
            let urgentAlerts = 0;

            // Verificar vacinas próximas
            const vaccines = await VaccinationRecord.filter({ pet_id: pet.id }).catch(() => []);
            const urgentVaccines = vaccines.filter(v => {
              if (!v.next_date) return false;
              const daysUntil = differenceInDays(new Date(v.next_date), new Date());
              return daysUntil >= 0 && daysUntil <= 7;
            });
            urgentAlerts += urgentVaccines.length;

            // Verificar medicamentos contínuos
            const medications = await MedicationRecord.filter({ pet_id: pet.id }).catch(() => []);
            const continuousMeds = medications.filter(m => m.is_continuous);
            if (continuousMeds.length > 0) {
              // Lógica adicional para verificar se há registros recentes
              // Por simplicidade, não adicionamos alertas aqui
            }

            return {
              ...pet,
              ownerInfo: ownerMap.get(pet.id),
              lastVisit,
              urgentAlerts
            };
          } catch (err) {
            console.warn(`Erro ao enriquecer dados do pet ${pet.id}:`, err);
            return {
              ...pet,
              ownerInfo: ownerMap.get(pet.id),
              lastVisit: null,
              urgentAlerts: 0
            };
          }
        })
      );

      setPets(enrichedPets);

    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      setError("Erro ao carregar lista de pacientes");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...pets];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.ownerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por espécie
    if (selectedSpecies !== "all") {
      filtered = filtered.filter(pet => pet.species === selectedSpecies);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "species":
          return (a.species || "").localeCompare(b.species || "");
        case "owner":
          return (a.ownerInfo?.name || "").localeCompare(b.ownerInfo?.name || "");
        case "alerts":
          return b.urgentAlerts - a.urgentAlerts;
        case "lastVisit":
          if (!a.lastVisit && !b.lastVisit) return 0;
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit) - new Date(a.lastVisit);
        default:
          return 0;
      }
    });

    setFilteredPets(filtered);
  };

  const handlePetClick = (pet) => {
    // Navegar para página de detalhes do pet ou abrir modal
    console.log("Ver detalhes do pet:", pet.name);
    // Por enquanto, apenas log - implementar navegação específica depois
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecies("all");
    setSortBy("name");
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Carregando pacientes...</p>
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
          onClick={() => loadPets(user)}
          className="bg-purple-700 hover:bg-purple-800"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PawPrint className="w-7 h-7 text-purple-600" />
            Meus Pacientes
          </h1>
          <p className="text-gray-600">
            {filteredPets.length} {filteredPets.length === 1 ? 'paciente' : 'pacientes'}
            {pets.length !== filteredPets.length && ` (de ${pets.length} total)`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome do pet, raça ou tutor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtros Expandidos */}
      {showFilters && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Espécie</label>
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="all">Todas as espécies</option>
                  <option value="cachorro">Cachorro</option>
                  <option value="gato">Gato</option>
                  <option value="roedor">Roedor</option>
                  <option value="ave">Ave</option>
                  <option value="reptil">Réptil</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="name">Nome do pet</option>
                  <option value="species">Espécie</option>
                  <option value="owner">Nome do tutor</option>
                  <option value="alerts">Alertas urgentes</option>
                  <option value="lastVisit">Última consulta</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Pacientes */}
      {pets.length === 0 ? (
        <div className="text-center py-16">
          <PawPrint className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Nenhum paciente ainda</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Você ainda não possui pacientes vinculados. Os tutores podem te convidar através do app.
          </p>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Nenhum resultado encontrado</h3>
          <p className="text-gray-600 mb-6">
            Não encontramos pacientes que correspondam aos filtros aplicados.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              ownerInfo={pet.ownerInfo}
              lastVisit={pet.lastVisit}
              urgentAlerts={pet.urgentAlerts}
              onClick={handlePetClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}