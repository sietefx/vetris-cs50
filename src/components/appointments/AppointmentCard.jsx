import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, Clock, MapPin, Video, PawPrint, FileText, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AppointmentCard({ 
  appointment, 
  pet, 
  vet, 
  onCancel, 
  onReschedule, 
  onViewDetails, 
  isUpcoming = false 
}) {
  const getStatusBadge = () => {
    switch (appointment.status) {
      case "agendada":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Agendada</Badge>;
      case "confirmada":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Confirmada</Badge>;
      case "concluida":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Concluída</Badge>;
      case "cancelada":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Cancelada</Badge>;
      case "remarcada":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Remarcada</Badge>;
      case "na_sala_espera":
        return <Badge variant="outline" className="bg-cyan-50 text-cyan-700">Na sala de espera</Badge>;
      default:
        return null;
    }
  };
  
  const getAppointmentTypeBadge = () => {
    switch (appointment.type) {
      case "consulta_regular":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Consulta Regular</Badge>;
      case "emergencia":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Emergência</Badge>;
      case "vacina":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Vacinação</Badge>;
      case "exame":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Exames</Badge>;
      case "cirurgia":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Pré-Cirúrgica</Badge>;
      case "acompanhamento":
        return <Badge variant="outline" className="bg-cyan-50 text-cyan-700">Acompanhamento</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      isUpcoming ? "border-l-4 border-l-purple-500" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {getStatusBadge()}
              {getAppointmentTypeBadge()}
              {appointment.is_online && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                  <Video className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 rounded-full border">
                  <AvatarImage src={vet?.photo_url} alt={vet?.full_name} />
                  <AvatarFallback className="bg-purple-100 text-purple-800">
                    {vet?.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{vet?.full_name}</p>
                  <p className="text-xs text-gray-500">{vet?.specialty}</p>
                </div>
              </div>
              
              {pet && (
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-medium">{pet.name}</p>
                    <p className="text-xs text-gray-500">
                      {pet.species === "cachorro" ? "Cão" : 
                       pet.species === "gato" ? "Gato" : 
                       pet.species}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>{format(new Date(appointment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{format(new Date(appointment.date), "HH:mm", { locale: ptBR })}</span>
              </div>
              
              {!appointment.is_online && (
                <div className="flex items-center gap-1 text-gray-600 md:col-span-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>{appointment.clinic_address}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Área de botões ajustada para melhor visualização */}
          <div className="flex md:flex-col gap-2 items-center justify-end mt-3 md:mt-0 md:min-w-[120px]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(appointment)}
              className="flex-1 w-full justify-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Detalhes
            </Button>
            
            {isUpcoming && appointment.status !== "cancelada" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReschedule(appointment)}
                  className="flex-1 w-full justify-center border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Remarcar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(appointment)}
                  className="flex-1 w-full justify-center border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}