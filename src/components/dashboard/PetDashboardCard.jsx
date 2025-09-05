import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VetInvitation } from "@/api/entities";
import { 
  PawPrint, Calendar, Activity, Heart, Syringe, 
  Pill, AlertCircle, Edit, UserPlus, Link2 
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import InviteVetForm from "@/components/vets/InviteVetForm";

export default function PetDashboardCard({ pet, onClick, onEdit }) {
  const [showInviteVet, setShowInviteVet] = useState(false);
  const [hasLinkedVet, setHasLinkedVet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLinkedVet();
  }, [pet?.id]);

  const checkLinkedVet = async () => {
    if (!pet?.id) {
      setHasLinkedVet(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar convites aceitos para este pet
      const invitations = await VetInvitation.filter({
        status: "aceito"
      });

      // Verificar se existe convite aceito para este pet específico
      const petInvitation = invitations.find(invitation => 
        invitation.pets && 
        invitation.pets.some(p => p.pet_id === pet.id)
      );

      setHasLinkedVet(!!petInvitation);
    } catch (error) {
      console.error("Error checking linked vet:", error);
      setHasLinkedVet(false);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "Idade não informada";
    
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  const getUpcomingEvents = () => {
    // Esta função seria implementada com os dados reais de eventos/vacinas
    return [];
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div onClick={onClick}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log("✅ Dashboard pet photo loaded:", pet.name)}
                    onError={(e) => {
                      console.error("❌ Dashboard pet photo failed:", pet.name, pet.photo_url);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-purple-100">
                          <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-100">
                    <PawPrint className="w-8 h-8 text-purple-500" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold mb-1 group-hover:text-purple-600 transition-colors">
                  {pet.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-2">
                  {pet.species === 'cachorro' ? 'Cachorro' : 
                   pet.species === 'gato' ? 'Gato' : 
                   pet.species} • {pet.breed || 'SRD'}
                </p>
                {pet.birth_date && (
                  <p className="text-xs text-gray-500">
                    Nascimento: {format(new Date(pet.birth_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </div>

        <CardContent className="pt-0">
          {/* Indicadores de saúde */}
          {upcomingEvents.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Próximos eventos</span>
              </div>
              <div className="space-y-1">
                {upcomingEvents.slice(0, 2).map((event, idx) => (
                  <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                    {event.type === 'vaccine' ? <Syringe className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    {event.title} - {format(new Date(event.date), "dd/MM")}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pet);
              }}
              className="w-full justify-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Pet
            </Button>

            {/* Botão de convidar veterinário - só aparece se não há vet vinculado */}
            {!loading && !hasLinkedVet && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInviteVet(true);
                }}
                className="w-full justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Convidar Veterinário
              </Button>
            )}

            {/* Mostrar se tem veterinário vinculado */}
            {!loading && hasLinkedVet && (
              <div className="text-center py-2">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Veterinário vinculado
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de convite */}
      {showInviteVet && (
        <InviteVetForm
          petId={pet.id}
          petName={pet.name}
          isOpen={showInviteVet}
          onClose={() => setShowInviteVet(false)}
          onSuccess={() => {
            setShowInviteVet(false);
            checkLinkedVet(); // Recarregar status do veterinário
          }}
        />
      )}
    </>
  );
}