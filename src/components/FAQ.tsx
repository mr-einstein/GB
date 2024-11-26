import React, { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Wie ist der Ablauf der Beantragung?',
      answer: [
        'In unserem Online-Formular geben Sie die erforderlichen Daten zu Ihrer Immobilie oder Ihrem Grundstück ein und wählen Ihre gewünschten Auszüge/Dokumente. Zusätzlich geben Sie noch relevante persönliche Daten an, wie z.B. Ihre Anschrift.',
        'Nach Eingang Ihrer Bestellung erstellen wir die notwendigen Anträge und versenden diese an die zuständigen Behörden.',
        'Die Behörde prüft nun die Anträge, erstellt Ihre gewählten Dokumente und sendet Ihnen diese direkt per Post oder E-Mail zu.'
      ]
    },
    {
      question: 'Welche Dokumente kann und darf ich anfordern?',
      answer: [
        'Die meisten behördlichen Dokumente zu Immobilien/Grundstücken beinhalten personenbezogene Daten, z.B. zum Eigentümer, weshalb die Verzeichnisse nicht öffentlich zugänglich sind. Nachfolgend sind die jeweiligen Dokumente gelistet, mit den Bedingungen, wer die Dokumente u.a. anfordern darf:',
        '<strong>Grundbuchauszug:</strong>',
        '<ul><li>Eigentümer oder Miteigentümer des Grundstücks/der Immobile</li><li>Personen, die im Grundbuch eingetragen sind (auch Gläubiger)</li><li>Personen, die ein berechtigtes Interesse nach §12 GBO haben</li><li>Personen, die eine Vollmacht einer berechtigten Person. z.B. Eigentümer, besitzen</li><li>Personen, die ein Kaufinteresse, mit z.B. einem Entwurf des Kaufvertrages, nachweisen können</li></ul>',
        '<strong>Liegenschaftskarte (bzw. Flurkarte / Katasterkarte):</strong> Allgemeine Informationen aus dem Liegenschaftskataster sind für jeden Bürger zugänglich. Wenn Sie jedoch auf der Karte einen Eigentümernachweis wünschen, müssen Sie ein berechtigtes Interesse nachweisen:',
        '<ul><li>Eigentümer oder Miteigentümer des Grundstücks/der Immobile</li><li>Personen, die im Grundbuch eingetragen sind (auch Gläubiger)</li><li>Personen, die ein berechtigtes Interesse nach §12 GBO haben</li><li>Personen, die eine Vollmacht einer berechtigten Person. z.B. Eigentümer, besitzen</li><li>Personen, die ein Kaufinteresse, mit z.B. einem Entwurf des Kaufvertrages, nachweisen können</li></ul>',
        '<strong>Kopie der Teilungserklärung:</strong>',
        '<ul><li>Eigentümer oder Miteigentümer des Grundstücks/der Immobile</li><li>Personen, die im Grundbuch eingetragen sind (auch Gläubiger)</li><li>Personen, die ein berechtigtes Interesse nach §12 GBO haben</li><li>Personen, die eine Vollmacht einer berechtigten Person. z.B. Eigentümer, besitzen</li><li>Personen, die ein Kaufinteresse, mit z.B. einem Entwurf des Kaufvertrages, nachweisen können</li></ul>',
        '<strong>Altlastenauskunft:</strong> Allgemeine Informationen aus dem Altlastenkataster sind für jeden Bürger zugänglich.',
        '<strong>Baulastenverzeichnis:</strong>',
        '<ul><li>Eigentümer oder Miteigentümer des Grundstücks/der Immobile</li><li>Personen, die im Grundbuch eingetragen sind (auch Gläubiger)</li><li>Personen, die ein berechtigtes Interesse nach §12 GBO haben</li><li>Personen, die eine Vollmacht einer berechtigten Person. z.B. Eigentümer, besitzen</li><li>Personen, die ein Kaufinteresse, mit z.B. einem Entwurf des Kaufvertrages, nachweisen können</li></ul>',
        '<strong>Bebauungsplan:</strong> Allgemeine Informationen aus dem Bebauungsplan sind für jeden Bürger zugänglich.',
        '<strong>Erschließungsbescheinigung:</strong>',
        '<ul><li>Eigentümer oder Miteigentümer des Grundstücks/der Immobile</li><li>Personen, die im Grundbuch eingetragen sind (auch Gläubiger)</li><li>Personen, die ein berechtigtes Interesse nach §12 GBO haben</li><li>Personen, die eine Vollmacht einer berechtigten Person. z.B. Eigentümer, besitzen</li><li>Personen, die ein Kaufinteresse, mit z.B. einem Entwurf des Kaufvertrages, nachweisen können</li></ul>'
      ]
    },
    {
      question: 'Wie lange dauert die Bearbeitung?',
      answer: [
        'Nach Eingang Ihrer Bestellung erstellen wir Ihre Anträge für Ihre gewählten Dokumente und versenden diese, in der Regel, innerhalb weniger Minuten, an die zuständigen Behörden.',
        'Der Bearbeitungszeitraum auf den Behörden beträgt in der Regel zwischen <strong>3 bis 7 Werktage.</strong> In seltenen Fällen, u.a. wegen eines hohen Anfrageaufkommens, kann die Bearbeitung jedoch auch einmal länger dauern.',
        'Die Dokumente erhalten Sie dann per Post und in manchen Fällen auch direkt per E-Mail.'
      ]
    },
    {
      question: 'Was kostet dieser Service?',
      answer: [
        'Mit unserem Service können Sie Ihre gewünschten Dokumente jetzt einfach <strong>ab 19,90€*</strong> inkl. MwSt. beantragen.',
        'Die Behörden erheben für die Erstellung und Zusendung der Dokumente eine separate Gebühr. Diese Gebührenhöhe ist abhängig vom gewünschten Antrag und der geltenden Gebührenordnung für die Behörde. Normalerweise belaufen sich diese auf <strong>10 bis 20 EUR</strong> <strong>je Auszug oder 0,50 EUR je Seite.</strong>',
        '<strong>Hinweis:</strong> Sie können auch unentgeltlich einen Antrag stellen. Erkundigen Sie sich hierzu bei den entsprechenden Behörden vor Ort oder im Internet.',
        '* Bundle-Angebotspreis: Nutzungsgebühr für unseren Antragsassistenten, sowie ein themenverwandtes eBook aus unserer „Wissen Kompakt"-Reihe. Die Produkte lassen sich auch jeweils separat in unserem Shop unter Produkte erwerben.'
      ]
    },
    {
      question: 'Was sind hier die Vorteile für mich?',
      answer: [
        'Sparen Sie sich die Zeit und Ihre Nerven, die zuständigen Behörden und Bedingungen für die Beantragung, wie z.B. Formulare, ausfindig zu machen.',
        'Gerade wenn Sie mehre Immobilen verwalten, eine geerbt haben, oder eine kaufen wollen, kann dies sehr undurchsichtig sein, wie und wo Sie den Antrag stellen müssen.',
        'Mit unserem Service können Sie bequem mehrere unterschiedliche Dokumente für Ihre Immobilie oder Ihr Grundstück in nur einem Prozess beantragen. Und dies kontaktlos zur Behörde, bequem von zu Hause, ohne Drucker und ohne Weg zur Post.',
        '<strong>Ihr Vorteil:</strong> Wir benötigen nur die Daten zu Ihrer Immobile und zu Ihrer Person, und den Rest machen wir, sodass die Anträge sicher bei den zuständigen Behörden eingehen.',
        '<button onClick="window.scrollTo({ top: 0, behavior: \'smooth\' })" class="text-yellow-400 hover:text-yellow-500 cursor-pointer">Alles klar, los geht\'s</button>'
      ]
    },
    {
      question: 'Was passiert mit meinen Daten?',
      answer: [
        'Ihre eingegeben Daten werden erst nach Ihrer Bestellung bei uns im System gespeichert.',
        'Die Daten werden dann von uns ausschließlich zur Erfüllung unseres Services verwendet: Erstellung der Anträge und Versendung an die Behörde',
        'Nach Ablauf von 90 Tagen werden Ihre Daten, bis auf die handels- und steuerrechtlichen relevanten Daten, automatisch gelöscht. Selbstverständlich können sie auch vor Ablauf der 90 Tage einen Löschanfrage stellen.',
        'Im Falle eines Abbruchs eines Auftrages wird Ihre Bestellung nach 7 Tagen automatisch storniert und Ihre Daten gelöscht.',
        '<strong>In der Auftragsbestätigung finden Sie einen Link, über dessen Sie direkt nach der Bestellung die Löschung Ihrer Daten veranlassen können.</strong>',
        'Auch über das Support-Formular, können Sie die Löschung Ihrer Daten unkompliziert vornehmen: https://blackforest-verlag.de/support',
        'Sobald wir die Löschung in Ihrem Auftrag ausgeführt haben, erhalten Sie von uns ein Löschprotokoll per E-Mail.'
      ]
    },
    {
      question: 'Was bedeutet der Sendebericht?',
      answer: [
        'Der Sendebericht dient als Nachweis, dass wir die Anträge zu Ihren gewählten Dokumenten, erfolgreich an die jeweils zuständige Behörde versendet haben. Damit können Sie bei z.B. einer Bank nachweisen, dass Sie das entsprechende Dokument beantragt haben.',
        '<strong>Wichtig:</strong> An dem auf dem Sendebericht genannten Zeitpunkt, wurden die gewählten Dokumente noch nicht an Sie versendet oder zugestellt.',
        'Erfahrungsgemäß werden die Anträge nach erhalt, innerhalb von 3 bis 7 Werktage von der entsprechenden Behörde bearbeitet und Ihre gewählten Dokumente an Sie per Post, oder in manchen Fällen per E-Mail, versendet.'
      ]
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4">
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 text-left"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 className="text-lg font-medium text-gray-900">
                {openIndex === index ? '−' : '+'} {faq.question}
              </h3>
            </button>
            {openIndex === index && (
              <div 
                id={`faq-answer-${index}`}
                className="mt-2 p-4 bg-white rounded-lg"
              >
                {faq.answer.map((paragraph, pIndex) => (
                  <div 
                    key={pIndex} 
                    className={`text-gray-600 ${pIndex > 0 ? 'mt-4' : ''}`}
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="text-center mt-8">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Jetzt Dokumente beantragen
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;