import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MedicationForm({ pet_id, medication, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(medication || {
    pet_id,
    name: "",
    dosage: "",
    frequency: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    is_continuous: false,
    prescription_url: "",
    prescribed_by: "",
    reason: "",
    reminder_enabled: true,
    reminder_times: ["08:00", "20:00"],
    notes: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState("");
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const addReminderTime = () => {
    if (!newReminderTime) return;
    
    if (!formData.reminder_times.includes(newReminderTime)) {
      setFormData(prev => ({
        ...prev,
        reminder_times: [...prev.reminder_times, newReminderTime].sort()
      }));
    }
    
    setNewReminderTime("");
  };
  
  const removeReminderTime = (time) => {
    setFormData(prev => ({
      ...prev,
      reminder_times: prev.reminder_times.filter(t => t !== time)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "O nome do medicamento é obrigatório";
    }
    
    if (!formData.dosage.trim()) {
      newErrors.dosage = "A dosagem é obrigatória";
    }
    
    if (!formData.frequency.trim()) {
      newErrors.frequency = "A frequência é obrigatória";
    }
    
    if (!formData.start_date) {
      newErrors.start_date = "A data de início é obrigatória";
    }
    
    if (formData.reminder_enabled && (!formData.reminder_times || formData.reminder_times.length === 0)) {
      newErrors.reminder_times = "Adicione pelo menos um horário para lembrete";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao salvar medicamento:", error);
      setErrors({ submit: "Ocorreu um erro ao salvar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Medicamento<span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Amoxicilina"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> {errors.name}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosagem<span className="text-red-500">*</span></Label>
          <Input
            id="dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            placeholder="Ex: 10mg, 1 comprimido"
            className={errors.dosage ? "border-red-500" : ""}
          />
          {errors.dosage && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.dosage}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequência<span className="text-red-500">*</span></Label>
          <Input
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            placeholder="Ex: 2x ao dia, a cada 8h"
            className={errors.frequency ? "border-red-500" : ""}
          />
          {errors.frequency && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.frequency}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Data de Início<span className="text-red-500">*</span></Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            className={errors.start_date ? "border-red-500" : ""}
          />
          {errors.start_date && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.start_date}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="end_date">Data de Término</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="is_continuous" className="text-sm">Uso contínuo?</Label>
              <Switch
                id="is_continuous"
                checked={formData.is_continuous}
                onCheckedChange={(checked) => handleSwitchChange("is_continuous", checked)}
              />
            </div>
          </div>
          
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date || ""}
            onChange={handleChange}
            min={formData.start_date}
            disabled={formData.is_continuous}
            className={formData.is_continuous ? "opacity-50" : ""}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prescribed_by">Prescrito por</Label>
          <Input
            id="prescribed_by"
            name="prescribed_by"
            value={formData.prescribed_by || ""}
            onChange={handleChange}
            placeholder="Nome do veterinário"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo/Condição</Label>
          <Input
            id="reason"
            name="reason"
            value={formData.reason || ""}
            onChange={handleChange}
            placeholder="Motivo da medicação"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder_switch" className="cursor-pointer">Ativar Lembretes</Label>
          <Switch
            id="reminder_switch"
            checked={formData.reminder_enabled}
            onCheckedChange={(checked) => handleSwitchChange("reminder_enabled", checked)}
          />
        </div>
        
        {formData.reminder_enabled && (
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.reminder_times.map((time) => (
                <div key={time} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm">{time}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1 text-gray-500 hover:text-red-500"
                    onClick={() => removeReminderTime(time)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="w-32"
              />
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={addReminderTime}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            
            {errors.reminder_times && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.reminder_times}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Informações adicionais sobre este medicamento"
          rows={3}
        />
      </div>
      
      {errors.submit && (
        <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm">
          {errors.submit}
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : medication ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}