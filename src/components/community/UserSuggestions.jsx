import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UserProfile } from "@/api/entities/UserProfile";
import { UserFollow } from "@/api/entities/UserFollow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";

export default function UserSuggestions({ currentUser }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar quem o usuário já segue
      const follows = await UserFollow.filter({ follower_id: currentUser.id });
      const followingIds = follows.map(f => f.following_id);
      setFollowedUsers(followingIds);
      
      // Carregar todos os usuários para encontrar sugestões
      const [allUsers, allProfiles] = await Promise.all([
        User.list(),
        UserProfile.list()
      ]);
      
      // Filtrar sugestões (usuários que não são o atual e que não são seguidos)
      const suggestedUsers = allUsers
        .filter(user => user.id !== currentUser.id && !followingIds.includes(user.id))
        .map(user => {
          const profile = allProfiles.find(p => p.user_id === user.id);
          return { user, profile };
        })
        .slice(0, 3); // Limitando a 3 sugestões
      
      setSuggestions(suggestedUsers);
    } catch (error) {
      console.error("Erro ao carregar sugestões:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para seguir outros usuários.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await UserFollow.create({
        follower_id: currentUser.id,
        following_id: userId,
        status: "ativo"
      });
      
      // Atualizar estado local
      setFollowedUsers([...followedUsers, userId]);
      
      // Remover da lista de sugestões
      setSuggestions(suggestions.filter(s => s.user.id !== userId));
      
      toast({
        description: "Usuário seguido com sucesso!",
        duration: 2000,
      });
    } catch (error) {
      console.error("Erro ao seguir usuário:", error);
      
      toast({
        title: "Erro ao seguir",
        description: "Não foi possível seguir este usuário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Sugestões para Seguir
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map(({ user, profile }) => (
              <div key={user.id} className="flex items-center gap-3">
                <Link to={`${createPageUrl("UserProfile")}?id=${user.id}`}>
                  <img
                    src={profile?.profile_image || `https://ui-avatars.com/api/?name=${user.full_name}&background=8b5cf6&color=fff`}
                    alt={user.full_name}
                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`${createPageUrl("UserProfile")}?id=${user.id}`}
                    className="font-medium text-sm hover:text-purple-700 transition-colors"
                  >
                    {profile?.display_name || user.full_name}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">
                    {profile?.bio ? profile.bio.substring(0, 30) + "..." : "Usuário do PetCare+"}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8"
                  onClick={() => handleFollow(user.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span className="text-xs">Seguir</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Nenhuma sugestão disponível no momento.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}