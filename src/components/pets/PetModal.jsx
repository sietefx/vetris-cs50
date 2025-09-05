import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, differenceInYears } from "date-fns";
import {
  PawPrint, Calendar, Heart, Activity, Edit, Phone, BookOpen, AlertTriangle, Link2, X
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import VetInfoCard from "@/components/pets/VetInfoCard";

export default function PetModal({ pet, isOpen, onClose, onEdit }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        console.log('🔄 [PetModal] Fechando modal via tecla ESC');
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return "Idade não informada";
    
    const years = differenceInYears(new Date(), new Date(birthDate));
    const days = differenceInDays(new Date(), new Date(birthDate));
    
    if (years === 0) {
      const months = Math.floor(days / 30.44);
      if (months > 0) {
        return `${months} ${months === 1 ? 'mês' : 'meses'}`;
      }
      return `${days} dias`;
    } else if (years === 1) {
      return "1 ano";
    } else {
      return `${years} anos`;
    }
  };

  if (!pet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🔄 [PetModal] Dialog onOpenChange:', open);
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        onInteractOutside={(e) => {
          console.log('🔄 [PetModal] Clique fora do modal detectado');
          onClose();
        }}
      >
        {/* Botão fechar mobile */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white shadow-sm border p-1"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>

        <DialogHeader className="mb-8">
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PawPrint className="w-6 h-6 text-purple-600" />
              <span className="text-lg sm:text-xl">Perfil de {pet.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(pet)}
                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Edit className="w-4 h-4" />
                Editar Pet
              </Button>

              <Link to={createPageUrl("VetManagement")}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 w-full sm:w-auto"
                  onClick={onClose}
                >
                  <Link2 className="w-4 h-4" />
                  Gerenciar Veterinários
                </Button>
              </Link>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Foto e Informações Básicas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Foto do Pet */}
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 border-4 border-purple-100">
                {pet.photo_url && !imageError ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-100">
                    <PawPrint className="w-20 h-20 text-purple-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Informações Básicas */}
            <Card className="border-purple-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-purple-800">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Espécie:</span>
                    <p className="font-medium capitalize">{pet.species || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Raça:</span>
                    <p className="font-medium">{pet.breed || 'SRD'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Idade:</span>
                    <p className="font-medium">{calculateAge(pet.birth_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Peso:</span>
                    <p className="font-medium">{pet.weight ? `${pet.weight} kg` : 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cor:</span>
                    <p className="font-medium">{pet.color || 'Não informada'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Porte:</span>
                    <p className="font-medium capitalize">{pet.size || 'Não informado'}</p>
                  </div>
                </div>

                {pet.is_neutered && (
                  <div className="pt-3 border-t">
                    <Badge className="bg-green-100 text-green-800">
                      Castrado
                      {pet.neutering_date && ` em ${new Date(pet.neutering_date).toLocaleDateString()}`}
                    </Badge>
                  </div>
                )}

                {pet.microchip_number && (
                  <div className="pt-3 border-t">
                    <span className="text-gray-500">Microchip:</span>
                    <p className="font-mono text-sm">{pet.microchip_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <Link to={createPageUrl("Health") + `?pet=${pet.id}`}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Saúde</span>
                </Button>
              </Link>
              <Link to={createPageUrl("Calendar") + `?pet=${pet.id}`}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Agenda</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Detalhes Expandidos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Histórico e Características */}
            {pet.background && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    História do Pet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{pet.background}</p>
                </CardContent>
              </Card>
            )}

            {/* Saúde */}
            {(pet.health_condition?.length > 0 || pet.allergies?.length > 0 || pet.medications?.length > 0) && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Informações de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pet.health_condition?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Condições de Saúde:</h4>
                      <div className="flex flex-wrap gap-2">
                        {pet.health_condition.map((condition, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {pet.allergies?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Alergias:</h4>
                      <div className="flex flex-wrap gap-2">
                        {pet.allergies.map((allergy, index) => (
                          <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {pet.medications?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Medicamentos:</h4>
                      <div className="flex flex-wrap gap-2">
                        {pet.medications.map((medication, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Temperamento */}
            {pet.temperament?.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Temperamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pet.temperament.map((trait, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Veterinário */}
            {(pet.veterinarian_name || pet.veterinarian_phone) && (
              <VetInfoCard
                vetName={pet.veterinarian_name}
                vetPhone={pet.veterinarian_phone}
              />
            )}

            {/* Preferências */}
            {(pet.favorite_foods?.length > 0 || pet.dislikes?.length > 0) && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Preferências</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pet.favorite_foods?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Comidas Favoritas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {pet.favorite_foods.map((food, index) => (
                          <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {food}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {pet.dislikes?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Não Gosta:</h4>
                      <div className="flex flex-wrap gap-2">
                        {pet.dislikes.map((dislike, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {dislike}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cuidados Especiais */}
            {(pet.special_needs || pet.grooming_notes || pet.exercise_needs) && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Cuidados Especiais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pet.special_needs && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Necessidades Especiais:</h4>
                      <p className="text-gray-700">{pet.special_needs}</p>
                    </div>
                  )}

                  {pet.grooming_notes && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Cuidados com Higiene:</h4>
                      <p className="text-gray-700">{pet.grooming_notes}</p>
                    </div>
                  )}

                  {pet.exercise_needs && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Necessidades de Exercício:</h4>
                      <p className="text-gray-700">{pet.exercise_needs}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contato de Emergência */}
            {(pet.emergency_contact || pet.emergency_phone) && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pet.emergency_contact && (
                      <p className="text-red-800">
                        <span className="font-medium">Nome:</span> {pet.emergency_contact}
                      </p>
                    )}
                    {pet.emergency_phone && (
                      <p className="text-red-800 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">Telefone:</span> {pet.emergency_phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}