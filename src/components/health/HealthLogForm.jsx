import React, { useState } from "react";
import { HealthLog } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { formatInputDate, getCurrentDate } from "@/components/utils/dateUtils";

export default function HealthLogForm({ pet_id, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    pet_id,
    date: getCurrentDate(),
    activity_level: 'normal',
    activity_minutes: '',
    activity_type: '',
    mood: 'normal',
    water_intake: 'normal',
    food_intake: {
      morning: false,
      afternoon: false,
      evening: false,
      amount: ''
    },
    notes: '',
    symptoms: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const commonSymptoms = [
    "Vômito",
    "Diarreia",
    "Falta de apetite",
    "Tosse",
    "Espirro",
    "Letargia",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        activity_minutes: formData.activity_minutes ? parseInt(formData.activity_minutes, 10) : 0
      };

      await HealthLog.create(dataToSubmit);
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error("Erro ao salvar registro de atividade:", err);
      setError(err.message || "Ocorreu um erro ao salvar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              max={getCurrentDate()}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              type="number"
              id="weight"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="Ex: 12.5"
              className="w-full"
            />
          </div>

          <div>
            <Label>Nível de Atividade</Label>
            <Select
              value={formData.activity_level}
              onValueChange={(value) => handleChange('activity_level', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="activity_minutes">Minutos de Atividade</Label>
            <Input
              type="number"
              id="activity_minutes"
              value={formData.activity_minutes || ''}
              onChange={(e) => handleChange('activity_minutes', e.target.value)}
              placeholder="Ex: 30"
              className="w-full"
            />
          </div>

          <div>
            <Label>Sintomas Observados</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {commonSymptoms.map(symptom => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={`symptom-${symptom}`}
                    checked={formData.symptoms?.includes(symptom)}
                    onCheckedChange={(checked) => {
                      const currentSymptoms = formData.symptoms || [];
                      handleChange('symptoms', 
                        checked 
                          ? [...currentSymptoms, symptom]
                          : currentSymptoms.filter(s => s !== symptom)
                      );
                    }}
                  />
                  <Label
                    htmlFor={`symptom-${symptom}`}
                    className="text-sm cursor-pointer"
                  >
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Adicione observações importantes sobre a saúde do pet..."
              className="h-20 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Registrar Atividade
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}