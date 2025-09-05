import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, Reply, Camera, X, Loader2, AlertCircle } from "lucide-react";
import { Comment } from "@/api/entities/Comment";
import { CommentLike } from "@/api/entities/CommentLike";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CommentsList({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [likedComments, setLikedComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const fetchedComments = await Comment.filter({ post_id: postId }, "-created_date");
      
      // Organize comments into threads
      const commentThreads = [];
      const childComments = {};
      
      // Group child comments by parent
      fetchedComments.forEach(comment => {
        if (comment.parent_id) {
          if (!childComments[comment.parent_id]) {
            childComments[comment.parent_id] = [];
          }
          childComments[comment.parent_id].push(comment);
        }
      });
      
      // Add only parent comments to the main list
      fetchedComments.forEach(comment => {
        if (!comment.parent_id) {
          comment.replies = childComments[comment.id] || [];
          commentThreads.push(comment);
        }
      });
      
      setComments(commentThreads);
      
      // Get liked comments
      await checkLikedComments(fetchedComments);
      
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const checkLikedComments = async (commentsList) => {
    try {
      if (!user) return;
      
      const commentIds = commentsList.map(c => c.id);
      
      // Verificar todos comentários que o usuário curtiu
      const likes = await CommentLike.filter({ user_id: user.id });
      
      const likedMap = {};
      likes.forEach(like => {
        if (commentIds.includes(like.comment_id)) {
          likedMap[like.comment_id] = true;
        }
      });
      
      setLikedComments(likedMap);
    } catch (error) {
      console.error("Erro ao verificar comentários curtidos:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() && !photoFile) {
      setError("Digite um comentário ou adicione uma foto");
      return;
    }
    
    setLoading(true);
    
    try {
      // Fazer upload da foto, se houver
      let photoUrl = "";
      
      if (photoFile) {
        const { UploadFile } = await import("@/api/integrations");
        const response = await UploadFile({ file: photoFile });
        photoUrl = response.file_url;
      }
      
      // Criar o comentário
      await Comment.create({
        post_id: postId,
        user_id: user.id,
        content: commentText,
        photo_url: photoUrl,
        parent_id: replyingTo
      });
      
      // Limpar o formulário
      setCommentText("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setReplyingTo(null);
      
      // Recarregar comentários
      await loadComments();
      
    } catch (error) {
      console.error("Erro ao publicar comentário:", error);
      setError("Ocorreu um erro ao publicar seu comentário.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      if (likedComments[commentId]) {
        // Implementação futura: remover like
        
        // Atualizar estado local
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes_count: Math.max(0, (comment.likes_count || 0) - 1)
              };
            }
            
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    likes_count: Math.max(0, (reply.likes_count || 0) - 1)
                  };
                }
                return reply;
              });
              
              return {
                ...comment,
                replies: updatedReplies
              };
            }
            
            return comment;
          });
        });
        
        setLikedComments(prev => ({
          ...prev,
          [commentId]: false
        }));
        
      } else {
        // Adicionar like
        await CommentLike.create({
          comment_id: commentId,
          user_id: user.id
        });
        
        // Atualizar estado local
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes_count: (comment.likes_count || 0) + 1
              };
            }
            
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    likes_count: (reply.likes_count || 0) + 1
                  };
                }
                return reply;
              });
              
              return {
                ...comment,
                replies: updatedReplies
              };
            }
            
            return comment;
          });
        });
        
        setLikedComments(prev => ({
          ...prev,
          [commentId]: true
        }));
      }
    } catch (error) {
      console.error("Erro ao curtir comentário:", error);
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB");
      return;
    }

    setPhotoFile(file);
    
    // Criar uma prévia da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
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

  const renderCommentForm = () => (
    <div className={`flex ${replyingTo ? 'pl-12 mt-4' : 'mt-6'}`}>
      <Avatar className="h-8 w-8 mr-3">
        <AvatarImage src={user?.avatar} alt={user?.full_name} />
        <AvatarFallback className="bg-purple-100 text-purple-700">
          {user?.full_name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        {replyingTo && (
          <div className="mb-2 flex items-center">
            <span className="text-sm text-gray-500">Respondendo a um comentário</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 ml-2 text-gray-500 hover:text-gray-700"
              onClick={cancelReply}
            >
              Cancelar
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Escreva um comentário..."
            className="resize-none focus:border-purple-300 focus:ring-purple-500 min-h-[60px] py-2 text-sm"
          />
          
          {photoPreview && (
            <div className="relative">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                onClick={removePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => document.getElementById("comment-photo").click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                id="comment-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            
            <Button 
              type="submit" 
              size="sm"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : "Comentar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`flex ${isReply ? 'mt-3 pl-12' : 'mt-6'}`}>
      <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
        <AvatarImage src={comment.user_avatar} alt={comment.user_name} />
        <AvatarFallback className="bg-purple-100 text-purple-700">
          {comment.user_name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium text-sm">{comment.user_name || "Usuário"}</div>
            <div className="text-xs text-gray-500">{formatDate(comment.created_date)}</div>
          </div>
          
          <div className="text-gray-800 whitespace-pre-line text-sm">{comment.content}</div>
          
          {comment.photo_url && (
            <div className="mt-2">
              <img 
                src={comment.photo_url} 
                alt="Imagem do comentário" 
                className="max-h-48 rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mt-1 ml-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 h-6 px-2 text-xs ${likedComments[comment.id] ? "text-red-500" : "text-gray-600"}`}
            onClick={() => handleLikeComment(comment.id)}
          >
            <Heart className={`h-3.5 w-3.5 ${likedComments[comment.id] ? "fill-red-500" : ""}`} />
            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 h-6 px-2 text-xs text-gray-600"
            onClick={() => handleReply(comment.id)}
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Responder</span>
          </Button>
        </div>
        
        {replyingTo === comment.id && renderCommentForm()}
        
        {/* Renderizar respostas (se houver) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">Comentários</h3>
      
      {user ? renderCommentForm() : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Faça login para comentar</p>
        </div>
      )}
      
      {loadingComments ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="my-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      )}
    </div>
  );
}