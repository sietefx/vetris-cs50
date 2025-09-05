import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Componente simplificado, mantendo apenas a estrutura essencial
export default function CustomizableDashboard({ widgets, onOrderChange, onVisibilityChange }) {
  const [localWidgets, setLocalWidgets] = useState(widgets || []);

  // Atualizar widgets locais quando as props mudarem
  useEffect(() => {
    if (widgets) {
      setLocalWidgets(widgets);
    }
  }, [widgets]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalWidgets(items);
    if (onOrderChange) {
      onOrderChange(items);
    }
  };

  const toggleWidgetVisibility = (widgetId) => {
    const updatedWidgets = localWidgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    setLocalWidgets(updatedWidgets);
    if (onVisibilityChange) {
      onVisibilityChange(updatedWidgets);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {localWidgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${widget.visible ? '' : 'opacity-50'}`}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-base font-medium">
                            {widget.title}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWidgetVisibility(widget.id)}
                          >
                            {widget.visible ? "Esconder" : "Mostrar"}
                          </Button>
                        </CardHeader>
                        {widget.visible && (
                          <CardContent>
                            {widget.content}
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}