
import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Pet } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, Heart, Syringe, Pill, Scissors, Droplet } from "lucide-react";
import { formatInputDate, getCurrentDate } from "@/components/utils/dateUtils";

export default function EventForm({ onSuccess, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    date: initialData?.date ? formatInputDate(initialData.date) : getCurrentDate(),
    type: initialData?.type || "consulta",
    pet_id: "",
    location: "",
    notes: "",
    notification: true,
    notification_time: "1h",
    status: "pendente"
  });

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPets();
    if (initialData) {
      setFormData({
        ...initialData,
        date: formatInputDate(initialData.date)
      });
    }
  }, [initialData]);

  const loadPets = async () => {
    try {
      const userData = await User.me();
      const petsData = await Pet.filter({ created_by: userData.email });
      setPets(petsData);
      
      // Set first pet as default if no pet is selected
      if (petsData.length > 0 && !formData.pet_id) {
        setFormData(prev => ({ ...prev, pet_id: petsData[0].id }));
      }
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      setError("Não foi possível carregar seus pets. Por favor, tente novamente.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        date: formData.date,
      };

      console.log("Enviando dados do evento:", eventData);

      if (initialData?.id) {
        await Event.update(initialData.id, eventData);
      } else {
        await Event.create(eventData);
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      setError("Ocorreu um erro ao salvar o evento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "consulta":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "vacina":
        return <Syringe className="w-4 h-4 text-green-500" />;
      case "medicamento":
        return <Pill className="w-4 h-4 text-blue-500" />;
      case "tosa":
        return <Scissors className="w-4 h-4 text-purple-500" />;
      case "banho":
        return <Droplet className="w-4 h-4 text-cyan-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="pet">Pet</Label>
        <Select
          value={formData.pet_id}
          onValueChange={(value) => handleChange("pet_id", value)}
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
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consulta">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Consulta</span>
              </div>
            </SelectItem>
            <SelectItem value="vacina">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-green-500" />
                <span>Vacina</span>
              </div>
            </SelectItem>
            <SelectItem value="medicamento">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-500" />
                <span>Medicamento</span>
              </div>
            </SelectItem>
            <SelectItem value="tosa">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-500" />
                <span>Tosa</span>
              </div>
            </SelectItem>
            <SelectItem value="banho">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-500" />
                <span>Banho</span>
              </div>
            </SelectItem>
            <SelectItem value="outro">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Outro</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Ex: Consulta de rotina"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Data e Hora</Label>
        <Input
          id="date"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Ex: Clínica Veterinária"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Observações adicionais..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notification_time">Lembrete</Label>
        <Select
          value={formData.notification_time}
          onValueChange={(value) => handleChange("notification_time", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione quando avisar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30min">30 minutos antes</SelectItem>
            <SelectItem value="1h">1 hora antes</SelectItem>
            <SelectItem value="3h">3 horas antes</SelectItem>
            <SelectItem value="1d">1 dia antes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : (initialData ? "Atualizar" : "Agendar")}
        </Button>
      </div>
    </form>
  );
}
