
import React, { useState, useRef, useEffect } from "react";
import { X, Calendar, Heart, BookOpen, Bell, FileBarChart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event } from "@/api/entities";
import { DiaryEntry } from "@/api/entities";
import { HealthLog } from "@/api/entities";
import { Reminder } from "@/api/entities";
import { Record } from "@/api/entities";
import { Pet } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AddModal({ open, onOpenChange, initialType = "event" }) {
  const [type, setType] = useState(initialType);
  const [formData, setFormData] = useState({});
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const firstInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      loadPets();
      resetForm(initialType);
      setType(initialType);
      
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    }
  }, [open, initialType]);

  const loadPets = async () => {
    try {
      const petsData = await Pet.list();
      setPets(petsData);
      
      if (petsData.length > 0) {
        setSelectedPet(petsData[0].id);
        setFormData(prev => ({ ...prev, pet_id: petsData[0].id }));
      }
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
    }
  };

  const resetForm = (selectedType) => {
    setErrors({});
    setSuccess(false);
    
    const today = new Date();
    
    switch (selectedType) {
      case "event":
        setFormData({
          title: "",
          date: format(new Date(today.getTime() + 2 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
          type: "consulta",
          notes: "",
          pet_id: selectedPet
        });
        break;
        
      case "health":
        setFormData({
          date: format(today, "yyyy-MM-dd"),
          activity_level: "moderado",
          water_intake: "normal",
          weight: "",
          activity_minutes: "30",
          notes: "",
          pet_id: selectedPet
        });
        break;
        
      case "diary":
        setFormData({
          date: format(today, "yyyy-MM-dd"),
          mood: "normal",
          notes: "",
          pet_id: selectedPet
        });
        break;
        
      case "reminder":
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0);
        
        setFormData({
          title: "",
          date: format(tomorrow, "yyyy-MM-dd'T'HH:mm"),
          type: "consulta",
          description: "",
          status: "ativo",
          pet_id: selectedPet
        });
        break;
        
      case "metric":
        setFormData({
          date: format(today, "yyyy-MM-dd"),
          type: "peso",
          value: "",
          notes: "",
          pet_id: selectedPet
        });
        break;
    }
  };

  const handleInputChange = (e) => {
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
    
    if (name === 'type' && type === 'event') {
      setFormData(prev => ({ ...prev, type: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pet_id) {
      newErrors.pet_id = "Selecione um pet";
    }
    
    switch (type) {
      case "event":
        if (!formData.title || formData.title.trim() === "") {
          newErrors.title = "Título é obrigatório";
        }
        if (!formData.date) {
          newErrors.date = "Data é obrigatória";
        }
        break;
        
      case "health":
        if (!formData.date) {
          newErrors.date = "Data é obrigatória";
        }
        if (formData.weight && isNaN(parseFloat(formData.weight))) {
          newErrors.weight = "Peso deve ser um número";
        }
        if (formData.activity_minutes && isNaN(parseInt(formData.activity_minutes))) {
          newErrors.activity_minutes = "Minutos de atividade deve ser um número";
        }
        break;
        
      case "diary":
        if (!formData.date) {
          newErrors.date = "Data é obrigatória";
        }
        break;
        
      case "reminder":
        if (!formData.title || formData.title.trim() === "") {
          newErrors.title = "Título é obrigatório";
        }
        if (!formData.date) {
          newErrors.date = "Data é obrigatória";
        }
        break;
        
      case "metric":
        if (!formData.date) {
          newErrors.date = "Data é obrigatória";
        }
        if (!formData.value || formData.value.trim() === "") {
          newErrors.value = "Valor é obrigatório";
        }
        break;
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
      let result;
      
      switch (type) {
        case "event":
          result = await Event.create(formData);
          break;
          
        case "health":
          result = await HealthLog.create(formData);
          break;
          
        case "diary":
          result = await DiaryEntry.create(formData);
          break;
          
        case "reminder":
          result = await Reminder.create({
            ...formData,
            notification_time: ["1h"]
          });
          break;
          
        case "metric":
          result = await Record.create(formData);
          break;
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        onOpenChange(false);
        
        const pageMap = {
          event: "Calendar",
          health: "Health",
          diary: "Diary",
          reminder: "Reminders",
          metric: "Health"
        };
        
        navigate(createPageUrl(pageMap[type]));
        
      }, 1500);
      
    } catch (error) {
      console.error(`Erro ao adicionar ${type}:`, error);
      setErrors(prev => ({ ...prev, form: "Ocorreu um erro ao salvar. Tente novamente." }));
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (type) {
      case "event":
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="title" className="text-sm font-medium">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                ref={firstInputRef}
                value={formData.title || ""}
                onChange={handleInputChange}
                className={`${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                placeholder="Ex: Consulta veterinária"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-0.5">{errors.title}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-sm font-medium">Tipo</Label>
                <Select
                  value={formData.type || "consulta"}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="vacina">Vacina</SelectItem>
                    <SelectItem value="medicamento">Medicamento</SelectItem>
                    <SelectItem value="tosa">Tosa</SelectItem>
                    <SelectItem value="banho">Banho</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
              <div className="space-y-1">
                <Label htmlFor="date" className="text-sm font-medium">
                  Data e Hora <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date || ""}
                  onChange={handleInputChange}
                  className={`${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={2}
                placeholder="Observações adicionais..."
                className="min-h-[60px] resize-none text-sm"
              />
            </div>
          </>
        );
        
      case "health":
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="date" className="text-sm font-medium">
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                ref={firstInputRef}
                value={formData.date || ""}
                onChange={handleInputChange}
                className={`${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                max={format(new Date(), "yyyy-MM-dd")}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="weight" className="text-sm font-medium">Peso (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight || ""}
                  onChange={handleInputChange}
                  className={`${errors.weight ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                  placeholder="0.0"
                />
                {errors.weight && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.weight}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="activity_minutes" className="text-sm font-medium">Minutos de atividade</Label>
                <Input
                  id="activity_minutes"
                  name="activity_minutes"
                  type="number"
                  value={formData.activity_minutes || ""}
                  onChange={handleInputChange}
                  className="h-9 text-sm"
                  placeholder="30"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="activity_level" className="text-sm font-medium">Nível de atividade</Label>
                <Select
                  value={formData.activity_level || "moderado"}
                  onValueChange={(value) => handleSelectChange("activity_level", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="water_intake" className="text-sm font-medium">Consumo de água</Label>
                <Select
                  value={formData.water_intake || "normal"}
                  onValueChange={(value) => handleSelectChange("water_intake", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o consumo" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={2}
                placeholder="Observações adicionais..."
                className="min-h-[60px] resize-none text-sm"
              />
            </div>
          </>
        );
        
      case "diary":
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-sm font-medium">
                  Data <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  ref={firstInputRef}
                  value={formData.date || ""}
                  onChange={handleInputChange}
                  className={`${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="mood" className="text-sm font-medium">Humor</Label>
                <Select
                  value={formData.mood || "normal"}
                  onValueChange={(value) => handleSelectChange("mood", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o humor" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="feliz">Feliz</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="triste">Triste</SelectItem>
                    <SelectItem value="agitado">Agitado</SelectItem>
                    <SelectItem value="doente">Doente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm font-medium">
                Anotações <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Como foi o dia do seu pet..."
                className={`${errors.notes ? "border-red-500 focus-visible:ring-red-500" : ""} min-h-[100px] text-sm`}
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-0.5">{errors.notes}</p>
              )}
            </div>
          </>
        );
        
      case "reminder":
        return (
          <>
            <div className="space-y-1">
              <Label htmlFor="title" className="text-sm font-medium">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                ref={firstInputRef}
                value={formData.title || ""}
                onChange={handleInputChange}
                className={`${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                placeholder="Ex: Dar medicamento"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-0.5">{errors.title}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-sm font-medium">Tipo</Label>
                <Select
                  value={formData.type || "consulta"}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="vacina">Vacina</SelectItem>
                    <SelectItem value="medicamento">Medicamento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="date" className="text-sm font-medium">
                  Data e Hora <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date || ""}
                  onChange={handleInputChange}
                  className={`${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={2}
                placeholder="Descrição adicional..."
                className="min-h-[60px] resize-none text-sm"
              />
            </div>
          </>
        );
        
      case "metric":
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-sm font-medium">
                  Data <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  ref={firstInputRef}
                  value={formData.date || ""}
                  onChange={handleInputChange}
                  className={`${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="type" className="text-sm font-medium">Tipo de Métrica</Label>
                <Select
                  value={formData.type || "peso"}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="peso">Peso</SelectItem>
                    <SelectItem value="medicamento">Medicamento</SelectItem>
                    <SelectItem value="vacina">Vacina</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="value" className="text-sm font-medium">
                {formData.type === "peso" ? "Peso (kg)" : 
                 formData.type === "medicamento" ? "Medicamento" : 
                 formData.type === "vacina" ? "Vacina" : 
                 formData.type === "exame" ? "Exame" : 
                 formData.type === "consulta" ? "Detalhes da consulta" : 
                 "Valor"}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                name="value"
                type={formData.type === "peso" ? "number" : "text"}
                step={formData.type === "peso" ? "0.1" : undefined}
                value={formData.value || ""}
                onChange={handleInputChange}
                placeholder={formData.type === "peso" ? "Ex: 10.5" : ""}
                className={`${errors.value ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
              />
              {errors.value && (
                <p className="text-red-500 text-xs mt-0.5">{errors.value}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={2}
                placeholder="Detalhes adicionais..."
                className="min-h-[60px] resize-none text-sm"
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-0 overflow-hidden rounded-lg">
        <DialogHeader className="p-3 sm:p-4 bg-purple-50 border-b">
          <div className="flex items-center gap-2">
            {type === "event" && <Calendar className="w-5 h-5 text-purple-600" />}
            {type === "health" && <Heart className="w-5 h-5 text-purple-600" />}
            {type === "diary" && <BookOpen className="w-5 h-5 text-purple-600" />}
            {type === "reminder" && <Bell className="w-5 h-5 text-purple-600" />}
            {type === "metric" && <FileBarChart className="w-5 h-5 text-purple-600" />}
            <DialogTitle className="text-lg font-semibold text-purple-800">
              {type === "event" && "Novo Evento"}
              {type === "health" && "Registro de Saúde"}
              {type === "diary" && "Entrada no Diário"}
              {type === "reminder" && "Novo Lembrete"}
              {type === "metric" && "Nova Métrica"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-purple-600 text-sm">
            {type === "event" && "Agende um compromisso para seu pet"}
            {type === "health" && "Registre informações de saúde do seu pet"}
            {type === "diary" && "Registre momentos especiais do seu pet"}
            {type === "reminder" && "Crie um lembrete para não esquecer"}
            {type === "metric" && "Registre métricas importantes do seu pet"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[70vh]">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Registro Salvo!</h3>
              <p className="text-gray-600 mb-4 text-sm">
                {type === "event" && "Evento adicionado com sucesso"}
                {type === "health" && "Registro de saúde salvo"}
                {type === "diary" && "Entrada no diário registrada"}
                {type === "reminder" && "Lembrete configurado"}
                {type === "metric" && "Métrica registrada"}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm(type);
                    setSuccess(false);
                  }}
                  className="text-sm"
                >
                  Adicionar Outro
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                  onClick={() => onOpenChange(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="pet_id" className="text-sm font-medium">
                  Pet <span className="text-red-500">*</span>
                </Label>
                {pets.length > 0 ? (
                  <Select
                    value={formData.pet_id || ""}
                    onValueChange={(value) => {
                      setSelectedPet(value);
                      setFormData((prev) => ({ ...prev, pet_id: value }));
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione um pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-xs sm:text-sm text-amber-600 flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-amber-50 rounded-md">
                    <span>Você precisa adicionar um pet primeiro</span>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs sm:text-sm text-amber-700"
                      onClick={() => {
                        onOpenChange(false);
                        navigate(createPageUrl("Profile"));
                      }}
                    >
                      Adicionar pet
                    </Button>
                  </div>
                )}
                {errors.pet_id && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.pet_id}</p>
                )}
              </div>

              {renderFormFields()}

              <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 px-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto text-sm h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm h-9"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
