import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users as UsersIcon,
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  PawPrint,
  Filter,
  RefreshCw,
  AlertTriangle,
  Eye,
  Edit
} from "lucide-react";
import { format } from "date-fns";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);
      
      // Apenas admins podem ver esta página
      if (userData.role !== "admin") {
        window.location.href = "/";
        return;
      }
      
      await loadUsers();
    } catch (error) {
      console.error("Erro na autenticação:", error);
      window.location.href = "/";
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allUsers = await User.list();
      setUsers(allUsers || []);
      
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === "all" ||
      (filterType === "tutor" && user.user_type === "tutor") ||
      (filterType === "veterinario" && user.user_type === "veterinario") ||
      (filterType === "admin" && user.role === "admin");
    
    return matchesSearch && matchesFilter;
  });

  const getUserTypeIcon = (userType) => {
    if (userType === "veterinario") {
      return <Stethoscope className="w-4 h-4 text-blue-600" />;
    }
    return <PawPrint className="w-4 h-4 text-purple-600" />;
  };

  const getUserTypeColor = (userType) => {
    if (userType === "veterinario") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciamento de Usuários
              </h1>
              <p className="text-gray-600">
                {users.length} usuários registrados
              </p>
            </div>
          </div>
          <Button onClick={loadUsers} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </header>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                size="sm"
              >
                Todos ({users.length})
              </Button>
              <Button
                variant={filterType === "tutor" ? "default" : "outline"}
                onClick={() => setFilterType("tutor")}
                size="sm"
              >
                <PawPrint className="w-4 h-4 mr-1" />
                Tutores ({users.filter(u => u.user_type === "tutor").length})
              </Button>
              <Button
                variant={filterType === "veterinario" ? "default" : "outline"}
                onClick={() => setFilterType("veterinario")}
                size="sm"
              >
                <Stethoscope className="w-4 h-4 mr-1" />
                Veterinários ({users.filter(u => u.user_type === "veterinario").length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                        {getUserTypeIcon(user.user_type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.full_name || "Nome não informado"}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Badge 
                    variant="outline" 
                    className={getUserTypeColor(user.user_type)}
                  >
                    {user.user_type === "veterinario" ? "Veterinário" : "Tutor"}
                  </Badge>
                  {user.role === "admin" && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="space-y-2 text-sm text-gray-600">
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                {user.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{user.address}</span>
                  </div>
                )}

                {user.user_type === "veterinario" && user.crmv && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>CRMV: {user.crmv} - {user.crmv_uf}</span>
                  </div>
                )}

                {user.user_type === "veterinario" && user.clinic_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{user.clinic_name}</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    Registrado em {format(new Date(user.created_date), "dd/MM/yyyy")}
                  </span>
                </div>

                {/* Status do perfil */}
                <div className="flex gap-2 pt-2">
                  {user.profile_setup_complete ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      ✓ Perfil completo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                      ⚠ Perfil incompleto
                    </Badge>
                  )}
                  
                  {user.user_type === "veterinario" && (
                    user.vet_onboarding_complete ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        ✓ Vet setup
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                        ⚠ Vet incompleto
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== "all" 
                ? "Ajuste os filtros para ver mais usuários"
                : "Não há usuários cadastrados no sistema"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tutores</p>
                <p className="text-xl font-bold">
                  {users.filter(u => u.user_type === "tutor").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Veterinários</p>
                <p className="text-xl font-bold">
                  {users.filter(u => u.user_type === "veterinario").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Perfis Completos</p>
                <p className="text-xl font-bold">
                  {users.filter(u => u.profile_setup_complete).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}