
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { DiaryEntry } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import {
  PlusCircle, Camera, X, Edit, Save, Smile, AlertTriangle,
  Frown, Zap, Thermometer, ZoomIn, Download, Video, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";

// Atualizar a importação do componente de doação
import DonationCard from "@/components/donations/DonationCard";

export default function DiaryPage() {
  const [entries, setEntries] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [newEntry, setNewEntry] = useState({
    pet_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    mood: "normal",
    activities: [],
    symptoms: [],
    notes: "",
    photo_url: "",
    video_url: "",
    media_type: "none"
  });

  const showToast = (message, type = "info") => {
    alert(message);
  };

  const moodEmojis = {
    "feliz": "Feliz 😊",
    "normal": "Normal 😐",
    "triste": "Triste 😢",
    "agitado": "Agitado ⚡",
    "doente": "Doente 🤒"
  };

  // Functions to render mood icons safely in JSX where needed
  const renderMoodIcon = (mood) => {
    switch(mood) {
      case "feliz": return <Smile className="w-5 h-5 text-green-500" />;
      case "normal": return <Smile className="w-5 h-5 text-blue-500" />;
      case "triste": return <Frown className="w-5 h-5 text-purple-500" />;
      case "agitado": return <Zap className="w-5 h-5 text-orange-500" />;
      case "doente": return <Thermometer className="w-5 h-5 text-red-500" />;
      default: return <Smile className="w-5 h-5 text-gray-500" />;
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPet]);

  // Fechar modais com ESC
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (selectedMedia) {
          setSelectedMedia(null);
        }
        if (confirmDelete) {
          setConfirmDelete(null);
        }
      }
    };

    if (selectedMedia || confirmDelete) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedMedia, confirmDelete]);

  const loadData = async () => {
    try {
      const userData = await User.me(); // Verifica se o usuário está autenticado

      // Carregar apenas os pets do usuário atual
      const petsData = await Pet.filter({ created_by: userData.email });
      setPets(petsData);

      if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0].id);
        setNewEntry(prev => ({ ...prev, pet_id: petsData[0].id }));
      }

      if (selectedPet) {
        // Garantir que o pet selecionado pertence ao usuário
        if (petsData.some(pet => pet.id === selectedPet)) {
          const entriesData = await DiaryEntry.filter({ pet_id: selectedPet }, "-date");
          setEntries(entriesData);
        } else {
          // Se o pet selecionado não pertencer ao usuário, limpar os dados
          setEntries([]);
          if (petsData.length > 0) {
            setSelectedPet(petsData[0].id);
          } else {
            setSelectedPet(null);
          }
        }
      }
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { UploadFile } = await import("@/api/integrations");
        const { file_url } = await UploadFile({ file });

        if (isEditing) {
          if (type === "photo") {
            setEntries(prev => prev.map(entry =>
              entry.id === isEditing ? {
                ...entry,
                photo_url: file_url,
                media_type: "photo",
                video_url: "" // Limpa o vídeo se existir
              } : entry
            ));
          } else if (type === "video") {
            setEntries(prev => prev.map(entry =>
              entry.id === isEditing ? {
                ...entry,
                video_url: file_url,
                media_type: "video",
                photo_url: "" // Limpa a foto se existir
              } : entry
            ));
          }
        } else {
          if (type === "photo") {
            setNewEntry(prev => ({
              ...prev,
              photo_url: file_url,
              media_type: "photo",
              video_url: "" // Limpa o vídeo se existir
            }));
          } else if (type === "video") {
            setNewEntry(prev => ({
              ...prev,
              video_url: file_url,
              media_type: "video",
              photo_url: "" // Limpa a foto se existir
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error);
        showToast("Erro ao fazer upload do arquivo. Tente novamente.");
      }
    }
  };

  const handleActivityChange = (value) => {
    if (isEditing) {
      const currentEntry = entries.find(entry => entry.id === isEditing);
      const activities = currentEntry.activities || [];

      if (!activities.includes(value)) {
        setEntries(prev => prev.map(entry =>
          entry.id === isEditing ? { ...entry, activities: [...activities, value] } : entry
        ));
      }
    } else {
      const activities = newEntry.activities || [];

      if (!activities.includes(value)) {
        setNewEntry(prev => ({ ...prev, activities: [...activities, value] }));
      }
    }
  };

  const handleSymptomChange = (value) => {
    if (isEditing) {
      const currentEntry = entries.find(entry => entry.id === isEditing);
      const symptoms = currentEntry.symptoms || [];

      if (!symptoms.includes(value)) {
        setEntries(prev => prev.map(entry =>
          entry.id === isEditing ? { ...entry, symptoms: [...symptoms, value] } : entry
        ));
      }
    } else {
      const symptoms = newEntry.symptoms || [];

      if (!symptoms.includes(value)) {
        setNewEntry(prev => ({ ...prev, symptoms: [...symptoms, value] }));
      }
    }
  };

  const removeActivity = (activity) => {
    if (isEditing) {
      setEntries(prev => prev.map(entry =>
        entry.id === isEditing ? {
          ...entry,
          activities: entry.activities.filter(a => a !== activity)
        } : entry
      ));
    } else {
      setNewEntry(prev => ({
        ...prev,
        activities: prev.activities.filter(a => a !== activity)
      }));
    }
  };

  const removeSymptom = (symptom) => {
    if (isEditing) {
      setEntries(prev => prev.map(entry =>
        entry.id === isEditing ? {
          ...entry,
          symptoms: entry.symptoms.filter(s => s !== symptom)
        } : entry
      ));
    } else {
      setNewEntry(prev => ({
        ...prev,
        symptoms: prev.symptoms.filter(s => s !== symptom)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditing) {
        const entryToUpdate = entries.find(entry => entry.id === isEditing);
        await DiaryEntry.update(isEditing, entryToUpdate);
        setIsEditing(null);
        showToast("Registro atualizado com sucesso!");
      } else {
        await DiaryEntry.create(newEntry);
        setIsAdding(false);
        setNewEntry({
          pet_id: selectedPet,
          date: format(new Date(), "yyyy-MM-dd"),
          mood: "normal",
          activities: [],
          symptoms: [],
          notes: "",
          photo_url: "",
          video_url: "",
          media_type: "none"
        });
        showToast("Registro adicionado com sucesso!");
      }

      loadData();
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      showToast("Ocorreu um erro ao salvar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (entryId) => {
    setIsEditing(entryId);
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setIsEditing(null);
    loadData();
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewEntry({
      pet_id: selectedPet,
      date: format(new Date(), "yyyy-MM-dd"),
      mood: "normal",
      activities: [],
      symptoms: [],
      notes: "",
      photo_url: "",
      video_url: "",
      media_type: "none"
    });
  };

  const deleteEntry = async (entryId) => {
    if (confirmDelete) {
      try {
        setLoading(true);
        await DiaryEntry.delete(entryId);
        setConfirmDelete(null);
        loadData();
        showToast("Registro excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        showToast("Erro ao excluir registro. Tente novamente.");
      } finally {
        setLoading(false);
      }
    } else {
      setConfirmDelete(entryId);
    }
  };

  const downloadMedia = (url, petName, date, type) => {
    const extension = type === "video" ? "mp4" : "jpg";
    const link = document.createElement('a');
    link.href = url;
    link.download = `${petName}_${date}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (entry) => {
    let shareText = ''; // Initialize shareText to ensure it's always defined for fallbacks
    try {
      setSharing(true);

      const pet = pets.find(p => p.id === entry.pet_id);
      const petName = pet?.name || "meu pet";
      const entryDate = format(new Date(entry.date), "dd/MM/yyyy");

      shareText = `Diário do ${petName}: ${entryDate}\n`;
      shareText += `Humor: ${moodEmojis[entry.mood] || entry.mood}\n`;

      if (entry.activities?.length > 0) {
        shareText += `\nAtividades: ${entry.activities.join(", ")}\n`;
      }

      if (entry.symptoms?.length > 0) {
        shareText += `\nSintomas: ${entry.symptoms.join(", ")}\n`;
      }

      if (entry.notes) {
        shareText += `\nObservações: ${entry.notes}\n`;
      }

      // Verificar se está em iframe
      const isInIframe = window !== window.top;
      const hasWebShare = navigator.share && !isInIframe;

      if (hasWebShare) {
        try {
          await navigator.share({
            title: `Diário do ${petName}`,
            text: shareText,
          });
        } catch (err) {
          console.log('Erro ao compartilhar:', err);
          // Fallback para WhatsApp
          const encodedMessage = encodeURIComponent(shareText);
          const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        // Fallback para WhatsApp
        const encodedMessage = encodeURIComponent(shareText);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        if (!newWindow) {
          // Se popup foi bloqueado, copiar para clipboard
          await navigator.clipboard.writeText(shareText);
          alert("Texto copiado para a área de transferência!");
        }
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      // Fallback final: copiar para clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Texto copiado para a área de transferência!");
      } catch (clipboardError) {
        alert("Não foi possível compartilhar este registro.");
      }
    } finally {
      setSharing(false);
    }
  };

  const renderEntryForm = (entry, isNew = false) => {
    const currentEntry = isNew ? newEntry : entry;

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header com foto e data */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seção da Data */}
          <div className="flex-1 space-y-2">
            <Label htmlFor="date" className="text-base font-medium">Data do Registro</Label>
            <Input
              id="date"
              type="date"
              value={currentEntry.date}
              onChange={e => isNew
                ? setNewEntry(prev => ({ ...prev, date: e.target.value }))
                : setEntries(prev => prev.map(item =>
                    item.id === entry.id ? { ...item, date: e.target.value } : item
                  ))
              }
              max={format(new Date(), "yyyy-MM-dd")}
              className="h-12 text-lg"
            />
          </div>

          {/* Seção da Mídia */}
          <div className="flex-shrink-0">
            <Label className="text-base font-medium block mb-2">Foto/Vídeo do Dia</Label>
            <div className="flex flex-col items-center gap-3">
              {/* Preview da mídia */}
              <div className="relative">
                {currentEntry.media_type === "photo" && currentEntry.photo_url ? (
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl overflow-hidden border-2 border-purple-200 shadow-sm">
                    <img
                      src={currentEntry.photo_url}
                      alt="Foto do dia"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => currentEntry.photo_url && setSelectedMedia({url: currentEntry.photo_url, type: "photo"})}
                    />
                  </div>
                ) : currentEntry.media_type === "video" && currentEntry.video_url ? (
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl overflow-hidden border-2 border-purple-200 shadow-sm bg-gray-900 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                       onClick={() => currentEntry.video_url && setSelectedMedia({url: currentEntry.video_url, type: "video"})}>
                    <Video className="w-8 h-8 text-white" />
                  </div>
                ) : (
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-purple-400" />
                  </div>
                )}
                
                {/* Botão de upload sobreposto */}
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <label className="bg-purple-600 hover:bg-purple-700 rounded-full p-2 cursor-pointer shadow-lg transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMediaUpload(e, "photo")}
                      className="hidden"
                    />
                  </label>
                  <label className="bg-purple-600 hover:bg-purple-700 rounded-full p-2 cursor-pointer shadow-lg transition-colors">
                    <Video className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleMediaUpload(e, "video")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 text-center max-w-32">
                Clique nos ícones para adicionar foto ou vídeo
              </p>
            </div>
          </div>
        </div>

        {/* Humor */}
        <div className="space-y-3">
          <Label htmlFor="mood" className="text-base font-medium">Como seu pet está hoje?</Label>
          <Select
            value={currentEntry.mood}
            onValueChange={value => isNew
              ? setNewEntry(prev => ({ ...prev, mood: value }))
              : setEntries(prev => prev.map(item =>
                  item.id === entry.id ? { ...item, mood: value } : item
                ))
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o humor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feliz">
                <div className="flex items-center gap-3 py-1">
                  <Smile className="w-5 h-5 text-green-500" />
                  <span className="text-base">Feliz</span>
                </div>
              </SelectItem>
              <SelectItem value="normal">
                <div className="flex items-center gap-3 py-1">
                  <Smile className="w-5 h-5 text-blue-500" />
                  <span className="text-base">Normal</span>
                </div>
              </SelectItem>
              <SelectItem value="triste">
                <div className="flex items-center gap-3 py-1">
                  <Frown className="w-5 h-5 text-purple-500" />
                  <span className="text-base">Triste</span>
                </div>
              </SelectItem>
              <SelectItem value="agitado">
                <div className="flex items-center gap-3 py-1">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="text-base">Agitado</span>
                </div>
              </SelectItem>
              <SelectItem value="doente">
                <div className="flex items-center gap-3 py-1">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <span className="text-base">Doente</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid de Atividades e Sintomas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Atividades do Dia</Label>
            
            {/* Tags das atividades selecionadas */}
            {currentEntry.activities?.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                {currentEntry.activities.map(activity => (
                  <Badge key={activity} className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-2 px-3 py-1">
                    {activity}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-blue-900"
                      onClick={() => removeActivity(activity)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <Select onValueChange={handleActivityChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="+ Adicionar atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Passeio">
                  <div className="flex items-center gap-2">
                    <span>🚶</span>
                    <span>Passeio</span>
                  </div>
                </SelectItem>
                <SelectItem value="Banho">
                  <div className="flex items-center gap-2">
                    <span>🛁</span>
                    <span>Banho</span>
                  </div>
                </SelectItem>
                <SelectItem value="Brincadeira">
                  <div className="flex items-center gap-2">
                    <span>🎾</span>
                    <span>Brincadeira</span>
                  </div>
                </SelectItem>
                <SelectItem value="Treino">
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <span>Treino</span>
                  </div>
                </SelectItem>
                <SelectItem value="Consulta">
                  <div className="flex items-center gap-2">
                    <span>🏥</span>
                    <span>Consulta</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sintomas */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Sintomas Observados</Label>
            
            {/* Tags dos sintomas selecionados */}
            {currentEntry.symptoms?.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                {currentEntry.symptoms.map(symptom => (
                  <Badge key={symptom} className="bg-red-100 text-red-800 hover:bg-red-200 gap-2 px-3 py-1">
                    {symptom}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-900"
                      onClick={() => removeSymptom(symptom)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <Select onValueChange={handleSymptomChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="+ Adicionar sintoma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vômito">
                  <div className="flex items-center gap-2">
                    <span>🤢</span>
                    <span>Vômito</span>
                  </div>
                </SelectItem>
                <SelectItem value="Diarreia">
                  <div className="flex items-center gap-2">
                    <span>💩</span>
                    <span>Diarreia</span>
                  </div>
                </SelectItem>
                <SelectItem value="Tosse">
                  <div className="flex items-center gap-2">
                    <span>😷</span>
                    <span>Tosse</span>
                  </div>
                </SelectItem>
                <SelectItem value="Espirro">
                  <div className="flex items-center gap-2">
                    <span>🤧</span>
                    <span>Espirro</span>
                  </div>
                </SelectItem>
                <SelectItem value="Letargia">
                  <div className="flex items-center gap-2">
                    <span>😴</span>
                    <span>Letargia</span>
                  </div>
                </SelectItem>
                <SelectItem value="Apetite reduzido">
                  <div className="flex items-center gap-2">
                    <span>🍽️</span>
                    <span>Apetite reduzido</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-base font-medium">Observações do Dia</Label>
          <Textarea
            id="notes"
            value={currentEntry.notes}
            onChange={e => isNew
              ? setNewEntry(prev => ({ ...prev, notes: e.target.value }))
              : setEntries(prev => prev.map(item =>
                  item.id === entry.id ? { ...item, notes: e.target.value } : item
                ))
            }
            placeholder="Como foi o dia do seu pet? Conte sobre comportamentos, brincadeiras, alimentação ou qualquer coisa especial..."
            className="min-h-24 text-base leading-relaxed resize-none"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={isNew ? cancelAdding : cancelEditing}
            className="flex-1 h-12 text-gray-800 border-gray-300 hover:bg-gray-50 font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {isNew ? 'Salvar Registro' : 'Atualizar Registro'}
          </Button>
        </div>

        {!isNew && (
          <Button
            type="button"
            variant="outline"
            onClick={() => deleteEntry(entry.id)}
            className="w-full mt-3 h-11 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Registro
          </Button>
        )}
      </form>
    );
  };

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 pb-24 md:pb-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">Diário do Pet</h1>
        <p className="text-gray-600">Acompanhe o dia a dia do seu pet</p>
      </header>

      {pets.length === 0 ? (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Nenhum pet cadastrado</h2>
          <p className="text-gray-600 mb-4">
            Adicione um pet primeiro para começar a registrar o diário
          </p>
          <Button
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md"
            onClick={() => window.location.href = createPageUrl("Profile")}
          >
            Adicionar Pet
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <Label htmlFor="pet-select">Selecione o Pet</Label>
            <Select
              value={selectedPet}
              onValueChange={setSelectedPet}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isAdding && !isEditing && (
            <Button
              onClick={() => {
                setIsAdding(true);
                setNewEntry(prev => ({ ...prev, pet_id: selectedPet }));
              }}
              className="w-full mb-6 bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Adicionar Registro
            </Button>
          )}

          {isAdding && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Novo Registro</CardTitle>
              </CardHeader>
              <CardContent>
                {renderEntryForm(null, true)}
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {entries.length === 0 && !isAdding ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  Nenhum registro encontrado. Adicione o primeiro registro do seu pet!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.length > 0 ? (
                  entries.map(entry => (
                    <Card key={entry.id} className="overflow-hidden mb-4">
                      <CardContent className="p-4">
                        {isEditing === entry.id ? (
                          renderEntryForm(entry)
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">
                                  {format(new Date(entry.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-sm text-gray-600">
                                    {moodEmojis[entry.mood]}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(entry)}
                                  className="h-8 w-8 p-0 text-gray-700"
                                  disabled={sharing}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(entry.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {entry.media_type === "photo" && entry.photo_url && (
                              <div className="relative mb-4">
                                <img
                                  src={entry.photo_url}
                                  alt="Foto do dia"
                                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                  onClick={() => setSelectedMedia({url: entry.photo_url, type: "photo"})}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 bg-white/80 text-gray-700 hover:bg-white"
                                  onClick={() => setSelectedMedia({url: entry.photo_url, type: "photo"})}
                                >
                                  <ZoomIn className="w-4 h-4" />
                                </Button>
                              </div>
                            )}

                            {entry.media_type === "video" && entry.video_url && (
                              <div className="relative mb-4">
                                <div className="w-full bg-gray-900 rounded-lg relative">
                                  <video
                                    src={entry.video_url}
                                    className="w-full h-48 object-contain rounded-lg cursor-pointer"
                                    onClick={() => setSelectedMedia({url: entry.video_url, type: "video"})}
                                    controls
                                  />
                                </div>
                              </div>
                            )}

                            {entry.activities?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-1">Atividades:</p>
                                <div className="flex flex-wrap gap-2">
                                  {entry.activities.map((activity, idx) => (
                                    <Badge key={idx} className="bg-blue-100 text-blue-800">
                                      {activity}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.symptoms?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-1">Sintomas:</p>
                                <div className="flex flex-wrap gap-2">
                                  {entry.symptoms.map((symptom, idx) => (
                                    <Badge key={idx} className="bg-red-100 text-red-800">
                                      {symptom}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.notes && (
                              <div>
                                <p className="text-sm font-medium mb-1">Observações:</p>
                                <p className="text-sm text-gray-600 whitespace-pre-line">{entry.notes}</p>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : null}
              </div>
            )}
          </div>
        </>
      )}

      {/* Adicionar card de doação no final da página */}
      <div className="mt-10">
        <DonationCard />
      </div>

      {/* Dialog para visualização de mídia */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedMedia?.type === "photo" ? "Foto do pet" : "Vídeo do pet"}
            </DialogTitle>
            <DialogDescription>
              {selectedPet && pets.find(p => p.id === selectedPet)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            {selectedMedia?.type === "photo" ? (
              <img
                src={selectedMedia?.url}
                alt="Foto ampliada"
                className="w-full rounded-lg object-contain max-h-96"
              />
            ) : (
              <video
                src={selectedMedia?.url}
                controls
                autoPlay
                className="w-full rounded-lg object-contain max-h-96"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2 bg-white text-gray-700"
              onClick={() => {
                const petName = pets.find(p => p.id === selectedPet)?.name || "pet";
                const date = format(new Date(), "yyyyMMdd");
                downloadMedia(selectedMedia.url, petName, date, selectedMedia.type);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este registro do diário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteEntry(confirmDelete)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
