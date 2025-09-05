
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { Reminder } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Bell, Calendar, Pill, Plus, Clock, AlertTriangle, ChevronLeft,
  MoreVertical, Check, X, Edit, Trash2, Calendar as CalendarIcon,
  CheckCircle2, AlertCircle, RefreshCw, ArrowRight, BellRing, PawPrint,
  PlusCircle, Syringe // Added Syringe for vaccine icon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isPast, isToday, parseISO, addDays, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReminderNotification from "@/components/reminders/ReminderNotification";

const renderEventIcon = (type) => {
  switch (type) {
    case "consulta":
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case "vacina":
      return <Calendar className="h-5 w-5 text-red-500" />;
    case "medicamento":
      return <Pill className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const DonationCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apoie Nosso Trabalho!</CardTitle>
        <CardDescription>
          Sua doação nos ajuda a manter este projeto funcionando e a cuidar ainda melhor dos pets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Considere fazer uma doação para apoiar o desenvolvimento e a manutenção deste aplicativo.
          Cada contribuição faz a diferença!
        </p>
        <Link to={createPageUrl("Donation")}>
          <Button className="mt-4 bg-green-600 hover:bg-green-700">Doar Agora</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default function RemindersPage() {
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const [editingReminder, setEditingReminder] = useState(null);
  const [user, setUser] = useState(null);
  const [reminderSettings, setReminderSettings] = useState({
    defaultNotificationTimes: ["1d", "1h"],
    enableNotifications: true,
    enableSound: true,
    emailNotifications: true,
    dailyReminderDigest: false
  });

  const [newReminder, setNewReminder] = useState({
    pet_id: "",
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "consulta",
    frequency: "once",
    status: "ativo",
    notification_time: ["1d", "1h"],
    is_recurring: false
  });

  useEffect(() => {
    loadData();
    loadUserSettings();
  }, []);

  useEffect(() => {
    if (reminders.length > 0 && !loading) {
      checkForDueReminders();
    }
  }, [reminders, loading]);

  useEffect(() => {
    if (pets.length > 0 && !newReminder.pet_id) {
      setNewReminder(prev => ({...prev, pet_id: pets[0].id}));
    } else if (pets.length === 0 && newReminder.pet_id) {
      setNewReminder(prev => ({...prev, pet_id: ""}));
    }
  }, [pets]);

  useEffect(() => {
    filterReminders();
  }, [selectedPet, activeTab, reminders]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showAddDialog) {
          setShowAddDialog(false);
          resetForm(); // Reset form when closing add/edit dialog via ESC
        }
        if (showSettingsDialog) {
          setShowSettingsDialog(false);
        }
      }
    };

    if (showAddDialog || showSettingsDialog) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAddDialog, showSettingsDialog]);

  const loadData = async () => {
    try {
      setLoading(true);

      const userData = await User.me();
      setUser(userData);

      const petsData = await Pet.filter({ created_by: userData.email });
      setPets(petsData);

      if (petsData.length > 0) {
        const petIds = petsData.map(pet => pet.id);
        const allReminders = await Reminder.list();
        const userReminders = allReminders.filter(reminder =>
          petIds.includes(reminder.pet_id)
        );
        setReminders(userReminders);
      } else {
        setReminders([]);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setPets([]);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      const currentUserData = user || await User.me();
      setUser(currentUserData);

      if (currentUserData.reminder_settings) {
        setReminderSettings(currentUserData.reminder_settings);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do usuário:", error);
    }
  };

  const saveUserSettings = async () => {
    try {
      await User.updateMyUserData({
        reminder_settings: reminderSettings
      });
      setShowSettingsDialog(false);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  };

  const filterReminders = () => {
    let filtered = [...reminders];

    if (selectedPet !== "all") {
      filtered = filtered.filter(r => r.pet_id === selectedPet);
    }

    if (activeTab === "active") {
      filtered = filtered.filter(r => r.status === "ativo");
    } else if (activeTab === "completed") {
      filtered = filtered.filter(r => r.status === "completado");
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter(r => r.status === "cancelado");
    }

    return filtered;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!newReminder.title || !newReminder.pet_id || !newReminder.date) {
      alert("Por favor, preencha todos os campos obrigatórios (Pet, Título e Data)");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Dados do lembrete a serem salvos:", newReminder);
      
      // Preparar dados para salvar, garantindo valores padrão para campos opcionais
      const reminderData = {
        pet_id: newReminder.pet_id,
        title: newReminder.title,
        description: newReminder.description || "", // Default to empty string if null/undefined
        date: newReminder.date,
        type: newReminder.type || "consulta", // Default type
        frequency: newReminder.frequency || "once", // Default frequency
        status: newReminder.status || "ativo", // Default status
        notification_time: newReminder.notification_time || reminderSettings.defaultNotificationTimes || ["1d", "1h"], // Default notification times
        is_recurring: newReminder.is_recurring || false // Default to false
      };
      
      if (editingReminder) {
        console.log("Atualizando lembrete ID:", editingReminder.id);
        await Reminder.update(editingReminder.id, reminderData);
        console.log("Lembrete atualizado com sucesso");
      } else {
        console.log("Criando novo lembrete");
        const createdReminder = await Reminder.create(reminderData);
        console.log("Lembrete criado com sucesso:", createdReminder);
      }
      
      setShowAddDialog(false);
      setEditingReminder(null); // Reset editing state
      resetForm(); // Reset form fields
      await loadData(); // Reload data to reflect changes
      
      // Sucesso
      alert(editingReminder ? "Lembrete atualizado com sucesso!" : "Lembrete criado com sucesso!");
      
    } catch (error) {
      console.error("Erro detalhado ao salvar lembrete:", error);
      alert(`Erro ao salvar lembrete: ${error.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewReminder({
      pet_id: pets.length > 0 ? pets[0].id : "",
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: "consulta",
      frequency: "once",
      status: "ativo",
      notification_time: reminderSettings.defaultNotificationTimes || ["1d", "1h"],
      is_recurring: false
    });
    setEditingReminder(null);
  };

  const editReminder = (reminder) => {
    setEditingReminder(reminder);
    setNewReminder({
      pet_id: reminder.pet_id,
      title: reminder.title,
      description: reminder.description || "",
      date: format(new Date(reminder.date), "yyyy-MM-dd'T'HH:mm"),
      type: reminder.type || "consulta", // Ensure default type
      frequency: reminder.frequency || "once", // Ensure default frequency
      status: reminder.status || "ativo", // Ensure default status
      notification_time: reminder.notification_time || reminderSettings.defaultNotificationTimes || ["1d", "1h"],
      is_recurring: reminder.is_recurring || false
    });
    setShowAddDialog(true);
  };

  const deleteReminder = async (id) => {
    if (confirm("Tem certeza que deseja excluir este lembrete?")) {
      try {
        await Reminder.delete(id);
        await loadData();
      } catch (error) {
        console.error("Erro ao excluir lembrete:", error);
        alert("Erro ao excluir lembrete. Tente novamente.");
      }
    }
  };

  const updateReminderStatus = async (id, newStatus) => {
    try {
      const reminderToUpdate = reminders.find(r => r.id === id);
      if (reminderToUpdate) {
        await Reminder.update(id, { ...reminderToUpdate, status: newStatus });
        await loadData();
      }
    } catch (error) {
      console.error("Erro ao atualizar status do lembrete:", error);
      alert("Erro ao atualizar status. Tente novamente.");
    }
  };

  const checkForDueReminders = () => {
    const now = new Date();
    const dueReminders = reminders.filter(reminder => {
      if (reminder.status !== "ativo") return false;

      const reminderDate = new Date(reminder.date);
      const diffInHours = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Mostrar notificação se o lembrete está próximo (até 24 horas)
      return diffInHours > 0 && diffInHours <= 24;
    });

    if (dueReminders.length > 0 && reminderSettings.enableNotifications) {
      const mostUrgent = dueReminders.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];

      const pet = pets.find(p => p.id === mostUrgent.pet_id);

      if (pet) {
        setNotificationData({
          reminder: mostUrgent,
          pet: pet
        });
        setShowNotification(true);
      }
    }
  };

  const closeNotification = () => {
    setShowNotification(false);
    setNotificationData(null);
  };

  const handleNotificationTimeChange = (time, checked) => {
    const currentTimes = newReminder.notification_time || [];
    
    if (checked) {
      // Adicionar se não existir
      if (!currentTimes.includes(time)) {
        const newTimes = [...currentTimes, time];
        setNewReminder(prev => ({
          ...prev,
          notification_time: newTimes.sort((a, b) => {
            const timeValues = {
              "no_momento": 0,
              "15min": 15,
              "30min": 30,
              "1h": 60,
              "3h": 180,
              "1d": 1440,
              "3d": 4320,
              "1w": 10080
            };
            return timeValues[a] - timeValues[b];
          })
        }));
      }
    } else {
      // Remover se existir
      const newTimes = currentTimes.filter(t => t !== time);
      setNewReminder(prev => ({
        ...prev,
        notification_time: newTimes
      }));
    }
  };

  const formatNotificationTime = (time) => {
    switch (time) {
      case "no_momento": return "No momento";
      case "15min": return "15 minutos antes";
      case "30min": return "30 minutos antes";
      case "1h": return "1 hora antes";
      case "3h": return "3 horas antes";
      case "1d": return "1 dia antes";
      case "3d": return "3 dias antes";
      case "1w": return "1 semana antes";
      default: return time;
    }
  };

  const renderReminderIcon = (type) => {
    switch (type) {
      case "consulta":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "vacina":
        return <Syringe className="h-5 w-5 text-red-500" />; // Changed to Syringe
      case "medicamento":
        return <Pill className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getReminderTypeLabel = (type) => {
    switch (type) {
      case "consulta": return "Consulta";
      case "vacina": return "Vacina";
      case "medicamento": return "Medicamento";
      default: return "Outro";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "completado":
        return "bg-blue-100 text-blue-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ativo": return "Ativo";
      case "completado": return "Completado";
      case "cancelado": return "Cancelado";
      default: return status;
    }
  };

  const isReminderOverdue = (reminder) => {
    return isPast(new Date(reminder.date)) && reminder.status === "ativo";
  };

  const isReminderToday = (reminder) => {
    return isToday(new Date(reminder.date));
  };

  const formatReminderDate = (date) => {
    const reminderDate = new Date(date);

    if (isToday(reminderDate)) {
      return `Hoje às ${format(reminderDate, "HH:mm")}`;
    }

    return format(reminderDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (loading && pets.length === 0 && reminders.length === 0) { // Only show full screen loading on initial load
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando lembretes...</p>
        </div>
      </div>
    );
  }

  if (pets.length === 0 && !loading) { // Show "no pets" message only after loading is complete
    return (
      <div className="p-4 max-w-4xl mx-auto pb-20 md:pb-6">
        <header className="flex items-center gap-2 mb-6">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Lembretes</h1>
        </header>

        <Card className="border border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <PawPrint className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium mb-2">Nenhum pet cadastrado</h3>
            <p className="text-gray-500 mb-6">
              Você precisa ter pelo menos um pet cadastrado para criar lembretes.
            </p>
            <Link to={createPageUrl("AddPet")}>
              <Button className="bg-purple-700 hover:bg-purple-800">
                <PlusCircle className="h-4 w-4 mr-2" />
                Cadastrar Pet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredReminders = filterReminders();

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20 md:pb-6">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl("Home")}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Lembretes</h1>
          </div>
          <p className="text-gray-600">Gerencie seus lembretes de saúde e cuidados</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center gap-2"
          >
            <BellRing className="h-4 w-4" />
            Configurações
          </Button>

          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-purple-700 hover:bg-purple-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lembrete
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-end">
        <div className="w-full md:w-1/3">
          <div className="flex flex-col">
            <Label htmlFor="pet-filter" className="mb-2">Filtrar por pet</Label>
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger id="pet-filter" className="w-full">
                <SelectValue placeholder="Selecione um pet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meus pets</SelectItem>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Ativos</span>
                {reminders.filter(r => r.status === "ativo").length > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {reminders.filter(r => r.status === "ativo").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredReminders.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Bell className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum lembrete encontrado</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === "active" ?
                "Você não tem lembretes ativos. Adicione um novo lembrete para acompanhar a saúde do seu pet." :
                activeTab === "completed" ?
                "Você não tem lembretes concluídos." :
                "Você não tem lembretes cancelados."
              }
            </p>
            {activeTab === "active" && (
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-purple-700 hover:bg-purple-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Lembrete
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Seção de lembretes próximos (próximas 24h) */}
          {activeTab === "active" && (
            <div className="mb-6">
              {(() => {
                const now = new Date();
                const upcomingReminders = filteredReminders.filter(r => {
                  const reminderDate = new Date(r.date);
                  const diffInHours = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                  return diffInHours > 0 && diffInHours <= 24;
                });

                if (upcomingReminders.length > 0) {
                  return (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                          <BellRing className="h-5 w-5" />
                          Lembretes Próximos (próximas 24h)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {upcomingReminders
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map(reminder => {
                            const pet = pets.find(p => p.id === reminder.pet_id);
                            const reminderDate = new Date(reminder.date);
                            const diffInHours = Math.ceil((reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60));

                            return (
                              <div key={reminder.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                  {renderReminderIcon(reminder.type)}
                                  <div>
                                    <h4 className="font-medium text-blue-900">{reminder.title}</h4>
                                    <p className="text-sm text-blue-700">
                                      {pet?.name} • {diffInHours <= 1 ? 'Em menos de 1 hora' : `Em ${diffInHours} horas`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {formatReminderDate(reminder.date)}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => editReminder(reminder)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "completado")}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Marcar como concluído
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })}
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {activeTab === "active" && filteredReminders.some(r => isReminderOverdue(r)) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5" />
                Lembretes Atrasados
              </h2>
              <div className="space-y-3">
                {filteredReminders
                  .filter(r => isReminderOverdue(r))
                  .map(reminder => (
                    <Card key={reminder.id} className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {renderReminderIcon(reminder.type)}
                            <div>
                              <h3 className="font-medium">{reminder.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-red-700 mt-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatReminderDate(reminder.date)}</span>
                                <Badge variant="outline" className="text-red-700 border-red-200">
                                  Atrasado
                                </Badge>
                              </div>
                              {reminder.description && (
                                <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => editReminder(reminder)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "completado")}>
                                <Check className="h-4 w-4 mr-2" />
                                Marcar como concluído
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "cancelado")}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => deleteReminder(reminder.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {pets.find(p => p.id === reminder.pet_id) && (
                          <div className="mt-3 pt-3 border-t border-red-200 flex items-center gap-2 text-sm text-red-700">
                            <PawPrint className="h-4 w-4" />
                            <span>{pets.find(p => p.id === reminder.pet_id)?.name}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "active" && filteredReminders.some(r => isReminderToday(r) && !isReminderOverdue(r)) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5" />
                Para Hoje
              </h2>
              <div className="space-y-3">
                {filteredReminders
                  .filter(r => isReminderToday(r) && !isReminderOverdue(r))
                  .map(reminder => (
                    <Card key={reminder.id} className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {renderReminderIcon(reminder.type)}
                            <div>
                              <h3 className="font-medium">{reminder.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(reminder.date), "'Hoje às' HH:mm")}</span>
                              </div>
                              {reminder.description && (
                                <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => editReminder(reminder)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "completado")}>
                                <Check className="h-4 w-4 mr-2" />
                                Marcar como concluído
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "cancelado")}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => deleteReminder(reminder.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {pets.find(p => p.id === reminder.pet_id) && (
                          <div className="mt-3 pt-3 border-t border-blue-200 flex items-center gap-2 text-sm text-blue-700">
                            <PawPrint className="h-4 w-4" />
                            <span>{pets.find(p => p.id === reminder.pet_id)?.name}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">
              {activeTab === "active" ?
                "Próximos Lembretes" :
                activeTab === "completed" ?
                "Lembretes Concluídos" :
                "Lembretes Cancelados"
              }
            </h2>
            <div className="space-y-3">
              {filteredReminders
                .filter(r => {
                  if (activeTab === "active") {
                    const reminderDate = new Date(r.date);
                    const now = new Date();
                    const diffInHours = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                    // Exclude overdue, today, and "upcoming 24h" reminders from this general list
                    return !isReminderOverdue(r) && !isReminderToday(r) && !(diffInHours > 0 && diffInHours <= 24);
                  }
                  return true;
                })
                .map(reminder => (
                  <Card key={reminder.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {renderReminderIcon(reminder.type)}
                          <div>
                            <h3 className="font-medium">{reminder.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatReminderDate(reminder.date)}</span>
                              <Badge className={getStatusBadgeClass(reminder.status)}>
                                {getStatusLabel(reminder.status)}
                              </Badge>
                              {reminder.is_recurring && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  Recorrente
                                </Badge>
                              )}
                            </div>
                            {reminder.description && (
                              <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editReminder(reminder)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {reminder.status === "ativo" && (
                              <>
                                <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "completado")}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Marcar como concluído
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "cancelado")}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}
                            {(reminder.status === "completado" || reminder.status === "cancelado") && (
                              <DropdownMenuItem onClick={() => updateReminderStatus(reminder.id, "ativo")}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Restaurar para ativo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteReminder(reminder.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {pets.find(p => p.id === reminder.pet_id) && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-gray-500">
                          <PawPrint className="h-4 w-4" />
                          <span>{pets.find(p => p.id === reminder.pet_id)?.name}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReminder ? "Editar Lembrete" : "Novo Lembrete"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pet_id">Pet *</Label>
              <Select
                value={newReminder.pet_id}
                onValueChange={(value) => {
                  console.log("Pet selecionado:", value); // Added console log
                  setNewReminder(prev => ({...prev, pet_id: value}));
                }}
                required
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={newReminder.title}
                onChange={(e) => {
                  console.log("Título alterado:", e.target.value); // Added console log
                  setNewReminder(prev => ({...prev, title: e.target.value}));
                }}
                placeholder="Ex: Consulta veterinária"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newReminder.type}
                onValueChange={(value) => setNewReminder(prev => ({...prev, type: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="vacina">Vacina</SelectItem>
                  <SelectItem value="medicamento">Medicamento</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data e Hora *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={newReminder.date}
                onChange={(e) => {
                  console.log("Data alterada:", e.target.value); // Added console log
                  setNewReminder(prev => ({...prev, date: e.target.value}));
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={newReminder.description}
                onChange={(e) => setNewReminder(prev => ({...prev, description: e.target.value}))}
                placeholder="Detalhes adicionais sobre o lembrete"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_recurring">Lembrete Recorrente</Label>
                <Switch
                  id="is_recurring"
                  checked={newReminder.is_recurring}
                  onCheckedChange={(checked) => setNewReminder({...newReminder, is_recurring: checked})}
                />
              </div>

              {newReminder.is_recurring && (
                <div className="pt-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select
                    value={newReminder.frequency}
                    onValueChange={(value) => setNewReminder({...newReminder, frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notificações</Label>
              <div className="border rounded-md p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "no_momento", label: "No momento" },
                    { value: "15min", label: "15 minutos antes" },
                    { value: "30min", label: "30 minutos antes" },
                    { value: "1h", label: "1 hora antes" },
                    { value: "3h", label: "3 horas antes" },
                    { value: "1d", label: "1 dia antes" },
                    { value: "3d", label: "3 dias antes" },
                    { value: "1w", label: "1 semana antes" }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`notify-${value}`}
                        checked={newReminder.notification_time?.includes(value) || false}
                        onCheckedChange={(checked) => handleNotificationTimeChange(value, checked)}
                      />
                      <Label htmlFor={`notify-${value}`} className="text-sm font-normal">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-700 hover:bg-purple-800"
                disabled={loading || !newReminder.title || !newReminder.pet_id || !newReminder.date}
              >
                {loading ? "Salvando..." : (editingReminder ? "Atualizar" : "Salvar")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações de Notificações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableNotifications" className="text-base">Ativar Notificações</Label>
                <Switch
                  id="enableNotifications"
                  checked={reminderSettings.enableNotifications}
                  onCheckedChange={(checked) => setReminderSettings({...reminderSettings, enableNotifications: checked})}
                />
              </div>
              <p className="text-sm text-gray-500">
                Receba alertas sobre seus lembretes no aplicativo
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableSound" className="text-base">Som de Notificação</Label>
                <Switch
                  id="enableSound"
                  checked={reminderSettings.enableSound}
                  onCheckedChange={(checked) => setReminderSettings({...reminderSettings, enableSound: checked})}
                  disabled={!reminderSettings.enableNotifications}
                />
              </div>
              <p className="text-sm text-gray-500">
                Reproduzir som ao receber notificações
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications" className="text-base">Notificações por Email</Label>
                <Switch
                  id="emailNotifications"
                  checked={reminderSettings.emailNotifications}
                  onCheckedChange={(checked) => setReminderSettings({...reminderSettings, emailNotifications: checked})}
                  disabled={!reminderSettings.enableNotifications}
                />
              </div>
              <p className="text-sm text-gray-500">
                Receba lembretes também por email
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="dailyReminderDigest" className="text-base">Resumo Diário</Label>
                <Switch
                  id="dailyReminderDigest"
                  checked={reminderSettings.dailyReminderDigest}
                  onCheckedChange={(checked) => setReminderSettings({...reminderSettings, dailyReminderDigest: checked})}
                  disabled={!reminderSettings.enableNotifications}
                />
              </div>
              <p className="text-sm text-gray-500">
                Receba um resumo diário dos próximos lembretes
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Notificações Padrão</Label>
              <p className="text-sm text-gray-500">
                Defina quais notificações serão selecionadas por padrão ao criar novos lembretes
              </p>
              <div className="border rounded-md p-3 space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="default-moment"
                      checked={reminderSettings.defaultNotificationTimes?.includes("no_momento")}
                      onCheckedChange={(checked) => {
                        const times = [...(reminderSettings.defaultNotificationTimes || [])];
                        if (checked) {
                          if (!times.includes("no_momento")) times.push("no_momento");
                        } else {
                          const index = times.indexOf("no_momento");
                          if (index !== -1) times.splice(index, 1);
                        }
                        setReminderSettings({...reminderSettings, defaultNotificationTimes: times});
                      }}
                    />
                    <Label htmlFor="default-moment" className="text-sm font-normal">No momento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="default-1h"
                      checked={reminderSettings.defaultNotificationTimes?.includes("1h")}
                      onCheckedChange={(checked) => {
                        const times = [...(reminderSettings.defaultNotificationTimes || [])];
                        if (checked) {
                          if (!times.includes("1h")) times.push("1h");
                        } else {
                          const index = times.indexOf("1h");
                          if (index !== -1) times.splice(index, 1);
                        }
                        setReminderSettings({...reminderSettings, defaultNotificationTimes: times});
                      }}
                    />
                    <Label htmlFor="default-1h" className="text-sm font-normal">1 hora antes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="default-1d"
                      checked={reminderSettings.defaultNotificationTimes?.includes("1d")}
                      onCheckedChange={(checked) => {
                        const times = [...(reminderSettings.defaultNotificationTimes || [])];
                        if (checked) {
                          if (!times.includes("1d")) times.push("1d");
                        } else {
                          const index = times.indexOf("1d");
                          if (index !== -1) times.splice(index, 1);
                        }
                        setReminderSettings({...reminderSettings, defaultNotificationTimes: times});
                      }}
                    />
                    <Label htmlFor="default-1d" className="text-sm font-normal">1 dia antes</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSettingsDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveUserSettings}
                className="bg-purple-700 hover:bg-purple-800"
              >
                Salvar Configurações
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {showNotification && notificationData && (
        <ReminderNotification
          reminder={notificationData.reminder}
          pet={notificationData.pet}
          onClose={closeNotification}
          onComplete={() => {
            updateReminderStatus(notificationData.reminder.id, "completado");
            closeNotification();
          }}
        />
      )}

      <div className="mt-10">
        <DonationCard />
      </div>
    </div>
  );
}
