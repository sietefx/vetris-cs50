
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { VetInvitation } from "@/api/entities";
import { Appointment } from "@/api/entities/Appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Plus, Calendar as CalendarIcon, X, CheckCircle, Bell, PlusCircle, PawPrint, RefreshCw } from "lucide-react";
import { format, isSameDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPet, setSelectedPet] = useState("");
  const [user, setUser] = useState(null);
  const [newEvent, setNewEvent] = useState({
    type: "consulta",
    title: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: "",
    status: "pendente"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [Calendar] Iniciando carregamento de dados...');

      const userData = await User.me();
      if (!userData) {
        console.log('❌ [Calendar] Usuário não encontrado, redirecionando para Welcome.');
        window.location.href = createPageUrl("Welcome");
        return;
      }

      setUser(userData);
      console.log('👤 [Calendar] Usuário carregado:', userData.user_type);

      let petsData = [];

      if (userData.user_type === "veterinario") {
        // Para veterinários - carregar pets através de convites aceitos
        try {
          console.log('🐾 [Calendar] Carregando pets para veterinário...');
          
          const invitations = await VetInvitation.filter({
            vet_email: userData.email,
            status: "aceito"
          }).catch(err => {
            console.warn('⚠️ [Calendar] Erro ao carregar convites:', err);
            return [];
          });

          console.log('📋 [Calendar] Convites aceitos encontrados:', invitations.length);

          const petIds = new Set();
          invitations.forEach(invite => {
            if (invite.pets && Array.isArray(invite.pets)) {
              invite.pets.forEach(pet => {
                if (pet.pet_id) petIds.add(pet.pet_id);
              });
            }
          });

          console.log('🎯 [Calendar] Pet IDs únicos:', [...petIds]);

          // Carregar dados dos pets com fallback robusto
          for (const petId of petIds) {
            try {
              const pet = await Pet.get(petId).catch(async (err) => {
                console.warn(`⚠️ [Calendar] Pet.get(${petId}) falhou, tentando Pet.list:`, err);
                try {
                  const allPets = await Pet.list();
                  return allPets.find(p => p.id === petId);
                } catch (listErr) {
                  console.warn(`⚠️ [Calendar] Pet.list também falhou:`, listErr);
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
                console.log('✅ [Calendar] Pet carregado:', pet.name, 'Tutor:', pet.owner_name);
              }
            } catch (err) {
              console.warn(`❌ [Calendar] Falha ao carregar pet ${petId}:`, err);
            }
          }
        } catch (error) {
          console.error("❌ [Calendar] Erro ao carregar pets do veterinário:", error);
          petsData = [];
        }
      } else {
        // Para tutores - carregar pets próprios com fallback robusto
        try {
          console.log('🐾 [Calendar] Carregando pets para tutor...');
          
          petsData = await Pet.filter({ created_by: userData.email }).catch(async (err) => {
            console.warn('⚠️ [Calendar] Pet.filter falhou, tentando Pet.list:', err);
            try {
              const allPets = await Pet.list();
              return allPets.filter(pet => pet.created_by === userData.email);
            } catch (listErr) {
              console.warn('⚠️ [Calendar] Pet.list também falhou:', listErr);
              return [];
            }
          });
        } catch (error) {
          console.error("❌ [Calendar] Erro ao carregar pets do tutor:", error);
          petsData = [];
        }
      }

      console.log('📊 [Calendar] Total de pets carregados:', petsData.length);
      setPets(petsData);

      if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0].id);
        console.log('🎯 [Calendar] Pet selecionado:', petsData[0].name);
      }

      // Carregar eventos com múltiplas estratégias de fallback
      let eventsData = [];
      if (petsData.length > 0) {
        try {
          console.log('📅 [Calendar] Carregando eventos...');
          const petIds = petsData.map(pet => pet.id);
          
          // ESTRATÉGIA 1: Event.list (mais confiável)
          eventsData = await Event.list().then(allEvents => {
            return allEvents.filter(event => petIds.includes(event.pet_id));
          }).catch(async (err) => {
            console.warn('⚠️ [Calendar] Event.list falhou, tentando Event.filter para cada pet:', err);
            
            // ESTRATÉGIA 2: Event.filter para cada pet
            const eventPromises = petIds.map(petId => 
              Event.filter({ pet_id: petId }).catch(err => {
                console.warn(`⚠️ [Calendar] Event.filter para pet ${petId} falhou:`, err);
                return [];
              })
            );
            
            const eventResults = await Promise.allSettled(eventPromises);
            const events = [];
            eventResults.forEach(result => {
              if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                events.push(...result.value);
              }
            });
            
            return events;
          });

        } catch (error) {
          console.error("❌ [Calendar] Erro ao carregar eventos:", error);
          eventsData = [];
        }
      }

      console.log('📊 [Calendar] Total de eventos carregados:', eventsData.length);
      setEvents(eventsData);

    } catch (err) {
      console.error("❌ [Calendar] Erro geral no carregamento:", err);
      setError("Não foi possível carregar os dados. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePetChange = async (value) => {
    setSelectedPet(value);
    
    if (!value) {
      // Mostrar todos os eventos
      const petIds = pets.map(pet => pet.id);
      try {
        const allEvents = await Event.list().catch(() => []);
        const filteredEvents = allEvents.filter(event => petIds.includes(event.pet_id));
        setEvents(filteredEvents);
      } catch (error) {
        console.warn("❌ [Calendar] Erro ao filtrar eventos (todos):", error);
      }
      return;
    }

    // Filtrar eventos do pet selecionado com fallback
    try {
      const filteredEvents = await Event.filter({ pet_id: value }).catch(async (err) => {
        console.warn('⚠️ [Calendar] Event.filter falhou para o pet selecionado, usando Event.list:', err);
        try {
          const allEvents = await Event.list();
          return allEvents.filter(event => event.pet_id === value);
        } catch (listErr) {
          console.warn('⚠️ [Calendar] Event.list também falhou ao filtrar:', listErr);
          return [];
        }
      });
      
      setEvents(filteredEvents);
    } catch (error) {
      console.error("❌ [Calendar] Erro ao filtrar eventos por pet:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      setError("Selecione um pet para criar o evento");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('💾 [Calendar] Salvando novo evento:', newEvent.title);

      await Event.create({
        ...newEvent,
        pet_id: selectedPet
      });

      setIsAdding(false);
      setNewEvent({
        type: "consulta",
        title: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        notes: "",
        status: "pendente"
      });

      console.log('✅ [Calendar] Evento criado com sucesso');
      await loadData();
    } catch (err) {
      console.error("❌ [Calendar] Erro ao criar evento:", err);
      setError("Não foi possível criar o evento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      console.log('🔄 [Calendar] Atualizando status do evento:', eventId, 'para:', newStatus);
      await Event.update(eventId, { status: newStatus });
      await loadData();
    } catch (err) {
      console.error("❌ [Calendar] Erro ao atualizar status:", err);
      setError("Não foi possível atualizar o status. Tente novamente.");
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;

    try {
      console.log('🗑️ [Calendar] Excluindo evento:', eventId);
      await Event.delete(eventId);
      await loadData();
    } catch (err) {
      console.error("❌ [Calendar] Erro ao excluir evento:", err);
      setError("Não foi possível excluir o evento. Tente novamente.");
    }
  };

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : "Pet não encontrado";
  };

  const formatEventDateTime = (date) => {
    try {
      return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <p className="mt-4 text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Evento
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
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

      {pets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum pet encontrado</h2>
            <p className="text-gray-600 mb-4">
              {user?.user_type === "veterinario" 
                ? "Você ainda não tem pets vinculados por tutores. Peça aos tutores para te convidarem!"
                : "Adicione um pet para começar a agendar eventos."
              }
            </p>
            {user?.user_type !== "veterinario" && (
              <Link to={createPageUrl("AddPet")}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pet
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <Label htmlFor="pet-filter">Filtrar por Pet</Label>
            <Select
              value={selectedPet || ""} // Ensure value is controlled; null becomes empty string for Select
              onValueChange={handlePetChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos os pets</SelectItem> {/* Use empty string for "Todos os pets" */}
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

          {isAdding && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Novo Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="event-pet">Pet</Label>
                    <Select
                      value={selectedPet}
                      onValueChange={setSelectedPet}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o pet" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.map(pet => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="event-type">Tipo</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="banho">Banho</SelectItem>
                        <SelectItem value="tosa">Tosa</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="event-title">Título</Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Consulta de rotina"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-date">Data e Hora</Label>
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-notes">Observações</Label>
                    <Textarea
                      id="event-notes"
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                      Salvar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h2>
                  <p className="text-gray-600">
                    Clique em "Novo Evento" para adicionar um evento à agenda
                  </p>
                </CardContent>
              </Card>
            ) : (
              ["pendente", "concluido", "cancelado"].map(statusFilter => {
                const filteredEvents = events.filter(event => event.status === statusFilter);
                if (filteredEvents.length === 0) return null;

                return (
                  <div key={statusFilter}>
                    <h2 className="font-semibold text-lg mb-3 capitalize">
                      {statusFilter === "pendente" && "Pendentes"}
                      {statusFilter === "concluido" && "Concluídos"}
                      {statusFilter === "cancelado" && "Cancelados"}
                    </h2>
                    <div className="space-y-3">
                      {filteredEvents.map(event => {
                        const isToday = isSameDay(new Date(event.date), new Date());

                        return (
                          <Card key={event.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className="flex-shrink-0">
                                      {event.type === "consulta" && "Consulta"}
                                      {event.type === "banho" && "Banho"}
                                      {event.type === "tosa" && "Tosa"}
                                      {event.type === "outro" && "Outro"}
                                    </Badge>
                                    {isToday && (
                                      <Badge variant="destructive" className="flex-shrink-0">Hoje</Badge>
                                    )}
                                  </div>

                                  <h3 className="font-semibold text-lg mb-2 break-words">{event.title}</h3>

                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                                      {formatEventDateTime(event.date)}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <PawPrint className="w-4 h-4 flex-shrink-0" />
                                      Pet: {getPetName(event.pet_id)}
                                    </p>
                                  </div>

                                  {event.notes && (
                                    <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                                      {event.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col gap-2 flex-shrink-0">
                                  {event.status === "pendente" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 w-full min-w-[90px]"
                                        onClick={() => handleStatusChange(event.id, "concluido")}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Concluir
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full min-w-[90px]"
                                        onClick={() => handleStatusChange(event.id, "cancelado")}
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancelar
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 w-full min-w-[90px]"
                                    onClick={() => handleDelete(event.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
