import React, { useState, useEffect } from "react";
import { DiaryEntry } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, X, Smile, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { UploadFile } from "@/api/integrations";

export default function DiaryEntryForm({ pet_id, onSuccess, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    pet_id,
    date: format(new Date(), "yyyy-MM-dd"),
    mood: "normal",
    activities: [],
    symptoms: [],
    notes: "",
    photo_url: "",
    video_url: "",
    media_type: "none",
    weight: null,
    food_intake: "normal",
    water_intake: "normal",
    medications_given: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: format(new Date(initialData.date), "yyyy-MM-dd")
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const entryData = {
        ...formData,
        activities: formData.activities || [],
        symptoms: formData.symptoms || [],
        medications_given: formData.medications_given || []
      };

      console.log("Enviando dados do diário:", entryData);

      if (initialData?.id) {
        await DiaryEntry.update(initialData.id, entryData);
      } else {
        await DiaryEntry.create(entryData);
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar entrada do diário:", error);
      setError("Ocorreu um erro ao salvar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingMedia(true);
    setError(null);

    try {
      const { file_url } = await UploadFile({ file });
      
      if (type === "photo") {
        setFormData(prev => ({
          ...prev,
          photo_url: file_url,
          video_url: "",
          media_type: "photo"
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          video_url: file_url,
          photo_url: "",
          media_type: "video"
        }));
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setError("Erro ao fazer upload do arquivo. Tente novamente.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleActivityAdd = (value) => {
    if (!formData.activities.includes(value)) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, value]
      }));
    }
  };

  const handleSymptomAdd = (value) => {
    if (!formData.symptoms.includes(value)) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, value]
      }));
    }
  };

  const removeActivity = (activity) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== activity)
    }));
  };

  const removeSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          max={format(new Date(), "yyyy-MM-dd")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mood">Humor</Label>
        <Select
          value={formData.mood}
          onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Como está o humor?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feliz">😊 Feliz</SelectItem>
            <SelectItem value="normal">😐 Normal</SelectItem>
            <SelectItem value="triste">😢 Triste</SelectItem>
            <SelectItem value="agitado">⚡ Agitado</SelectItem>
            <SelectItem value="doente">🤒 Doente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Atividades</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.activities?.map(activity => (
            <Badge key={activity} className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1">
              {activity}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeActivity(activity)}
              />
            </Badge>
          ))}
        </div>

        <Select onValueChange={handleActivityAdd}>
          <SelectTrigger>
            <SelectValue placeholder="Adicionar atividade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Passeio">Passeio</SelectItem>
            <SelectItem value="Banho">Banho</SelectItem>
            <SelectItem value="Brincadeira">Brincadeira</SelectItem>
            <SelectItem value="Treino">Treino</SelectItem>
            <SelectItem value="Consulta">Consulta</SelectItem>
            <SelectItem value="Socialização">Socialização</SelectItem>
            <SelectItem value="Exercício">Exercício</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sintomas</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.symptoms?.map(symptom => (
            <Badge key={symptom} className="bg-red-100 text-red-800 hover:bg-red-200 gap-1">
              {symptom}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeSymptom(symptom)}
              />
            </Badge>
          ))}
        </div>

        <Select onValueChange={handleSymptomAdd}>
          <SelectTrigger>
            <SelectValue placeholder="Adicionar sintoma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Vômito">Vômito</SelectItem>
            <SelectItem value="Diarreia">Diarreia</SelectItem>
            <SelectItem value="Tosse">Tosse</SelectItem>
            <SelectItem value="Espirro">Espirro</SelectItem>
            <SelectItem value="Letargia">Letargia</SelectItem>
            <SelectItem value="Apetite reduzido">Apetite reduzido</SelectItem>
            <SelectItem value="Coceira">Coceira</SelectItem>
            <SelectItem value="Dor">Dor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          value={formData.weight || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || null }))}
          placeholder="Ex: 15.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="food_intake">Alimentação</Label>
          <Select
            value={formData.food_intake}
            onValueChange={(value) => setFormData(prev => ({ ...prev, food_intake: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Consumo de alimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="aumentado">Aumentado</SelectItem>
              <SelectItem value="diminuido">Diminuído</SelectItem>
              <SelectItem value="nao_comeu">Não comeu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="water_intake">Hidratação</Label>
          <Select
            value={formData.water_intake}
            onValueChange={(value) => setFormData(prev => ({ ...prev, water_intake: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Consumo de água" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="aumentado">Aumentado</SelectItem>
              <SelectItem value="diminuido">Diminuído</SelectItem>
              <SelectItem value="nao_bebeu">Não bebeu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Observações sobre o dia do seu pet..."
          rows={4}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label className="mb-2 block">Mídia</Label>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleMediaUpload(e, "photo")}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors"
              >
                <Camera className="w-6 h-6 text-gray-400" />
              </label>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleMediaUpload(e, "video")}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors"
              >
                <Video className="w-6 h-6 text-gray-400" />
              </label>
            </div>
          </div>
        </div>

        {uploadingMedia && (
          <div className="text-sm text-gray-500">
            Fazendo upload...
          </div>
        )}

        {formData.media_type !== "none" && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {formData.media_type === "photo" ? "Foto adicionada" : "Vídeo adicionado"}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormData(prev => ({
                ...prev,
                photo_url: "",
                video_url: "",
                media_type: "none"
              }))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || uploadingMedia}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={loading || uploadingMedia}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? "Salvando..." : (initialData ? "Atualizar" : "Salvar")}
        </Button>
      </div>
    </form>
  );
}