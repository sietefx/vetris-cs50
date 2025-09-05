import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Plus, X, FileUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function VetVisitForm({ pet_id, vetVisit, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(vetVisit || {
    pet_id,
    date: format(new Date(), "yyyy-MM-dd"),
    vet_name: "",
    clinic_name: "",
    reason: "",
    diagnosis: "",
    symptoms: [],
    treatments: [],
    prescription: "",
    prescription_url: "",
    lab_results_url: "",
    cost: "",
    follow_up_date: "",
    reminder_enabled: true,
    notes: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [symptom, setSymptom] = useState("");
  const [treatment, setTreatment] = useState("");
  
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
  
  const addSymptom = () => {
    if (!symptom.trim()) return;
    
    if (!formData.symptoms.includes(symptom)) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom]
      }));
    }
    
    setSymptom("");
  };
  
  const removeSymptom = (item) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== item)
    }));
  };
  
  const addTreatment = () => {
    if (!treatment.trim()) return;
    
    if (!formData.treatments.includes(treatment)) {
      setFormData(prev => ({
        ...prev,
        treatments: [...prev.treatments, treatment]
      }));
    }
    
    setTreatment("");
  };
  
  const removeTreatment = (item) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.filter(t => t !== item)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = "A data da consulta é obrigatória";
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = "O motivo da consulta é obrigatório";
    }
    
    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      newErrors.cost = "O valor deve ser um número";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Formatar o custo para número se estiver preenchido
    const dataToSubmit = { 
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : null
    };
    
    setLoading(true);
    
    try {
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Erro ao salvar consulta:", error);
      setErrors({ submit: "Ocorreu um erro ao salvar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'symptom') {
        addSymptom();
      } else if (field === 'treatment') {
        addTreatment();
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data da Consulta<span className="text-red-500">*</span></Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            max={format(new Date(), "yyyy-MM-dd")}
            className={errors.date ? "border-red-500" : ""}
          />
          {errors.date && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.date}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo da Consulta<span className="text-red-500">*</span></Label>
          <Input
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Ex: Check-up anual, Vacinas, Problema específico"
            className={errors.reason ? "border-red-500" : ""}
          />
          {errors.reason && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.reason}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vet_name">Veterinário</Label>
          <Input
            id="vet_name"
            name="vet_name"
            value={formData.vet_name || ""}
            onChange={handleChange}
            placeholder="Nome do veterinário"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clinic_name">Clínica/Hospital</Label>
          <Input
            id="clinic_name"
            name="clinic_name"
            value={formData.clinic_name || ""}
            onChange={handleChange}
            placeholder="Nome da clínica"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnóstico</Label>
        <Input
          id="diagnosis"
          name="diagnosis"
          value={formData.diagnosis || ""}
          onChange={handleChange}
          placeholder="Diagnóstico do veterinário"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Sintomas Observados</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.symptoms.map((item, index) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1 text-gray-500 hover:text-red-500"
                onClick={() => removeSymptom(item)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="Adicionar sintoma"
            onKeyPress={(e) => handleKeyPress(e, 'symptom')}
          />
          <Button 
            type="button"
            variant="outline"
            onClick={addSymptom}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Tratamentos Recomendados</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.treatments.map((item, index) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1 text-gray-500 hover:text-red-500"
                onClick={() => removeTreatment(item)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            placeholder="Adicionar tratamento"
            onKeyPress={(e) => handleKeyPress(e, 'treatment')}
          />
          <Button 
            type="button"
            variant="outline"
            onClick={addTreatment}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="prescription">Prescrição</Label>
        <Textarea
          id="prescription"
          name="prescription"
          value={formData.prescription || ""}
          onChange={handleChange}
          placeholder="Detalhes da prescrição (medicamentos, dosagens, etc.)"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost">Custo da Consulta (R$)</Label>
          <Input
            id="cost"
            name="cost"
            type="text"
            inputMode="decimal"
            value={formData.cost || ""}
            onChange={handleChange}
            placeholder="Valor em R$"
            className={errors.cost ? "border-red-500" : ""}
          />
          {errors.cost && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.cost}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="follow_up_date">Data de Retorno</Label>
          <Input
            id="follow_up_date"
            name="follow_up_date"
            type="date"
            value={formData.follow_up_date || ""}
            onChange={handleChange}
            min={format(new Date(), "yyyy-MM-dd")}
          />
          
          {formData.follow_up_date && (
            <div className="flex items-center mt-1">
              <Switch
                id="reminder_switch"
                checked={formData.reminder_enabled}
                onCheckedChange={(checked) => handleSwitchChange("reminder_enabled", checked)}
                className="mr-2"
              />
              <Label htmlFor="reminder_switch" className="text-sm">
                Lembrar da consulta de retorno
              </Label>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Informações adicionais sobre esta consulta"
          rows={3}
        />
      </div>
      
      {/* Botões para upload (em uma implementação completa seria integrado com um serviço de upload) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Receita Médica</Label>
          <Button type="button" variant="outline" className="w-full">
            <FileUp className="mr-2 h-4 w-4" /> Anexar Receita
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>Resultados de Exames</Label>
          <Button type="button" variant="outline" className="w-full">
            <FileUp className="mr-2 h-4 w-4" /> Anexar Exames
          </Button>
        </div>
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
          ) : vetVisit ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}