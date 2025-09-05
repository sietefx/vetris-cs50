
import React, { useState, useEffect } from "react";
import { Pet } from "@/api/entities";
import { PetUser } from "@/api/entities/PetUser";
import { User } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import PetPhotoUpload from "@/components/photo-upload/PetPhotoUpload";

export default function PetForm({ petId, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(petId ? true : false);
  const [currentUser, setCurrentUser] = useState(null);

  const form = useForm({
    defaultValues: {
      name: "",
      species: "cachorro",
      breed: "",
      birth_date: "",
      photo_url: "",
      background: "",
      allergies: "",
      health_condition: "",
      activity_level: "moderado",
    },
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    
    loadUser();
  }, []);

  useEffect(() => {
    if (petId) {
      loadPetData();
    }
  }, [petId]);

  const loadPetData = async () => {
    try {
      setInitialLoading(true);
      const pet = await Pet.get(petId);
      if (pet) {
        // Converter arrays para strings para o formulário
        const formValues = {
          ...pet,
          allergies: Array.isArray(pet.allergies) ? pet.allergies.join(", ") : pet.allergies,
          health_condition: Array.isArray(pet.health_condition) ? pet.health_condition.join(", ") : pet.health_condition,
        };
        form.reset(formValues);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do pet:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do pet.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const processArrayField = (fieldValue) => {
    if (!fieldValue) return [];
    if (Array.isArray(fieldValue)) return fieldValue;
    return fieldValue.split(",").map(item => item.trim()).filter(Boolean);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const processedData = {
        ...data,
        allergies: processArrayField(data.allergies),
        health_condition: processArrayField(data.health_condition),
      };

      let petResult;
      
      if (petId) {
        // Atualizar pet existente
        petResult = await Pet.update(petId, processedData);
      } else {
        // Criar novo pet
        petResult = await Pet.create(processedData);
        
        // Criar relação de proprietário entre o usuário atual e o novo pet
        if (petResult && petResult.id && currentUser) {
          try {
            await PetUser.create({
              pet_id: petResult.id,
              user_id: currentUser.id,
              user_email: currentUser.email,
              relationship_type: "owner",
              permissions: ["read", "write", "share", "manage"],
              added_by: currentUser.id,
              added_date: new Date().toISOString().split('T')[0],
              is_active: true
            });
          } catch (relationError) {
            console.error("Erro ao criar relação com o pet:", relationError);
            // Não impedir o fluxo principal se a criação da relação falhar
          }
        }
      }

      toast({
        title: petId ? "Pet atualizado" : "Pet adicionado",
        description: petId ? "As informações do pet foram atualizadas com sucesso." : "O pet foi adicionado com sucesso.",
      });

      if (onSuccess) {
        onSuccess(petResult);
      }
    } catch (err) {
      console.error("Erro ao salvar pet:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <span className="ml-3">Carregando...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da esquerda */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Pet <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Thor, Luna, Max" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espécie <span className="text-red-500">*</span></FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cachorro">Cachorro</SelectItem>
                      <SelectItem value="gato">Gato</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raça</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Labrador, SRD, Siamês" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      max={format(new Date(), "yyyy-MM-dd")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Atividade</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="muito_alto">Muito Alto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Coluna da direita */}
          <div className="space-y-6">
            <div>
              <Label>Foto do Pet</Label>
              <PetPhotoUpload
                value={form.watch("photo_url")}
                onChange={(url) => form.setValue("photo_url", url)}
              />
            </div>

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Separe por vírgulas (ex: frango, soja, pólen)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="health_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições de Saúde</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Separe por vírgulas (ex: diabetes, epilepsia)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>História e Características</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Conte um pouco sobre seu pet, sua personalidade, como chegou até você..."
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? "Salvando..." : petId ? "Atualizar Pet" : "Adicionar Pet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
