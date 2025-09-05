
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { PawPrint, ChevronRight, Link2 } from "lucide-react";
import { differenceInYears } from "date-fns";
import InviteVetForm from "@/components/vets/InviteVetForm";

// NOTE: The `VetInvitation` class/service is not defined in the provided original file.
// It is assumed to be an external dependency that should be imported or globally available.
// For example: `import { VetInvitation } from "@/services/vetInvitationService";`
// A mock definition is provided here for compilation purposes.
class VetInvitation {
  static async filter({ status }) {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    console.warn("Using mock VetInvitation.filter. In a real application, ensure to import/define the actual service.");
    // Return an empty array for accepted invitations by default in mock
    // to simulate no linked vet, allowing the "Convidar Veterinário" button to show.
    return [];
  }
}

export default function PetHealthCard({ pet }) {
  const [showInviteVet, setShowInviteVet] = useState(false);
  const [hasLinkedVet, setHasLinkedVet] = useState(false);
  const [linkedVetLoading, setLinkedVetLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(80); // State to manage healthScore, initialized to 80

  const getAge = (birthDate) => {
    if (!birthDate) return null;
    const age = differenceInYears(new Date(), new Date(birthDate));
    return `${age} ${age === 1 ? 'ano' : 'anos'}`;
  };

  const loadHealthData = async () => {
    // This function can be expanded to fetch actual health data for the pet
    // and update the healthScore state, e.g.: setHealthScore(actualScore);
    // For now, it maintains the initial 80.
  };

  const checkLinkedVet = async () => {
    if (!pet?.id) {
      setHasLinkedVet(false);
      setLinkedVetLoading(false);
      return;
    }

    try {
      setLinkedVetLoading(true);
      
      // Use the actual VetInvitation service/model here.
      // This assumes `VetInvitation` is either imported or globally available.
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
      setLinkedVetLoading(false);
    }
  };

  useEffect(() => {
    if (pet?.id) {
      loadHealthData(); // Existing function call, assuming it updates healthScore if needed
      checkLinkedVet();
    }
  }, [pet?.id]);

  return (
    <>
      <Card className="overflow-hidden shadow-sm border rounded-xl">
        <div className="flex flex-col md:flex-row">
          {/* Coluna da imagem - ocupa 40% do espaço */}
          <div className="w-full md:w-2/5 h-48 md:h-auto relative">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-mint-50">
                <PawPrint className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Coluna das informações - ocupa 60% do espaço */}
          <div className="w-full md:w-3/5 p-6 flex flex-col">
            {/* Shadcn CardHeader for pet health title and invite vet button */}
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold">Saúde de {pet.name}</CardTitle>
              {!linkedVetLoading && !hasLinkedVet && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteVet(true)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  Convidar Veterinário
                </Button>
              )}
            </CardHeader>

            {/* Shadcn CardContent for other details like species, health score, age, weight, and history button */}
            <CardContent className="p-0 flex-grow relative">
              {/* Pet's species and breed info */}
              <p className="text-gray-500 mb-4">
                {pet.species === 'cachorro' ? 'cachorro' : 
                 pet.species === 'gato' ? 'gato' : 'outro'} • {pet.breed || 'SRD'}
              </p>

              {/* Índice de Saúde - positioned absolutely to the top right within CardContent */}
              <div className="absolute top-0 right-0 text-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16">
                    <circle
                      className="text-gray-100"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                    />
                    <circle
                      className="text-green-500"
                      strokeWidth="5"
                      strokeDasharray={`${(healthScore * 188.5) / 100} 188.5`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold inset-0 flex items-center justify-center">
                    {healthScore}
                  </span>
                </div>
                <span className="text-xs text-gray-500 block mt-1">
                  Índice de<br />Saúde
                </span>
              </div>

              {/* Grid for Age and Weight, adjusted margin-top to avoid overlapping with health score */}
              <div className="grid grid-cols-2 gap-4 mb-6 mt-16">
                <div>
                  <p className="text-gray-500">Idade</p>
                  <p className="font-medium">
                    {getAge(pet.birth_date) || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Peso</p>
                  <p className="font-medium">
                    {pet.weight ? `${pet.weight} kg` : 'Não informado'}
                  </p>
                </div>
              </div>

              {/* View Health History Button */}
              <div className="mt-auto">
                <Link to={createPageUrl(`Health?pet=${pet.id}`)}>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    Ver Histórico de Saúde
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Modal de convite de veterinário */}
      {showInviteVet && (
        <InviteVetForm
          petId={pet.id}
          petName={pet.name}
          isOpen={showInviteVet}
          onClose={() => setShowInviteVet(false)}
          onSuccess={() => {
            setShowInviteVet(false);
            checkLinkedVet(); // Recarregar status do veterinário após sucesso
          }}
        />
      )}
    </>
  );
}
