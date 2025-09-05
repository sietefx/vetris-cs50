
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Heart, MessageSquare, MoreHorizontal, Share2, PawPrint, 
  ShieldAlert, BookOpen, HelpCircle, ThumbsUp 
} from "lucide-react";
import { PostLike } from "@/api/entities/PostLike";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostCard({ post, user, onView, onToggleLike, isLiked = false }) {
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(isLiked);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const categoryLabels = {
    saude: "Saúde",
    comportamento: "Comportamento",
    alimentacao: "Alimentação",
    cuidados: "Cuidados",
    treinamento: "Treinamento",
    outro: "Outro"
  };

  const categoryColors = {
    saude: "bg-red-100 text-red-800",
    comportamento: "bg-blue-100 text-blue-800",
    alimentacao: "bg-green-100 text-green-800",
    cuidados: "bg-purple-100 text-purple-800",
    treinamento: "bg-amber-100 text-amber-800",
    outro: "bg-gray-100 text-gray-800"
  };

  const typeIcons = {
    dica: <PawPrint className="w-4 h-4 mr-1" />,
    historia: <BookOpen className="w-4 h-4 mr-1" />,
    pergunta: <HelpCircle className="w-4 h-4 mr-1" />,
    recomendacao: <ThumbsUp className="w-4 h-4 mr-1" />
  };

  const typeLabels = {
    dica: "Dica",
    historia: "História",
    pergunta: "Pergunta",
    recomendacao: "Recomendação"
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch (error) {
      return "recentemente";
    }
  };

  const handleLikeClick = async () => {
    try {
      if (liked) {
        // Implementação futura: remover like
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await PostLike.create({
          post_id: post.id,
          user_id: user.id
        });
        setLikesCount(prev => prev + 1);
      }
      
      setLiked(!liked);
      if (onToggleLike) onToggleLike(post.id, !liked);
    } catch (error) {
      console.error("Erro ao curtir post:", error);
    }
  };

  const formatContent = (content) => {
    if (!content) return "";
    
    // Limitar o conteúdo para exibição no card
    if (content.length > 200) {
      return content.substring(0, 200) + "...";
    }
    
    return content;
  };

  return (
    <Card className="mb-4 overflow-hidden bg-white hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={post.user_avatar} alt={post.user_name} />
              <AvatarFallback className="bg-purple-100 text-purple-700">
                {post.user_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{post.user_name || "Usuário"}</div>
              <div className="text-xs text-gray-500">{formatDate(post.created_date)}</div>
            </div>
          </div>
          
          <DropdownMenu open={optionsOpen} onOpenChange={setOptionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" /> Compartilhar
              </DropdownMenuItem>
              {user && user.id !== post.user_id && (
                <DropdownMenuItem className="text-red-600">
                  <ShieldAlert className="w-4 h-4 mr-2" /> Denunciar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {post.type && (
            <Badge variant="outline" className="flex items-center gap-1 border-gray-300">
              {typeIcons[post.type] || <PawPrint className="w-4 h-4 mr-1" />}
              {typeLabels[post.type] || "Post"}
            </Badge>
          )}
          
          {post.category && (
            <Badge className={`${categoryColors[post.category] || "bg-gray-100 text-gray-800"}`}>
              {categoryLabels[post.category] || post.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-0">
        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        <p className="text-gray-700 whitespace-pre-line">{formatContent(post.content)}</p>
        
        {post.photo_url && (
          <div 
            className="mt-3 rounded-md overflow-hidden border border-gray-200"
            onClick={() => onView && onView(post)}
          >
            <img 
              src={post.photo_url} 
              alt={post.title}
              className="w-full h-auto max-h-64 object-cover cursor-pointer"
            />
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="py-3 px-6 flex justify-between">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 h-8 px-2 ${liked ? "text-red-500" : "text-gray-600"}`}
            onClick={handleLikeClick}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
            <span>{likesCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 h-8 px-2 text-gray-600"
            onClick={() => onView && onView(post)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments_count || 0}</span>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-purple-600 font-medium"
          onClick={() => onView && onView(post)}
        >
          Leia mais
        </Button>
      </CardFooter>
    </Card>
  );
}
