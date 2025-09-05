
import React, { useState } from "react";
import { Record } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Scale, FileText, Syringe, Heart, Pill } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatInputDate, getCurrentDate } from "@/components/utils/dateUtils";

export default function RecordForm({ pet_id, initialType = "peso", onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    pet_id,
    type: initialType,
    value: "",
    date: getCurrentDate(), // Agora retorna a data correta
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!formData.value) {
      setError("Por favor, preencha o valor do registro");
      return false;
    }
    if (!formData.date) {
      setError("Por favor, selecione uma data");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      await Record.create({
        ...formData,
        // Data já está correta graças ao getCurrentDate
      });
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error("Erro ao salvar registro:", err);
      setError("Ocorreu um erro ao salvar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Limpar erro quando usuário fizer alterações
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Registro</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="peso">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-500" />
                <span>Peso</span>
              </div>
            </SelectItem>
            <SelectItem value="vacina">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-red-500" />
                <span>Vacina</span>
              </div>
            </SelectItem>
            <SelectItem value="exame">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span>Exame</span>
              </div>
            </SelectItem>
            <SelectItem value="medicamento">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-500" />
                <span>Medicamento</span>
              </div>
            </SelectItem>
            <SelectItem value="consulta">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-500" />
                <span>Consulta</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">
          {formData.type === "peso" ? "Peso (kg)" : 
           formData.type === "vacina" ? "Vacina aplicada" :
           formData.type === "exame" ? "Nome do exame" :
           formData.type === "medicamento" ? "Nome do medicamento" :
           formData.type === "consulta" ? "Motivo da consulta" :
           "Descrição"}
        </Label>
        <Input
          id="value"
          value={formData.value}
          onChange={(e) => handleChange("value", e.target.value)}
          placeholder={
            formData.type === "peso" ? "Ex: 15.5" : 
            formData.type === "vacina" ? "Ex: Antirrábica" :
            formData.type === "exame" ? "Ex: Hemograma completo" :
            formData.type === "medicamento" ? "Ex: Antibiótico" :
            formData.type === "consulta" ? "Ex: Checkup anual" :
            "Insira os detalhes aqui"
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Observações adicionais..."
          className="min-h-[100px]"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
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
            <span className="flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Salvar Registro
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
