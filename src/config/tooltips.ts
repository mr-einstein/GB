interface TooltipConfig {
  text: string;
  hint?: string;
}

interface FormTooltips {
  [key: string]: TooltipConfig;
}

export const formTooltips: FormTooltips = {
  street: {
    text: "Geben Sie den Straßennamen ein",
    hint: "Der vollständige Straßenname ohne Hausnummer (z.B. Hauptstraße)"
  },
  houseNumber: {
    text: "Geben Sie Ihre Hausnummer ein",
    hint: "Hausnummer mit optionalem Zusatz (z.B. 12b oder 15-17)"
  },
  zipCode: {
    text: "Geben Sie Ihre Postleitzahl ein",
    hint: "Die 5-stellige Postleitzahl Ihres Standorts"
  },
  email: {
    text: "Geben Sie Ihre E-Mail-Adresse ein",
    hint: "Ihre aktive E-Mail-Adresse für wichtige Mitteilungen"
  },
  
  propertyStreet: {
    text: "Geben Sie den Straßennamen der Immobilie ein",
    hint: "Der vollständige Straßenname des Grundstücks oder der Immobilie"
  },
  propertyHouseNumber: {
    text: "Geben Sie die Hausnummer der Immobilie ein",
    hint: "Hausnummer mit optionalem Zusatz (z.B. 12b oder 15-17)"
  },
  flurFlurstuck: {
    text: "Geben Sie die Flur- und Flurstücksnummer ein",
    hint: "Diese Informationen finden Sie in Ihren Grundstücksunterlagen oder im Grundbuchauszug"
  },
  blattnummer: {
    text: "Geben Sie die Grundbuchblattnummer ein",
    hint: "Die Nummer finden Sie auf Ihrem Grundbuchauszug"
  },
  gemarkung: {
    text: "Geben Sie die Gemarkung ein",
    hint: "Der Name der Gemarkung, in der sich das Grundstück befindet"
  },
  
  personalAusweis: {
    text: "Personalausweis oder Reisepass",
    hint: "Gültiges Ausweisdokument mit Lichtbild zur Identitätsbestätigung"
  },
  grundbuchauszug: {
    text: "Aktueller Grundbuchauszug",
    hint: "Nicht älter als 6 Monate, alle Seiten müssen vollständig lesbar sein"
  },
  kaufvertrag: {
    text: "Notarieller Kaufvertrag",
    hint: "Vollständig unterschriebener und notariell beglaubigter Kaufvertrag"
  },
  vollmacht: {
    text: "Vollmacht (falls zutreffend)",
    hint: "Notariell beglaubigte Vollmacht bei Vertretung durch eine andere Person"
  },
  
  grundbuchBeglaubigung: {
    text: "Beglaubigte Grundbuchauszüge",
    hint: "Ein beglaubigter Grundbuchauszug ist ein amtlich bestätigtes Dokument, das z.B. für Behörden oder Banken benötigt wird"
  },
  eigentumerNachweis: {
    text: "Eigentümernachweis auf der Liegenschaftskarte",
    hint: "Mit dieser Option wird der aktuelle Eigentümer auf der Liegenschaftskarte ausgewiesen - wichtig z.B. für Bauanträge oder Grundstücksverhandlungen"
  },
  berechtigtesInteresse: {
    text: "Nachweis des berechtigten Interesses",
    hint: "Ein berechtigtes Interesse ist z.B. der Kauf/Verkauf einer Immobilie, Erstellung eines Wertgutachtens oder ein laufendes Gerichtsverfahren"
  }
};
