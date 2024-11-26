import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Document {
  id: string;
  name: string;
  price: number;
}

interface DocumentContextType {
  selectedDocuments: Document[];
  toggleDocument: (document: Document) => void;
  totalPrice: number;
}

// Define initial selected documents
const initialDocuments: Document[] = [
  { id: 'grundbuchauszug', name: 'Grundbuchauszug', price: 29.90 },
  { id: 'liegenschaftskarte', name: 'Liegenschaftskarte', price: 29.90 }
];

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>(initialDocuments);

  const toggleDocument = (document: Document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(doc => doc.id === document.id);
      if (isSelected) {
        return prev.filter(doc => doc.id !== document.id);
      } else {
        return [...prev, document];
      }
    });
  };

  const totalPrice = selectedDocuments.reduce((sum, doc) => sum + doc.price, 0);

  return (
    <DocumentContext.Provider value={{ selectedDocuments, toggleDocument, totalPrice }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}