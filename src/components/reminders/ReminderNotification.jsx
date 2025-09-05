import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Check, X, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReminderNotification({ reminder, pet, onClose, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Efeito de fade-in
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Som de notificação (se implementado)
    playNotificationSound();
    
    return () => clearTimeout(timer);
  }, []);
  
  const playNotificationSound = () => {
    // Implementação do som de notificação
    // Poderia usar a Web Audio API ou HTMLAudioElement
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.play().catch(e => console.log("Erro ao reproduzir som:", e));
    } catch (error) {
      console.log("Notificação sonora não suportada");
    }
  };
  
  const handleClose = () => {
    setIsVisible(false);
    // Dá tempo para a animação de fade-out ocorrer
    setTimeout(onClose, 300);
  };
  
  const handleComplete = () => {
    setIsVisible(false);
    // Dá tempo para a animação de fade-out ocorrer
    setTimeout(onComplete, 300);
  };
  
  const getReminderIcon = () => {
    switch (reminder.type) {
      case "consulta":
        return <Calendar className="h-6 w-6 text-blue-500" />;
      case "vacina":
        return <Calendar className="h-6 w-6 text-red-500" />;
      case "medicamento":
        return <Calendar className="h-6 w-6 text-purple-500" />;
      default:
        return <Bell className="h-6 w-6 text-amber-500" />;
    }
  };
  
  const getReminderType = () => {
    switch (reminder.type) {
      case "consulta": return "Consulta";
      case "vacina": return "Vacina";
      case "medicamento": return "Medicamento";
      default: return "Lembrete";
    }
  };
  
  const formatReminderTime = () => {
    return format(new Date(reminder.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  const getTimeLeftText = () => {
    const reminderTime = new Date(reminder.date);
    const now = new Date();
    const diffMs = reminderTime - now;
    
    if (diffMs < 0) return "Agora";
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMinutes < 60) {
      return `Em ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Em ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className="w-80 shadow-lg border-t-4 border-t-purple-500 overflow-hidden">
        <div className="flex items-start p-4">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            {getReminderIcon()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{reminder.title}</h4>
                <p className="text-sm text-gray-500">{getReminderType()} - {pet?.name}</p>
              </div>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-gray-600">{formatReminderTime()}</span>
              </div>
              <div className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-amber-600 font-medium">{getTimeLeftText()}</span>
              </div>
              {reminder.description && (
                <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-3 flex justify-between">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Adiar
          </Button>
          <Button 
            className="bg-purple-700 hover:bg-purple-800" 
            size="sm"
            onClick={handleComplete}
          >
            <Check className="h-4 w-4 mr-1" />
            Concluído
          </Button>
        </div>
      </Card>
    </div>
  );
}