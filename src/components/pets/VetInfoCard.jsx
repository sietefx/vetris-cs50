import React, { useState, useEffect } from 'react';
import { VetInvitation } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Mail, Phone, MapPin, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function VetInfoCard({ petId }) {
  const [linkedVet, setLinkedVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (petId) {
      loadLinkedVet();
    }
  }, [petId]);

  const loadLinkedVet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar convites aceitos para este pet
      const invitations = await VetInvitation.filter({
        status: "aceito"
      }).catch(() => []);

      // Encontrar convite que inclui este pet específico
      const petInvitation = invitations.find(invitation => 
        invitation.pets && 
        Array.isArray(invitation.pets) &&
        invitation.pets.some(p => p.pet_id === petId)
      );

      if (petInvitation) {
        setLinkedVet({
          name: petInvitation.vet_name,
          email: petInvitation.vet_email,
          linkedSince: petInvitation.response_date || petInvitation.created_date,
          invitationId: petInvitation.id,
          permissions: petInvitation.permissions || {}
        });
      } else {
        setLinkedVet(null);
      }
    } catch (error) {
      console.error("Erro ao carregar veterinário vinculado:", error);
      setError("Erro ao carregar informações do veterinário");
      setLinkedVet(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!linkedVet) {
    return (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Nenhum veterinário vinculado</p>
            <p className="text-xs text-yellow-600">Convide um veterinário para acompanhar este pet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Veterinário
                </Badge>
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                  Ativo
                </Badge>
              </div>
              
              <h4 className="font-semibold text-green-800 truncate">
                Dr(a). {linkedVet.name}
              </h4>
              
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{linkedVet.email}</span>
                </div>
                
                {linkedVet.linkedSince && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Vinculado desde {format(new Date(linkedVet.linkedSince), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
              </div>

              {/* Permissões */}
              {linkedVet.permissions && Object.keys(linkedVet.permissions).length > 0 && (
                <div className="mt-3 pt-2 border-t border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-2">Permissões:</p>
                  <div className="flex flex-wrap gap-1">
                    {linkedVet.permissions.view_history && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                        Ver histórico
                      </Badge>
                    )}
                    {linkedVet.permissions.add_records && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                        Adicionar registros
                      </Badge>
                    )}
                    {linkedVet.permissions.modify_records && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                        Modificar registros
                      </Badge>
                    )}
                    {linkedVet.permissions.receive_notifications && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                        Notificações
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}