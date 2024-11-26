import React from 'react';
import { useDocuments } from '../context/DocumentContext';
import type { Document } from '../context/DocumentContext';
import TooltipWrapper from './TooltipWrapper';
import { formTooltips } from '../config/tooltips';

const DocumentSelection = () => {
  const { selectedDocuments, toggleDocument } = useDocuments();

  const documents: Document[] = [
    { 
      id: 'grundbuchauszug', 
      name: 'Grundbuchauszug', 
      price: 29.90,
      tooltip: formTooltips.grundbuchauszug
    },
    { 
      id: 'liegenschaftskarte', 
      name: 'Liegenschaftskarte', 
      price: 29.90,
      tooltip: {
        text: "Amtliche Liegenschaftskarte",
        hint: "Zeigt die genauen Grundstücksgrenzen und baulichen Anlagen"
      }
    },
    { 
      id: 'teilungserklaerung', 
      name: 'Teilungserklärung', 
      price: 24.90,
      tooltip: {
        text: "Teilungserklärung der Immobilie",
        hint: "Beschreibt die Aufteilung des Gebäudes in Wohnungseigentum"
      }
    },
    { 
      id: 'altlastenauskunft', 
      name: 'Altlastenverzeichnis', 
      price: 24.90,
      tooltip: {
        text: "Auskunft über Altlasten",
        hint: "Informationen über mögliche Bodenverunreinigungen oder Altlasten"
      }
    },
    { 
      id: 'baulasten', 
      name: 'Baulastenverzeichnis', 
      price: 24.90,
      tooltip: {
        text: "Baulastenverzeichnis",
        hint: "Übersicht über öffentlich-rechtliche Verpflichtungen des Grundstücks"
      }
    },
    { 
      id: 'erschliessung', 
      name: 'Erschließungsbesch.', 
      price: 19.90,
      tooltip: {
        text: "Erschließungsbescheinigung",
        hint: "Informationen über die Erschließung des Grundstücks (Straße, Wasser, etc.)"
      }
    },
    { 
      id: 'bebauungsplan', 
      name: 'Bebauungsplan', 
      price: 19.90,
      tooltip: {
        text: "Bebauungsplan",
        hint: "Zeigt die zulässige Art und Maß der baulichen Nutzung"
      }
    },
  ];

  const isSelected = (id: string) => selectedDocuments.some(doc => doc.id === id);

  return (
    <section id="document-selection" className="space-y-6">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-medium text-gray-900">
          Was möchten Sie beantragen?
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {documents.slice(0, 6).map((doc) => (
          <TooltipWrapper
            key={doc.id}
            text={doc.tooltip.text}
            hint={doc.tooltip.hint}
          >
            <button
              onClick={() => toggleDocument(doc)}
              className={`w-full p-4 rounded-md text-left transition-colors ${
                isSelected(doc.id)
                  ? 'bg-yellow-400 hover:bg-yellow-500'
                  : 'bg-yellow-100 hover:bg-yellow-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{doc.name}</span>
                <span className="text-gray-600">{doc.price.toFixed(2)}€</span>
              </div>
            </button>
          </TooltipWrapper>
        ))}
      </div>

      <div className="grid grid-cols-1">
        <TooltipWrapper
          text={documents[6].tooltip.text}
          hint={documents[6].tooltip.hint}
        >
          <button
            onClick={() => toggleDocument(documents[6])}
            className={`w-full p-4 rounded-md text-left transition-colors ${
              isSelected(documents[6].id)
                ? 'bg-yellow-400 hover:bg-yellow-500'
                : 'bg-yellow-100 hover:bg-yellow-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{documents[6].name}</span>
              <span className="text-gray-600">{documents[6].price.toFixed(2)}€</span>
            </div>
          </button>
        </TooltipWrapper>
      </div>

      {selectedDocuments.length === 0 && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
          Sie haben kein Dokument ausgewählt. Bitte wählen Sie mindestens ein Dokument, welches Sie beantragen möchten.
        </div>
      )}
    </section>
  );
};

export default DocumentSelection;