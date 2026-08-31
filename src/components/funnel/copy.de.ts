/**
 * The read, in German.
 *
 * Written, not run through a translator. The register is the same one DNA §7
 * sets for English — dry, friendly, occasionally funny, never chummy: `du`
 * rather than `Sie`, because the reader is a person who makes things and not a
 * procurement department, but full sentences and no chat-speak.
 *
 * Two habits German needs that English does not:
 *
 * - The jokes have to be rebuilt, not carried. "A great workout for your eyes"
 *   is an English shape; the German version keeps the *joke* and drops the
 *   wording.
 * - Product names stay in English (D1, Visual Studio, Account Identity,
 *   Scheduling) because that is what they are called inside the app the reader
 *   will end up using.
 */
import type { FunnelCopy } from './types';

export const DE: FunnelCopy = {
  locale: 'de',

  meta: {
    title: 'Die kostenlose Analyse — Diwche',
    description:
      'Beantworte ein paar Fragen und sieh, was Diwche aus deiner Seite machen würde. Kostenlos, und nichts wird mit deinem Konto verbunden.',
  },

  preview:
    'Vorschau — er ist noch nicht mit Instagram verbunden, die Analyse am Ende läuft also nicht. Alles davor ist echt.',

  bar: { back: 'Einen Schritt zurück' },

  screens: [
    {
      id: 'stage',
      kind: 'question',
      eyebrow: 'Zuerst',
      title: 'Wo stehst du gerade mit deinen Inhalten?',
      options: [
        {
          value: 'active',
          label: 'Ich habe ein aktives Profil',
          sub: 'und poste regelmäßig',
          icon: 'mine',
        },
        {
          value: 'new',
          label: 'Ich habe noch nicht angefangen',
          sub: 'aber ich will bald loslegen',
          icon: 'seed',
        },
      ],
      shot: {
        src: '/mascot/v2/thinking.svg',
        label: 'Diwche',
        alt: 'Der Diw überlegt, wo er anfängt.',
      },
    },

    {
      id: 'blockers',
      kind: 'question',
      eyebrow: 'Was im Weg steht',
      title: 'Was hält dich bisher davon ab, zu posten?',
      titleWhen: {
        // Jemanden, der täglich postet, zu fragen, warum er nicht angefangen
        // hat, ist keine Frage, sondern ein Vorwurf.
        active: 'Was frisst beim Posten die meiste Zeit?',
      },
      hint: 'Mehrfachauswahl möglich.',
      multi: true,
      options: [
        {
          value: 'ideas',
          label: 'Ideen finden',
          sub: 'Ich weiß nicht, worüber ich posten soll oder was überhaupt funktioniert',
          icon: 'idea',
        },
        {
          value: 'editing',
          label: 'Videoschnitt',
          sub: 'Schnitt und Gestaltung sind mir zu kompliziert oder zu zeitaufwendig',
          icon: 'cut',
        },
        {
          value: 'script',
          label: 'Skript & Aufbau',
          sub: 'Mir fallen keine guten Skripte und keine starken ersten Sätze ein',
          icon: 'words',
        },
        {
          value: 'dm',
          label: 'Kommentare & DMs',
          sub: 'Ich weiß nicht, wie ich Nachrichten und Antworten vernünftig schaffen soll',
          icon: 'chat',
        },
      ],
      shot: {
        src: '/mascot/v2/working-hard.svg',
        label: 'Diwche',
        alt: 'Der Diw macht sich Notizen.',
      },
    },

    {
      id: 'f-ideas',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'ideas' },
      eyebrow: 'Ideen',
      quote: 'Ich weiß nicht, worüber ich posten soll oder was überhaupt funktioniert.',
      hook: 'Ehrlich? Wir auch nicht. Kleiner Scherz — wir wissen es, und du bald auch.',
      title: 'Jeden Morgen Themen, die zu dir gehören.',
      lead: 'Statt dir allgemeine Trends hinzuwerfen, sieht er sich dein Themenfeld an, liest die Profile, an denen du dich misst, und wertet aus, wie deine eigenen Beiträge tatsächlich gelaufen sind. Je länger du mit ihm arbeitest, desto besser kennt er deinen Ton und das, worauf dein Publikum reagiert. Schalte die nächtliche Suche ein, und er durchsucht deine Quellen, während du schläfst — morgens liegt ein Stapel fertiger Themen bereit.',
      shot: {
        src: '/shots/_placeholder-ideas.svg',
        label: 'Ideen',
        alt: 'Die Ideen-Seite mit einer Spalte vorgeschlagener Themen.',
      },
    },
    {
      id: 'f-editing',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'editing' },
      eyebrow: 'D1 Studio',
      quote: 'Schnitt und Gestaltung sind mir zu kompliziert oder zu zeitaufwendig.',
      hook: 'Wir wissen, was du denkst: noch so ein KI-Werkzeug, bei dem man 500 Wörter Prompt schreibt, um eine Bildunterschrift zwei Millimeter zu verschieben. Nicht ganz.',
      title: 'Einmal sagen. Den Rest schneidet er.',
      lead: 'D1 nimmt dein Rohmaterial und dein Thema und gibt dir ein fertig geschnittenes Video zurück. Und hier bricht er die Regel, der alle anderen folgen: Für Kleinigkeiten musst du dich nicht mit einem Textfeld streiten. Visual Studio gibt dir die ganze Timeline — Elemente hinzufügen, Schnitte verschieben, alles von Hand ändern. Das Tempo der Maschine, mit deinen Händen am Material.',
      shot: {
        src: '/shots/_placeholder-d1.svg',
        label: 'Visual Studio',
        alt: 'Der Editor mit Timeline, Monitor und Inspektor.',
      },
    },
    {
      id: 'f-script',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'script' },
      eyebrow: 'Skript',
      quote: 'Mir fallen keine guten Skripte und keine starken ersten Sätze ein.',
      hook: 'Ein leeres Dokument anstarren und auf Eingebung warten ist gut für die Augenmuskulatur. Videos postet es keine.',
      title: 'Den ersten Satz schreibt er für dich.',
      lead: 'Er schreibt aufgebaute Skripte, starke erste Sätze und Bildunterschriften in dem Ton, den du für deine Seite festgelegt hast — nicht in irgendeinem. Du willst den ganzen Text fertig zum Ablesen? Hast du. Lieber nur ein Gerüst zum Weiterschreiben, oder einfach einen Anfang? Auch das. Neu erzeugen, kürzen, umschreiben, bis es nach dir klingt.',
      shot: {
        src: '/shots/_placeholder-script.svg',
        label: 'D1 Studio',
        alt: 'Der Teleprompter mit einem fertigen Skript.',
      },
    },
    {
      id: 'f-dm',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'dm' },
      eyebrow: 'Antworten',
      quote: 'Ich weiß nicht, wie ich Nachrichten und Antworten vernünftig schaffen soll.',
      hook: 'Auf vierzig völlig verschiedene Fragen dasselbe rote Herz zu schicken ist durchaus eine Strategie. Nur keine gute.',
      title: 'Er liest die Frage, bevor er antwortet.',
      lead: 'Keine starren Schlagwortregeln, keine Konserven. Er liest, was in einem Kommentar oder einer Nachricht tatsächlich steht, antwortet auf das, was gefragt wurde, und bleibt dabei in dem Ton, den du für deine Seite gesetzt hast. Echter Austausch, der von allein läuft — ohne je nach Bot zu klingen.',
      shot: {
        src: '/shots/_placeholder-replies.svg',
        label: 'Antworten',
        alt: 'Ein Kommentar und die Antwort, die er dafür geschrieben hat.',
      },
    },

    {
      id: 'performance',
      kind: 'start',
      field: 'handle',
      showIf: { screen: 'stage', is: 'active' },
      eyebrow: 'Auswertung',
      hook: 'Posten ist nur die halbe Arbeit. Auf Instagrams Diagramme zu starren und so zu tun, als wüsste man, was „3 % Reichweite“ bedeutet, lässt keine Seite wachsen.',
      title: 'Was deine Zahlen dir sagen wollten.',
      lead: 'Er macht aus den Rohdaten etwas, mit dem du arbeiten kannst. Statt eines weiteren Dashboards sagt er dir, welcher Beitrag nicht gezündet hat, woran das lag und was du beim nächsten anders machen solltest. Der Teil, den Instagram nie gebaut hat.',
      cta: 'Lies meine Seite',
      placeholder: 'deinprofil',
      shot: {
        src: '/shots/_placeholder-performance.svg',
        label: 'Auswertung',
        alt: 'Ein Satz über einen Beitrag, über den Balken, aus denen er stammt.',
      },
    },
    {
      id: 'starter',
      kind: 'start',
      field: 'idea',
      showIf: { screen: 'stage', is: 'new' },
      eyebrow: 'Wo es losgeht',
      hook: 'Zu wissen, wie die Werkzeuge funktionieren, ist schön. Ein Motor ohne Sprit ist trotzdem nur ein schwerer Briefbeschwerer. Zeit für einen Grund anzufangen.',
      title: 'Eine Idee reicht für den Anfang.',
      lead: 'Für den ersten Schritt brauchst du keine fünfzigseitige Strategie, sondern einen Funken. Sag ihm die grobe Idee oder das Thema, das dir seit Wochen im Kopf herumgeht, und er macht daraus eine klare Richtung und einen ersten Beitrag, den man wirklich veröffentlichen kann.',
      cta: 'Damit anfangen',
      placeholder: 'Das, was du immer wieder aufschiebst …',
      shot: {
        src: '/shots/_placeholder-starter.svg',
        label: 'Ideen',
        alt: 'Zehn vorgeschlagene Themen, aus einer Idee entwickelt.',
      },
    },

    { id: 'analyzing', kind: 'analyzing' },
    { id: 'result', kind: 'result' },
    { id: 'plan', kind: 'plan' },
    { id: 'error', kind: 'error' },
  ],

  features: {
    ideas: {
      label: 'Ideen',
      title: 'Jeden Morgen Themen, die zu dir gehören.',
      text: 'Er liest dein Themenfeld, die Profile, die du beobachtest, und deine eigenen Ergebnisse — und bringt Themen, die sonst niemand bekommt.',
    },
    editing: {
      label: 'D1 Studio',
      title: 'Aus Rohmaterial ein fertiges Video.',
      text: 'Er schneidet Pausen und Versprecher heraus und zeigt dir jeden Schnitt — und wenn dir einer nicht passt, legt Visual Studio dir die Timeline hin.',
    },
    script: {
      label: 'Skript',
      title: 'Der erste Satz, und die neunzig danach.',
      text: 'Aufgebaute Skripte, starke Anfänge und Bildunterschriften in deinem Ton. So oft neu erzeugen, bis es nach dir klingt.',
    },
    dm: {
      label: 'Antworten',
      title: 'Antworten auf die Frage, die gestellt wurde.',
      text: 'Er liest jeden Kommentar und jede Nachricht, antwortet auf das, was wirklich dasteht, und bricht dabei nie deinen Ton.',
    },
    identity: {
      label: 'Account Identity',
      title: 'Einmal einstellen, er hält es.',
      text: 'Farbpaletten, Vorlagen, Schriften, Figuren und der Ton deiner Seite liegen an einer Stelle und gelten für alles, was er baut. Zum hundertsten Mal Hex-Codes eintippen ist keine Markenführung.',
    },
    scheduling: {
      label: 'Scheduling',
      title: 'Uhrzeit wählen und weggehen.',
      text: 'Er veröffentlicht genau dann, wann du gesagt hast, und startet im selben Moment den Rest — Antworten im Blick, Auswertung läuft. Kein Wecker um zwei Uhr nachts, nur um auf „Veröffentlichen“ zu tippen.',
    },
  },

  analyzing: {
    line: 'Er liest deine Seite …',
    lead: 'Während wir die schwere Arbeit machen, hier der Rest von dem, was im Hintergrund läuft.',
    shot: {
      src: '/shots/_placeholder-activity.svg',
      label: 'Aktivität',
      alt: 'Das Aktivitätsprotokoll mit dem, was veröffentlicht wurde.',
    },
  },

  result: {
    eyebrow: 'Was er gefunden hat',
    teaser: 'Wir haben deinen Bericht fertig — die besten Stellen aber unscharf gelassen. Fairer Handel, oder?',
    emailLabel: 'Deine E-Mail-Adresse',
    placeholder: 'deine.adresse@hier.de',
    consent: 'Diwche darf mir diese Analyse schicken. Niemand sonst bekommt diese Adresse.',
    cta: 'Bericht scharf stellen',
    starterEyebrow: 'Wo er anfangen würde',
    starterTeaser:
      'Er hat deine Idee gelesen. Lass eine Adresse da, und er schickt dir die Richtung, die er einschlagen würde — samt erstem Beitrag.',
  },

  plan: {
    eyebrow: 'Was er tun würde',
    headline: 'Versprochen ist versprochen. Hier ist deine vollständige Auswertung.',
    body: 'Nimm dir Zeit dafür und behalte dein Postfach im Auge. In ein paar Minuten schicken wir dir ein Angebot, das zu deiner tatsächlichen Lage passt — kein Rundschreiben, nur die Werkzeuge, die du wirklich brauchst.',
    starterHeadline: 'Er hat einen Anfang für dich.',
    starterBody:
      'Behalte dein Postfach im Auge. In ein paar Minuten kommt die Richtung, die er für deine Idee einschlagen würde, und der erste Beitrag, den er daraus macht.',
    working: 'Wie er darauf kommt',
    ways: { again: 'Eine andere Seite lesen', home: 'Zurück zu diwche.com' },
  },

  ui: {
    continue: 'Weiter',
    next: 'Verstanden',
    retry: 'Andere Seite versuchen',
    of: 'von',
    working: 'Einen Moment …',
    sent: 'Hat er',
    copy: 'Code kopieren',
    copied: 'Kopiert',
    copyByHand: 'Von Hand kopieren',
  },

  runtime: {
    reading: 'Seite wird gesucht …',
    thinking: 'Er denkt darüber nach …',
    handleInvalid: 'Das ist kein Instagram-Profilname — Buchstaben, Zahlen, Punkte.',
    ideaTooShort: 'Ein bisschen mehr braucht er schon.',
    emailInvalid: 'Diese Adresse sieht nicht richtig aus.',
    consentMissing: 'Setz das Häkchen, damit er weiß, dass er dir schreiben darf.',
    generic: 'Bei uns ist etwas schiefgegangen, nicht bei dir.',
    noProjection:
      'Er zeigt es dir lieber, als es zu versprechen. Auf dieser Seite ist kein Abstand groß genug, um ihn zu zeichnen — was er gefunden hat und was er damit täte, geht deshalb an deine Adresse.',
    errorEyebrow: 'Er hat aufgehört',
    waitingTitle: 'Lass eine Adresse da, und er schickt die Analyse, sobald er kann.',
    waitingCta: 'Schick sie, sobald es geht',
  },
};
