
import React, { useState } from "react";
import { HealthGoal } from "@/api/entities/HealthGoal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, addMonths, parseISO } from "date-fns";
import { AlertTriangle, Trash2 } from "lucide-react";
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
import { formatInputDate, getCurrentDate, addDays } from "date-fns";

export default function HealthGoalForm({ pet_id, goal = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (goal) {
      return {
        ...goal,
        start_date: formatInputDate(goal.start_date),
        target_date: formatInputDate(goal.target_date)
      };
    }
    
    // Calcular data alvo (30 dias a frente)
    const today = getCurrentDate();
    const targetDate = addDays(new Date(), 31); // 30 dias + ajuste de 1 dia
    
    return {
      pet_id,
      title: "",
      category: "peso",
      target_value: "",
      start_date: today,
      target_date: format(targetDate, "yyyy-MM-dd"),
      status: "em_andamento",
      frequency: "diaria",
      notes: ""
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.target_value) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log("Enviando dados da meta:", formData);
      
      // Validar e converter dados para os tipos corretos
      const targetValue = parseFloat(formData.target_value);
      if (isNaN(targetValue)) {
        throw new Error("O valor alvo deve ser um número válido");
      }
      
      // Preparar dados para envio com tipos corretos
      const goalData = {
        ...formData,
        start_date: formData.start_date,
        target_date: formData.target_date,
      };

      if (goal && goal.id) {
        await HealthGoal.update(goal.id, goalData);
      } else {
        await HealthGoal.create(goalData);
      }
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error("Erro ao salvar meta:", err);
      setError(err.message || "Ocorreu um erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Limpar erro quando usuário fizer alterações
  };
  
  const handleDelete = async () => {
    if (goal && goal.id) {
      setLoading(true);
      try {
        await HealthGoal.delete(goal.id);
        console.log("Meta excluída com sucesso");
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } catch (err) {
        console.error("Erro ao excluir meta:", err);
        setError("Ocorreu um erro ao excluir. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
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
          <Label htmlFor="title">Título da Meta</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Ex: Atingir peso ideal"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peso">Peso</SelectItem>
              <SelectItem value="atividade">Atividade Física</SelectItem>
              <SelectItem value="alimentacao">Alimentação</SelectItem>
              <SelectItem value="medicacao">Medicação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_value">
            {formData.category === "peso" ? "Peso Alvo (kg)" : 
             formData.category === "atividade" ? "Minutos de Atividade por Dia" :
             formData.category === "alimentacao" ? "Porções por Dia" :
             formData.category === "medicacao" ? "Doses por Dia" :
             "Valor Alvo"}
          </Label>
          <Input
            id="target_value"
            type="number"
            step={formData.category === "peso" ? "0.1" : "1"}
            value={formData.target_value}
            onChange={(e) => handleChange("target_value", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Data de Início</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_date">Data Alvo</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => handleChange("target_date", e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              required
            />
          </div>
        </div>

        {goal && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="atingida">Atingida</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequência de Acompanhamento</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => handleChange("frequency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diaria">Diária</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>
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
            {goal && (
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
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                goal ? 'Atualizar Meta' : 'Criar Meta'
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
              Tem certeza que deseja excluir esta meta de saúde? 
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
