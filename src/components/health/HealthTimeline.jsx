import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Activity, Heart, Clipboard, Syringe, Scale } from "lucide-react";

export default function HealthTimeline({ events }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'peso':
        return <Scale className="w-4 h-4 text-purple-500" />;
      case 'consulta':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'vacina':
        return <Syringe className="w-4 h-4 text-green-500" />;
      case 'atividade':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Clipboard className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linha do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {format(new Date(event.date), "dd MMM yyyy", { locale: ptBR })}
                    </Badge>
                    {event.value && (
                      <Badge className="bg-purple-100 text-purple-800">
                        {event.value}
                      </Badge>
                    )}
                  </div>
                  {event.notes && (
                    <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}