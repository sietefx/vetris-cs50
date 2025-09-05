import React, { useState, useEffect } from "react";
import { VetInvitation } from "@/api/entities";
import { Pet } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  X,
  ArrowLeft,
  Stethoscope,
  AlertTriangle,
  RefreshCw,
  Link2,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import InviteVetForm from "@/components/vets/InviteVetForm";

export default function VetManagement() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // ✅ Prevent updates after unmount

    const loadData = async () => {
      try {
        const userData = await User.me();
        if (!isMounted) return; // ✅ Check if still mounted
        
        if (!userData) {
          setTimeout(() => {
            window.location.href = createPageUrl("Welcome");
          }, 100);
          return;
        }

        if (userData.user_type === "veterinario") {
          setTimeout(() => {
            window.location.href = createPageUrl("VetDashboard");
          }, 100);
          return;
        }

        setUser(userData);

        // Load pets and invitations
        const [petsData, invitationsData] = await Promise.all([
          Pet.filter({ created_by: userData.email }).catch(() => []),
          VetInvitation.filter({ pet_owner_email: userData.email }).catch(() => [])
        ]);

        if (isMounted) {
          setPets(petsData);
          setInvitations(invitationsData);
          setLoading(false);
        }

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        if (isMounted) {
          setError("Erro ao carregar dados");
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false; // ✅ Cleanup
    };
  }, []);

  const handleInviteSuccess = async () => {
    setShowInviteForm(false);
    
    try {
      const invitationsData = await VetInvitation.filter({ 
        pet_owner_email: user.email 
      });
      setInvitations(invitationsData);
    } catch (err) {
      console.error("Erro ao recarregar convites:", err);
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    if (!confirm("Tem certeza que deseja cancelar este convite?")) return;

    try {
      await VetInvitation.delete(inviteId);
      setInvitations(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (err) {
      console.error("Erro ao deletar convite:", err);
      setError("Erro ao cancelar convite");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      'aceito': { color: 'bg-green-100 text-green-800', text: 'Aceito' },
      'recusado': { color: 'bg-red-100 text-red-800', text: 'Recusado' },
      'cancelado': { color: 'bg-gray-100 text-gray-800', text: 'Cancelado' },
      'expirado': { color: 'bg-red-100 text-red-800', text: 'Expirado' }
    };

    const config = statusConfig[status] || statusConfig['pendente'];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aceito':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'recusado':
      case 'cancelado':
      case 'expirado':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to={createPageUrl("Home")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Veterinários
              </h1>
              <p className="text-gray-600">
                Convide e gerencie veterinários para seus pets
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowInviteForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Veterinário
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pets</p>
                  <p className="text-3xl font-bold text-gray-900">{pets.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Convites Enviados</p>
                  <p className="text-3xl font-bold text-gray-900">{invitations.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Veterinários Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {invitations.filter(inv => inv.status === 'aceito').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invitations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              Convites de Veterinários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum veterinário convidado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece convidando um veterinário para acompanhar seus pets
                </p>
                <Button
                  onClick={() => setShowInviteForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar Primeiro Veterinário
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {getStatusIcon(invitation.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Dr(a). {invitation.vet_name}
                            </h3>
                            {getStatusBadge(invitation.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {invitation.vet_email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Enviado em {new Date(invitation.invitation_date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          {invitation.pets && invitation.pets.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Pets vinculados:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {invitation.pets.map((pet, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {pet.pet_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {invitation.message && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              <strong>Mensagem:</strong> {invitation.message}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {invitation.status === 'pendente' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implementar reenvio
                                alert("Função de reenvio será implementada em breve");
                              }}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Reenviar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInvite(invitation.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {invitation.status === 'aceito' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implementar edição de permissões
                              alert("Configurações serão implementadas em breve");
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Configurar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <InviteVetForm
            isOpen={showInviteForm}
            onClose={() => setShowInviteForm(false)}
            onSuccess={handleInviteSuccess}
            availablePets={pets}
          />
        )}
      </div>
    </div>
  );
}