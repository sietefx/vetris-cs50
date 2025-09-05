
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Pet } from "@/api/entities";
import { Event } from "@/api/entities";
import { Reminder } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  X,
  Calendar as CalendarIcon,
  PawPrint,
  Clock,
  AlertTriangle,
  Pill,
  Syringe,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { format, isToday, isTomorrow, isPast, differenceInHours, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function NotificationDropdown({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Adicionar listener para tecla ESC
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const loadNotifications = async () => {
    try {
      const userData = await User.me();
      if (!userData) return;

      const petsData = await Pet.filter({ created_by: userData.email });
      const petIds = petsData.map(pet => pet.id);
      
      if (petIds.length === 0) {
        setNotifications([]);
        onUnreadCountChange(0);
        return;
      }

      const allEvents = await Event.list();
      const userEvents = allEvents.filter(event => 
        petIds.includes(event.pet_id) && event.status === "pendente"
      );

      const allReminders = await Reminder.list();
      const userReminders = allReminders.filter(reminder => 
        petIds.includes(reminder.pet_id) && reminder.status === "ativo"
      );

      const now = new Date();
      const notifications = [];

      // Processar eventos da agenda
      userEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const hoursUntil = differenceInHours(eventDate, now);
        const pet = petsData.find(p => p.id === event.pet_id);

        if (hoursUntil <= 72 && hoursUntil >= -24) {
          let urgencyLevel = 'normal';
          let timeText = '';
          let iconColor = 'text-blue-500';
          let bgColor = 'bg-blue-50';
          let borderColor = 'border-l-blue-400';

          if (isPast(eventDate)) {
            urgencyLevel = 'high';
            timeText = 'Atrasado';
            iconColor = 'text-red-500';
            bgColor = 'bg-red-50';
            borderColor = 'border-l-red-400';
          } else if (isToday(eventDate)) {
            urgencyLevel = 'high';
            timeText = `Hoje às ${format(eventDate, "HH:mm")}`;
            iconColor = 'text-orange-500';
            bgColor = 'bg-orange-50';
            borderColor = 'border-l-orange-400';
          } else if (isTomorrow(eventDate)) {
            urgencyLevel = 'medium';
            timeText = `Amanhã às ${format(eventDate, "HH:mm")}`;
            iconColor = 'text-blue-500';
            bgColor = 'bg-blue-50';
            borderColor = 'border-l-blue-400';
          } else {
            timeText = format(eventDate, "dd/MM 'às' HH:mm");
          }

          const eventTypeText = event.type === 'consulta' ? 'Consulta' : 
                               event.type === 'banho' ? 'Banho' : 
                               event.type === 'tosa' ? 'Tosa' : 'Evento';

          notifications.push({
            id: `event_${event.id}`,
            title: event.title,
            description: `${eventTypeText} de ${pet?.name}`,
            timeText,
            petName: pet?.name,
            type: "event",
            date: eventDate,
            urgencyLevel,
            icon: <CalendarIcon className={`w-5 h-5 ${iconColor}`} />,
            bgColor,
            borderColor,
            linkTo: createPageUrl("Calendar")
          });
        }
      });

      // Processar lembretes
      userReminders.forEach(reminder => {
        const reminderDate = new Date(reminder.date);
        const hoursUntil = differenceInHours(reminderDate, now);
        const pet = petsData.find(p => p.id === reminder.pet_id);

        if (hoursUntil <= 72 && hoursUntil >= -24) {
          let urgencyLevel = 'normal';
          let timeText = '';
          let iconColor = 'text-purple-500'; // Default color for generic Bell icon
          let bgColor = 'bg-purple-50';
          let borderColor = 'border-l-purple-400';
          let tempIcon; // Temporarily store the icon component

          // Set initial icon and colors based on reminder type
          if (reminder.type === 'medicamento') {
            tempIcon = <Pill className={`w-5 h-5`} />;
            iconColor = 'text-green-500';
            bgColor = 'bg-green-50';
            borderColor = 'border-l-green-400';
          } else if (reminder.type === 'vacina') {
            tempIcon = <Syringe className={`w-5 h-5`} />;
            iconColor = 'text-red-500';
            bgColor = 'bg-red-50';
            borderColor = 'border-l-red-400';
          } else if (reminder.type === 'consulta') {
            tempIcon = <CalendarIcon className={`w-5 h-5`} />;
            iconColor = 'text-blue-500';
            bgColor = 'bg-blue-50';
            borderColor = 'border-l-blue-400';
          } else {
            tempIcon = <Bell className={`w-5 h-5`} />; // Default Bell icon
          }

          // Override colors and urgency based on time
          if (isPast(reminderDate)) {
            urgencyLevel = 'high';
            timeText = 'Atrasado';
            iconColor = 'text-red-500'; // Override for high urgency
            bgColor = 'bg-red-50';
            borderColor = 'border-l-red-400';
          } else if (isToday(reminderDate)) {
            urgencyLevel = 'high';
            timeText = `Hoje às ${format(reminderDate, "HH:mm")}`;
            iconColor = 'text-orange-500'; // Override for high urgency
            bgColor = 'bg-orange-50';
            borderColor = 'border-l-orange-400';
          } else if (isTomorrow(reminderDate)) {
            urgencyLevel = 'medium';
            timeText = `Amanhã às ${format(reminderDate, "HH:mm")}`;
            // iconColor, bgColor, borderColor remain as set by reminder type (or default)
          } else {
            timeText = format(reminderDate, "dd/MM 'às' HH:mm");
          }

          // Create the final icon with the determined color
          let finalIcon;
          if (reminder.type === 'medicamento') {
            finalIcon = <Pill className={`w-5 h-5 ${iconColor}`} />;
          } else if (reminder.type === 'vacina') {
            finalIcon = <Syringe className={`w-5 h-5 ${iconColor}`} />;
          } else if (reminder.type === 'consulta') {
            finalIcon = <CalendarIcon className={`w-5 h-5 ${iconColor}`} />;
          } else {
            finalIcon = <Bell className={`w-5 h-5 ${iconColor}`} />;
          }

          notifications.push({
            id: `reminder_${reminder.id}`,
            title: reminder.title,
            description: `Lembrete de ${pet?.name}`,
            timeText,
            petName: pet?.name,
            type: "reminder",
            date: reminderDate,
            urgencyLevel,
            icon: finalIcon,
            bgColor,
            borderColor,
            linkTo: createPageUrl("Reminders")
          });
        }
      });

      // Ordenar por prioridade e depois por data
      const sortedNotifications = notifications.sort((a, b) => {
        // Primeiro por urgência
        const urgencyOrder = { 'high': 0, 'medium': 1, 'normal': 2 };
        if (urgencyOrder[a.urgencyLevel] !== urgencyOrder[b.urgencyLevel]) {
          return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
        }
        // Depois por data
        return new Date(a.date) - new Date(b.date);
      });

      setNotifications(sortedNotifications);
      
      // Contar notificações não lidas (urgência alta e média)
      const unreadCount = sortedNotifications.filter(n => 
        n.urgencyLevel === 'high' || n.urgencyLevel === 'medium'
      ).length;
      
      onUnreadCountChange(unreadCount);

    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setNotifications([]);
      onUnreadCountChange(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="w-80 max-w-[90vw] bg-white rounded-lg shadow-lg border border-gray-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-500 ml-3">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="w-80 max-w-[90vw] max-h-[80vh] bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            {notifications.length > 0 && (
              <Badge className="bg-purple-100 text-purple-800 text-xs">
                {notifications.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="font-medium text-gray-700 mb-1">Nenhuma notificação</h4>
              <p className="text-sm text-gray-500">Quando houver lembretes ou eventos próximos, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={notification.linkTo}
                  onClick={onClose}
                  className="block hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className={`p-4 border-l-4 ${notification.borderColor} ${notification.bgColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm truncate pr-2">
                            {notification.title}
                          </h4>
                          {notification.urgencyLevel === 'high' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {notification.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${
                            notification.urgencyLevel === 'high' ? 'text-red-600' :
                            notification.urgencyLevel === 'medium' ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {notification.timeText}
                          </span>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <PawPrint className="w-3 h-3" />
                            <span className="truncate max-w-[80px]" title={notification.petName}>
                              {notification.petName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer com links rápidos */}
        <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-lg">
          <div className="flex justify-center gap-4">
            <Link
              to={createPageUrl("Calendar")}
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              <CalendarIcon className="w-3 h-3" />
              Ver agenda
            </Link>
            <Link
              to={createPageUrl("Reminders")}
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
              Ver lembretes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
