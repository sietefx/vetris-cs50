
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Video } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function AppointmentForm({ 
  pets, 
  selectedPet, 
  onSelectPet,
  appointmentType,
  onChangeType,
  isOnline,
  onChangeMode,
  reason,
  onChangeReason,
  notes,
  onChangeNotes,
  symptoms,
  onToggleSymptom,
  vetSupportsOnline = true
}) {
  const commonSymptoms = [
    "Vômito", "Diarreia", "Falta de apetite", "Letargia", "Tosse",
    "Espirros", "Coceira excessiva", "Problemas de pele", "Dificuldade respiratória",
    "Febre", "Dor ao urinar", "Claudicação", "Comportamento anormal"
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pet">Selecione o pet</Label>
        <Select 
          value={selectedPet} 
          onValueChange={onSelectPet}
          required
        >
          <SelectTrigger id="pet">
            <SelectValue placeholder="Selecione um pet" />
          </SelectTrigger>
          <SelectContent>
            {pets.map(pet => (
              <SelectItem key={pet.id} value={pet.id}>
                {pet.name} ({pet.species === "cachorro" ? "Cão" : pet.species === "gato" ? "Gato" : pet.species})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="appointment-type">Tipo de consulta</Label>
        <Select 
          value={appointmentType} 
          onValueChange={onChangeType}
          required
        >
          <SelectTrigger id="appointment-type">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consulta_regular">Consulta Regular</SelectItem>
            <SelectItem value="emergencia">Emergência</SelectItem>
            <SelectItem value="vacina">Vacinação</SelectItem>
            <SelectItem value="exame">Exames</SelectItem>
            <SelectItem value="cirurgia">Consulta Pré-Cirúrgica</SelectItem>
            <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="consultation-mode">Modalidade de consulta</Label>
        <RadioGroup 
          value={isOnline ? "online" : "presencial"}
          onValueChange={(val) => onChangeMode(val === "online")}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="presencial" id="presencial" />
            <Label htmlFor="presencial" className="flex items-center gap-1 cursor-pointer">
              <MapPin className="h-4 w-4 text-gray-500" />
              Presencial
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              value="online" 
              id="online" 
              disabled={!vetSupportsOnline}
            />
            <Label htmlFor="online" className={`flex items-center gap-1 cursor-pointer ${!vetSupportsOnline ? 'text-gray-400' : ''}`}>
              <Video className="h-4 w-4 text-gray-500" />
              Online
            </Label>
          </div>
        </RadioGroup>
        
        {!vetSupportsOnline && (
          <p className="text-xs text-amber-600 italic">
            Este veterinário não oferece consultas online
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reason">Motivo da consulta *</Label>
        <Textarea 
          id="reason" 
          placeholder="Descreva o motivo principal da consulta"
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-3">
        <Label>Sintomas observados (se houver)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {commonSymptoms.map(symptom => (
            <div key={symptom} className="flex items-center space-x-2">
              <Checkbox 
                id={`symptom-${symptom}`} 
                checked={symptoms.includes(symptom)}
                onCheckedChange={() => onToggleSymptom(symptom)}
              />
              <Label htmlFor={`symptom-${symptom}`} className="cursor-pointer text-sm">
                {symptom}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações adicionais</Label>
        <Textarea 
          id="notes" 
          placeholder="Informe detalhes adicionais que possam ser úteis para o veterinário"
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
