import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function TimeSlotPicker({ slots, selectedSlot, onSelectSlot }) {
  // Agrupar os horários por período do dia
  const morningSlots = slots.filter(slot => {
    const hour = parseInt(slot.start_time.split(':')[0], 10);
    return hour >= 6 && hour < 12;
  });
  
  const afternoonSlots = slots.filter(slot => {
    const hour = parseInt(slot.start_time.split(':')[0], 10);
    return hour >= 12 && hour < 18;
  });
  
  const eveningSlots = slots.filter(slot => {
    const hour = parseInt(slot.start_time.split(':')[0], 10);
    return hour >= 18 && hour < 24;
  });
  
  const renderTimeSlots = (periodSlots, periodLabel) => {
    if (periodSlots.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center justify-start">
          <div className={cn(
            "w-3 h-3 rounded-full mr-2",
            periodLabel === "Manhã" ? "bg-yellow-400" : 
            periodLabel === "Tarde" ? "bg-orange-400" : 
            "bg-indigo-400"
          )}></div>
          {periodLabel}
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {periodSlots.map(slot => (
            <Button
              key={slot.id}
              variant={selectedSlot?.id === slot.id ? "default" : "outline"}
              className={`
                ${selectedSlot?.id === slot.id ? 
                  "bg-purple-700 hover:bg-purple-800 shadow-sm" : 
                  "hover:bg-purple-50 bg-white border-gray-200 hover:border-purple-200"
                }
                h-9 px-0 text-xs sm:text-sm transition-all rounded-full flex justify-center items-center
              `}
              onClick={() => onSelectSlot(slot)}
            >
              <Clock className="w-3 h-3 mr-0.5 flex-shrink-0" />
              {slot.start_time}
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <ScrollArea className="h-[320px] p-3 pr-6 bg-white rounded-lg">
      <div className="space-y-2 px-1">
        {renderTimeSlots(morningSlots, "Manhã")}
        {renderTimeSlots(afternoonSlots, "Tarde")}
        {renderTimeSlots(eveningSlots, "Noite")}
        
        {morningSlots.length === 0 && afternoonSlots.length === 0 && eveningSlots.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Clock className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-gray-500">Nenhum horário disponível para esta data</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}