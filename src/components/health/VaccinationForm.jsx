
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Syringe, AlertTriangle, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatInputDate, getCurrentDate } from "@/components/utils/dateUtils";

export default function VaccinationForm({ initialData = null, onSubmit, onCancel, onDelete }) {
  const today = getCurrentDate(); // Data correta

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    date: initialData?.date ? formatInputDate(initialData.date) : today,
    next_date: initialData?.next_date ? formatInputDate(initialData.next_date) : "",
    vet_name: initialData?.vet_name || "",
    vet_clinic: initialData?.vet_clinic || "",
    lot_number: initialData?.lot_number || "",
    notes: initialData?.notes || "",
    reminder_enabled: initialData?.reminder_enabled !== false, // true por padrão
    reminder_days_before: initialData?.reminder_days_before || 7,
    has_side_effects: initialData?.has_side_effects || false,
    side_effects: initialData?.side_effects || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Limpar erro quando o usuário faz alterações
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      setError("Por favor, preencha os campos obrigatórios");
      return;
    }
    
    setLoading(true);
    
    try {
      const vaccineData = {
        ...formData,
        // Datas já estão corretas
      };
      
      await onSubmit(vaccineData);
    } catch (err) {
      console.error("Erro ao salvar vacina:", err);
      setError("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && initialData) {
      onDelete(initialData.id);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start">
            <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Vacina</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ex: Antirrábica"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Data da Aplicação</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
            max={formatInputDate(today)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="next_date">Data da Próxima Dose</Label>
          <Input
            id="next_date"
            type="date"
            value={formData.next_date}
            onChange={(e) => handleChange("next_date", e.target.value)}
            min={formatInputDate(today)}
          />
          <p className="text-xs text-gray-500">Deixe em branco se não houver próxima dose prevista</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vet_name">Veterinário</Label>
            <Input
              id="vet_name"
              value={formData.vet_name}
              onChange={(e) => handleChange("vet_name", e.target.value)}
              placeholder="Nome do veterinário"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vet_clinic">Clínica/Hospital</Label>
            <Input
              id="vet_clinic"
              value={formData.vet_clinic}
              onChange={(e) => handleChange("vet_clinic", e.target.value)}
              placeholder="Nome da clínica ou hospital"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lot_number">Número do Lote</Label>
          <Input
            id="lot_number"
            value={formData.lot_number}
            onChange={(e) => handleChange("lot_number", e.target.value)}
            placeholder="Ex: AB123456"
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder_enabled" className="cursor-pointer">Ativar lembrete para próxima dose</Label>
            <Switch
              id="reminder_enabled"
              checked={formData.reminder_enabled}
              onCheckedChange={(value) => handleChange("reminder_enabled", value)}
            />
          </div>
          
          {formData.reminder_enabled && formData.next_date && (
            <div className="mt-2 pl-4 border-l-2 border-purple-200">
              <Label htmlFor="reminder_days_before" className="text-sm">Dias antes para notificar</Label>
              <Input
                id="reminder_days_before"
                type="number"
                min="1"
                max="30"
                value={formData.reminder_days_before}
                onChange={(e) => handleChange("reminder_days_before", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="has_side_effects" className="cursor-pointer">Registrou efeitos colaterais?</Label>
            <Switch
              id="has_side_effects"
              checked={formData.has_side_effects}
              onCheckedChange={(value) => handleChange("has_side_effects", value)}
            />
          </div>
          
          {formData.has_side_effects && (
            <div className="mt-2 pl-4 border-l-2 border-purple-200">
              <Label htmlFor="side_effects" className="text-sm">Descreva os efeitos colaterais</Label>
              <Textarea
                id="side_effects"
                value={formData.side_effects}
                onChange={(e) => handleChange("side_effects", e.target.value)}
                placeholder="Descreva os efeitos colaterais observados"
                className="mt-1"
                rows={2}
              />
            </div>
          )}
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
        
        <div className="flex justify-between gap-2 pt-4">
          <div>
            {initialData && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
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
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Syringe className="w-4 h-4 mr-2" />
                  {initialData ? 'Atualizar Vacina' : 'Registrar Vacina'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de vacina? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
