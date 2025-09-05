import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HealthConditionForm({ pet_id, condition, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(condition || {
    pet_id,
    name: "",
    diagnosis_date: format(new Date(), "yyyy-MM-dd"),
    diagnosed_by: "",
    type: "cronica",
    severity: "moderada",
    description: "",
    symptoms: [],
    triggers: [],
    management_plan: "",
    is_active: true,
    resolution_date: "",
    notes: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [symptom, setSymptom] = useState("");
  const [trigger, setTrigger] = useState("");
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSelectChange = (name, value) => {
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
  
  const addTrigger = () => {
    if (!trigger.trim()) return;
    
    if (!formData.triggers.includes(trigger)) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, trigger]
      }));
    }
    
    setTrigger("");
  };
  
  const removeTrigger = (item) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== item)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "O nome da condição é obrigatório";
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
      console.error("Erro ao salvar condição de saúde:", error);
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
      } else if (field === 'trigger') {
        addTrigger();
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Condição<span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Diabetes, Alergias, Artrite"
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
          <Label htmlFor="diagnosis_date">Data do Diagnóstico</Label>
          <Input
            id="diagnosis_date"
            name="diagnosis_date"
            type="date"
            value={formData.diagnosis_date || ""}
            onChange={handleChange}
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="diagnosed_by">Diagnosticado por</Label>
          <Input
            id="diagnosed_by"
            name="diagnosed_by"
            value={formData.diagnosed_by || ""}
            onChange={handleChange}
            placeholder="Nome do veterinário"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo da Condição</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange("type", value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cronica">Crônica</SelectItem>
              <SelectItem value="aguda">Aguda</SelectItem>
              <SelectItem value="congenita">Congênita</SelectItem>
              <SelectItem value="hereditaria">Hereditária</SelectItem>
              <SelectItem value="outra">Outra</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="severity">Gravidade</Label>
          <Select
            value={formData.severity}
            onValueChange={(value) => handleSelectChange("severity", value)}
          >
            <SelectTrigger id="severity">
              <SelectValue placeholder="Selecione a gravidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leve">Leve</SelectItem>
              <SelectItem value="moderada">Moderada</SelectItem>
              <SelectItem value="grave">Grave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Descrição detalhada da condição"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Sintomas</Label>
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
        <Label>Fatores Desencadeantes</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.triggers.map((item, index) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1 text-gray-500 hover:text-red-500"
                onClick={() => removeTrigger(item)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="Adicionar fator desencadeante"
            onKeyPress={(e) => handleKeyPress(e, 'trigger')}
          />
          <Button 
            type="button"
            variant="outline"
            onClick={addTrigger}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="management_plan">Plano de Gerenciamento</Label>
        <Textarea
          id="management_plan"
          name="management_plan"
          value={formData.management_plan || ""}
          onChange={handleChange}
          placeholder="Como esta condição deve ser gerenciada"
          rows={3}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="is_active" className="cursor-pointer">
          Esta condição está ativa?
        </Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
        />
      </div>
      
      {!formData.is_active && (
        <div className="space-y-2">
          <Label htmlFor="resolution_date">Data de Resolução</Label>
          <Input
            id="resolution_date"
            name="resolution_date"
            type="date"
            value={formData.resolution_date || ""}
            onChange={handleChange}
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Informações adicionais sobre esta condição"
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
          ) : condition ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}