
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Check, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GoogleCalendarSync({ events }) {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createCalendarFile = () => {
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PetCare+//Cão de Ló//PT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Eventos PetCare+ do Meu Pet",
      "X-WR-TIMEZONE:America/Sao_Paulo",
    ].join("\r\n") + "\r\n";

    events.forEach(event => {
      const startDate = new Date(event.date);
      const endDate = new Date(new Date(event.date).getTime() + (60 * 60 * 1000));
      
      const summary = `${event.title} (${event.type})`;
      const description = event.notes || "";
      const location = event.location || "Cão de Ló - Clínica Veterinária";
      
      icsContent += [
        "BEGIN:VEVENT",
        `UID:${event.id}@petcareplus.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
        `LOCATION:${location}`,
        "END:VEVENT",
      ].join("\r\n") + "\r\n";
    });

    icsContent += "END:VCALENDAR";
    
    return icsContent;
  };

  const formatICSDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const downloadCalendar = () => {
    const icsContent = createCalendarFile();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'eventos-pet.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSyncStatus("success");
    setTimeout(() => setIsDialogOpen(false), 2000);
  };

  const handleSyncWithGoogleCalendar = () => {
    downloadCalendar();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-blue-600 border-blue-200"
          onClick={() => setSyncStatus(null)}
        >
          <Calendar className="w-4 h-4" />
          <span>Sincronizar Calendário</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sincronizar Calendário</DialogTitle>
          <DialogDescription>
            Exporte os eventos dos seus pets para o Google Calendar ou Apple Calendar
          </DialogDescription>
        </DialogHeader>

        {syncStatus === "success" ? (
          <div className="py-6">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle>Exportado com sucesso!</AlertTitle>
              <AlertDescription>
                Arquivo de calendário foi baixado. Importe-o no seu aplicativo de calendário preferido.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="space-y-4 pt-4">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={handleSyncWithGoogleCalendar}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
                    alt="Google Calendar" 
                    className="w-5 h-5"
                  />
                  <span>Google Calendar</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={downloadCalendar}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/IcalIcon.png" 
                    alt="Apple Calendar" 
                    className="w-5 h-5"
                  />
                  <span>Apple Calendar</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={downloadCalendar}
              >
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>Baixar arquivo .ics</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <DialogFooter className="pt-4">
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
