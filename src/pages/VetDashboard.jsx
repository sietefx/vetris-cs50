import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Pet } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Event } from "@/api/entities";
import { Record } from "@/api/entities";
import { VaccinationRecord } from "@/api/entities";
import { MedicationRecord } from "@/api/entities";
import { HealthLog } from "@/api/entities";
import { Reminder } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope, Calendar, PawPrint, Users, Plus,
  Heart, Activity, Bell, BookOpen, TrendingUp,
  AlertTriangle, RefreshCw, ChevronRight, Mail,
  Phone, MapPin, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";

export default function VetDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    upcomingAppointments: 0,
    pendingInvites: 0,
    todayAppointments: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      
      if (!userData) {
        window.location.href = createPageUrl("Welcome");
        return;
      }

      if (userData.user_type !== "veterinario") {
        window.location.href = createPageUrl("Home");
        return;
      }

      setUser(userData);
      await loadDashboardData(userData);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      window.location.href = createPageUrl("Welcome");
    }
  };

  const loadDashboardData = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar convites aceitos (pacientes vinculados)
      const acceptedInvites = await VetInvitation.filter({
        vet_email: userData.email,
        status: "aceito"
      }).catch(() => []);

      // 2. Buscar convites pendentes
      const pendingInvitesData = await VetInvitation.filter({
        vet_email: userData.email,
        status: "pendente"
      }).catch(() => []);

      setPendingInvites(pendingInvitesData);

      // 3. Extrair IDs únicos dos pets
      const petIds = new Set();
      acceptedInvites.forEach(invite => {
        if (invite.pets && Array.isArray(invite.pets)) {
          invite.pets.forEach(pet => {
            if (pet.pet_id) {
              petIds.add(pet.pet_id);
            }
          });
        }
      });

      const petIdsArray = Array.from(petIds);

      // 4. Buscar dados dos pets
      const petsData = [];
      if (petIdsArray.length > 0) {
        try {
          const allPets = await Pet.list();
          const filteredPets = allPets.filter(pet => petIdsArray.includes(pet.id));
          petsData.push(...filteredPets);
        } catch (err) {
          console.warn("Erro ao carregar pets:", err);
        }
      }

      // 5. Buscar eventos próximos para todos os pets
      const allUpcomingEvents = [];
      if (petIdsArray.length > 0) {
        try {
          const allEvents = await Event.list();
          const now = new Date();
          const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

          const relevantEvents = allEvents.filter(event => {
            if (!event.pet_id || !petIdsArray.includes(event.pet_id)) return false;
            if (!event.date || event.status === "concluido") return false;

            try {
              const eventDate = new Date(event.date);
              return !isNaN(eventDate.getTime()) && 
                     eventDate >= now && 
                     eventDate <= sevenDaysFromNow;
            } catch {
              return false;
            }
          });

          // Enriquecer eventos com dados do pet
          relevantEvents.forEach(event => {
            const pet = petsData.find(p => p.id === event.pet_id);
            if (pet) {
              event.pet_name = pet.name;
              event.pet_species = pet.species;
              
              // Encontrar tutor
              const invitation = acceptedInvites.find(inv => 
                inv.pets && inv.pets.some(p => p.pet_id === pet.id)
              );
              if (invitation) {
                event.owner_name = invitation.pet_owner_name;
                event.owner_email = invitation.pet_owner_email;
              }
            }
          });

          allUpcomingEvents.push(...relevantEvents);
        } catch (err) {
          console.warn("Erro ao carregar eventos:", err);
        }
      }

      // 6. Buscar alertas urgentes (vacinas vencendo, medicamentos, etc.)
      const alerts = [];
      if (petIdsArray.length > 0) {
        try {
          // Vacinas próximas do vencimento
          const allVaccines = await VaccinationRecord.list();
          const urgentVaccines = allVaccines.filter(vaccine => {
            if (!vaccine.pet_id || !petIdsArray.includes(vaccine.pet_id)) return false;
            if (!vaccine.next_date) return false;
            
            try {
              const nextDate = new Date(vaccine.next_date);
              const daysUntil = differenceInDays(nextDate, new Date());
              return daysUntil >= 0 && daysUntil <= 7; // Próximos 7 dias
            } catch {
              return false;
            }
          });

          urgentVaccines.forEach(vaccine => {
            const pet = petsData.find(p => p.id === vaccine.pet_id);
            if (pet) {
              const daysUntil = differenceInDays(new Date(vaccine.next_date), new Date());
              alerts.push({
                type: "vaccine",
                message: `${pet.name} - Vacina ${vaccine.name} ${daysUntil === 0 ? 'hoje' : `em ${daysUntil} dias`}`,
                priority: daysUntil <= 3 ? "high" : "medium",
                pet_id: pet.id,
                pet_name: pet.name
              });
            }
          });

          // Medicamentos contínuos sem registros recentes
          const allMedications = await MedicationRecord.list();
          const continuousMeds = allMedications.filter(med => 
            med.is_continuous && 
            petIdsArray.includes(med.pet_id)
          );

          // Adicionar mais alertas conforme necessário...
        } catch (err) {
          console.warn("Erro ao carregar alertas:", err);
        }
      }

      // 7. Calcular estatísticas
      const todayEvents = allUpcomingEvents.filter(event => 
        isToday(new Date(event.date))
      );

      setStats({
        totalPatients: petsData.length,
        upcomingAppointments: allUpcomingEvents.length,
        pendingInvites: pendingInvitesData.length,
        todayAppointments: todayEvents.length
      });

      // 8. Definir dados para exibição
      setRecentPatients(petsData.slice(0, 6)); // Últimos 6 pacientes
      setUpcomingEvents(allUpcomingEvents.slice(0, 5)); // Próximos 5 eventos
      setUrgentAlerts(alerts.slice(0, 3)); // Até 3 alertas urgentes

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getEventTimeText = (eventDate) => {
    if (isToday(eventDate)) {
      return `Hoje às ${format(eventDate, "HH:mm")}`;
    } else if (isTomorrow(eventDate)) {
      return `Amanhã às ${format(eventDate, "HH:mm")}`;
    } else {
      return format(eventDate, "dd/MM 'às' HH:mm");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
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
          onClick={() => loadDashboardData(user)}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-purple-600" />
          Dashboard Veterinário
        </h1>
        <p className="text-gray-600">
          Bem-vindo, Dr(a). {user?.full_name?.split(' ')[0] || 'Veterinário'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Pacientes</p>
                <p className="text-2xl font-bold">{stats.totalPatients}</p>
              </div>
              <PawPrint className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Hoje</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Próximos</p>
                <p className="text-2xl font-bold">{stats.upcomingAppointments}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Convites</p>
                <p className="text-2xl font-bold">{stats.pendingInvites}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Alertas Urgentes e Pacientes */}
        <div className="space-y-6">
          {/* Alertas Urgentes */}
          {urgentAlerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Alertas Urgentes
                  <Badge variant="destructive" className="ml-auto">
                    {urgentAlerts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {urgentAlerts.map((alert, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                      }`}></div>
                      <p className="text-sm font-medium text-red-900">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Meus Pacientes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-purple-600" />
                  Meus Pacientes
                </div>
                <Link to={createPageUrl("VetPets")}>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPatients.length > 0 ? (
                <div className="space-y-3">
                  {recentPatients.map((pet) => (
                    <div key={pet.id} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{pet.name}</p>
                        <p className="text-xs text-gray-500">
                          {pet.species === 'gato' ? 'Gato' : 
                           pet.species === 'cachorro' ? 'Cachorro' : 
                           pet.species} • {pet.breed || 'SRD'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <PawPrint className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum paciente ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Agenda */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Próximos Eventos
                </div>
                <Link to={createPageUrl("Calendar")}>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver agenda
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    
                    return (
                      <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              event.type === "consulta" ? "bg-blue-500" :
                              event.type === "banho" ? "bg-green-500" :
                              event.type === "tosa" ? "bg-purple-500" :
                              "bg-gray-500"
                            }`}></div>
                            <span className="font-medium text-sm">{event.title}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {getEventTimeText(eventDate)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium">{event.pet_name}</p>
                          <p>Tutor: {event.owner_name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum evento próximo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna 3: Convites Pendentes */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Convites Pendentes
                {pendingInvites.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {pendingInvites.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingInvites.length > 0 ? (
                <div className="space-y-3">
                  {pendingInvites.slice(0, 3).map((invite) => (
                    <div key={invite.id} className="border rounded-lg p-3 bg-yellow-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{invite.pet_owner_name}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {invite.pet_owner_email}
                          </p>
                          {invite.pets && invite.pets.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Pets: {invite.pets.map(p => p.pet_name).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Enviado em {format(new Date(invite.invitation_date), "dd/MM/yyyy")}
                      </div>
                    </div>
                  ))}
                  {pendingInvites.length > 3 && (
                    <p className="text-center text-xs text-gray-500 pt-2">
                      +{pendingInvites.length - 3} convites pendentes
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum convite pendente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl("VetPets")} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <PawPrint className="w-4 h-4 mr-2" />
                  Ver Todos os Pacientes
                </Button>
              </Link>
              <Link to={createPageUrl("Calendar")} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Gerenciar Agenda
                </Button>
              </Link>
              <Link to={createPageUrl("VetProfile")} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Meu Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}