import React from 'react';
import { Shield, FileText, Mail, Printer, Building2, ArrowRight } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: <FileText className="h-12 w-12 text-yellow-500" />,
      title: 'Einfacher Assistent',
      description: 'In nur wenigen Schritten leiten wir Sie zu den fertigen Anträgen'
    },
    {
      icon: <Mail className="h-12 w-12 text-yellow-500" />,
      title: 'Kontaktlos zur Behörde',
      description: 'Sparen Sie sich die gesamte Kontaktaufnahme mit der zuständigen Behörde'
    },
    {
      icon: <Shield className="h-12 w-12 text-yellow-500" />,
      title: 'Datenschutz',
      description: 'Datenschutz nach EU Datenschutz-Grundverordnung (DSGVO)'
    },
    {
      icon: <Building2 className="h-12 w-12 text-yellow-500" />,
      title: 'Auch für Firmenkunden',
      description: 'Auch als Firmenkunde profitieren Sie von unserem Service'
    },
    {
      icon: <ArrowRight className="h-12 w-12 text-yellow-500" />,
      title: 'Kein Weg zur Post',
      description: 'Wir versenden die Anträge für Sie an die zuständigen Behörden'
    },
    {
      icon: <Printer className="h-12 w-12 text-yellow-500" />,
      title: 'Kein Drucker notwendig',
      description: 'Sie können bei uns alles online ausfüllen. Wir übernehmen den Versand für Sie'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Ihre <span className="border-b-4 border-yellow-400">Vorteile</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6">
              {benefit.icon}
              <h3 className="text-xl font-semibold mt-4 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;