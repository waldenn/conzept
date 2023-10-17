var conzept_tags = {

// raw-query-string topic

  "raw-query-string" : {
    text : "raw-query-string",
    icon : ["fa-solid fa-pen"],
    sub : {
    },
  },

// === common wikipedia-page tags ===

  "disambiguation" : {
    text : "disambiguation",
    icon : ["fa-solid fa-question"],
    sub : {
      "person" : {
        text : "person disambiguation",
        icon : [ "fa-solid fa-question", "fa-solid fa-user-alt"],
        //icon : "fa-solid fa-question, fa-solid fa-user-alt", // TODO: first split by comma, then display each icon
      } 
    },
  }, 

  "list" : {
    // TODO: language independent detection?
    //  title.startsWith( 'List of ' ) || title.startsWith( 'Index of ' ) || title.startsWith( 'Glossary of ' ) ||
    //  title.endsWith( 'bibliography' ) ||  title.endsWith( 'discography' ) ||   title.endsWith( 'filmography' ) ||
    //  title.startsWith( 'Portal:') || title.startsWith( 'Book:' ) || title.startsWith( 'Outline of ') ){ // list FIXME use language-indepent-regex
    text : "list",
    icon : ["fa-solid fa-list-ul"],
    sub : {
    },
  },

  "category" : {
    condition: '"${title}".startsWith( "${explore.lang_category}" + ":")', 
    text : "category",
    icon : ["fa-solid fa-folder-open"],
    sub : {
    },
  },

  "wikispecial" : {
    text : "template page",
    icon : ["fa-brands fa-uikit"],
    sub : {
    },
  },

// === topical tags ===

  "location" : {
    text : "location",
    icon : ["fa-solid fa-map-marker-alt"],
    sub : {
      "country" : {
        text : "country",
        icon : ["fa-solid fa-map-marker-alt"],
      },
      "mountain" : {
        text : "mountain",
        icon : ["fa-solid fa-mountain"],
      },
      "watercourse" : {
        text : "watercourse",
        icon : ["fa-solid fa-water"],
      },
      "road" : {
        text : "road",
        icon : ["fa-solid fa-road"],
      },
      "itinerary" : {
        text : "itinerary",
        icon : ["fa-solid fa-shuffle"],
      },
      "railway-station" : {
        text : "railway station",
        icon : ["fa-solid fa-train"],
      },
      "floral-region" : {
        text : "floral region",
        icon : ["fa-brands fa-pagelines"],
      },
      "fauna-region" : {
        text : "fauna region",
        icon : ["fa-solid fa-paw"],
      },
    },
  },

  "time" : {
    text : "time / period / event",
    icon : ["fa-regular fa-clock"],
    sub : {
      "period" : {
        text : "period",
        icon : ["fa-regular fa-clock"],
        //icon : ["fa-solid fa-arrows-left-right-to-line"],
      },
      "accident" : {
        text : "accident",
        icon : ["fa-solid fa-bolt"],
      },
    },
  },

  // === human-related topics ===

  "organization" : {
    text : "human organization",
    icon : ["fa-regular fa-handshake"],
    sub : {
      "company" : {
        text : "company",
        icon : ["fa-solid fa-users-rectangle"],
      },
      "business-chain" : {
        text : "business chain",
        icon : ["fa-solid fa-store"],
      },
      "university" : {
        text : "university",
        icon : ["fa-solid fa-building-columns"],
      },
      "national-library" : {
        text : "national library",
        icon : ["fa-solid fa-landmark-flag"],
      },
      "museum" : {
        text : "museum",
        icon : ["fa-solid fa-university"],
      },
      "music-group" : {
        text : "music group",
        icon : ["fa-regular fa-handshake", "fa-solid fa-music"],
      },
      "military" : {
        text : "military group",
        icon : ["fa-solid fa-person-military-rifle"],
      },
    },
  },

  "group" : {
    text : "human grouping (not an organization)",
    icon : ["fa-solid fa-hand-holding-heart"],
    sub : {
      "ethnic-group" : {
        text : "ethnic group",
        icon : ["fa-solid fa-people-arrows"],
      },
      "nobility" : {
        text : "nobility",
        icon : ["fa-solid fa-crown"],
      },
      "nobility-family" : {
        text : "nobility family",
        icon : ["fa-solid fa-crown"],
      },

    },
  },

  "work" : {
    text : "created work",
    icon : ["fa-solid fa-hands"],
    sub : {
      "art" : {
        text : "artwork",
        icon : ["fa-regular fa-image"],
      },
      "symbol" : {
        text : "symbol",
        icon : ["fa-solid fa-shield-alt"],
      },
      "satellite" : {
        text : "satellite",
        icon : ["fa-solid fa-satellite"],
      },
      "ship" : {
        text : "ship",
        icon : ["fa-solid fa-ship"],
      },
      "fictional-entity" : {
        text : "fictional entity",
        icon : ["fa-solid fa-mask"],
      },
      "dish" : {
        text : "food dish",
        icon : ["fa-solid fa-utensils"],
      },
      "beverage" : {
        text : "beverage",
        icon : ["fa-solid fa-wine-glass-alt"],
      },
      "written-work" : {
        text : "written work",
        icon : ["fa-solid fa-book"],
      },
      "science-article" : {
        text : "science article",
        icon : ["fa-regular fa-newspaper"],
      },
      "periodical" : {
        text : "periodical publication",
        icon : ["fa-regular fa-newspaper"],
      },
      "comics" : {
        text : "comics",
        icon : ["fa-solid fa-mask"],
      },
      "video-game" : {
        text : "video game",
        icon : ["fa-solid fa-gamepad"],
      },
      "music-instrument" : {
        text : "music release",
        icon : ["fa-solid fa-guitar"],
      },
      "music" : {
        text : "music release",
        icon : ["fa-solid fa-music"],
      },
      "data" : {
        text : "data",
        icon : ["fa-solid fa-database"],
      },
      "image" : {
        text : "image",
        icon : ["fa-regular fa-image"],
      },
      "film" : {
        text : "film",
        icon : ["fa-solid fa-film"],
      },
      "tv-series" : {
        text : "TV series",
        icon : ["fa-solid fa-ellipsis-h", "fa-solid fa-film"],
        //icon : ["fa-solid fa-grip-lines-vertical", "fa-solid fa-film"],
      },
      "submarine-communications-cable" : {
        text : "submarine communications cable",
        icon : ["fa-solid fa-route"],
      },
      "flag" : {
        text : "flag",
        icon : ["fa-regular fa-flag"],
      },
      "website" : {
        text : "website",
        icon : ["fa-regular fa-copy"],
      },
      "software" : {
        text : "software",
        icon : ["fa-regular fa-window-restore"],
      },
      "3d-model" : {
        text : "3D model",
        icon : ["fa-brands fa-unity"],
      },
      "cryptocurrency" : {
        text : "cryptocurrency",
        icon : ["fa-brands fa-bitcoin"],
      },
      "monument" : {
        text : "monument",
        icon : ["fa-solid fa-monument"],
      },
    },
  },

  "person" : {
    text : "person",
    icon : ["fa-solid fa-user-alt"],
    sub : {
      // TODO: writer, composer, ...
      "scientist" : {
        text : "scientist",
        icon : ["fa-solid fa-user-graduate"],
      },
      "musician" : {
        text : "musician",
        icon : ["fa-solid fa-user-alt", "fa-solid fa-music"],
      },
      "painter" : {
        text : "painter",
        icon : ["fa-solid fa-user-alt", "fa-solid fa-palette"],
      },
      "filmmaker" : {
        text : "filmmaker",
        icon : ["fa-solid fa-user-alt", "oma oma-black-movie-camera"],
      },
      "actor" : {
        text : "actor",
        icon : ["fa-solid fa-user-alt", "oma oma-black-performing-arts"],
      },
      "architect" : {
        text : "architect",
        icon : ["fa-solid fa-user-alt", "fa-regular fa-building"],
      },
    },
  }, 

  "cultural-concept" : {
    text : "cultural concept",
    icon : ["fa-solid fa-people-carry"],
    sub : {
     "role" : { // TODO: may need some more thought/accuracy/work
        text : "field-of-work or role",
        icon : ["fa-regular fa-address-card"],
      },
      //"occupation" : {
      //  text : "occupation",
      //  icon : ["fa-solid fa-people-line"],
      //},
     "rank" : { // TODO: may need some more thought/accuracy/work
        text : "position rank",
        icon : ["fa-regular fa-address-card"],
      },
      "music-genre" : {
        text : "music genre",
        icon : ["fa-solid fa-music"],
      },
      "film-genre" : {
        text : "book genre",
        icon : ["fa-solid fa-film"],
      },
      "literary-genre" : {
        text : "literary genre",
        icon : ["fa-solid fa-book"],
      },
      "religion" : {
        text : "religious concept",
        icon : ["fa-solid fa-dharmachakra"],
      },
      "mythology" : {
        text : "mythological concept",
        icon : ["fa-solid fa-dragon"],
      },
      "education" : {
        text : "educational concept",
        icon : ["fa-solid fa-graduation-cap"],
      },
      "network" : {
        text : "network",
        icon : ["fa-solid fa-network-wired"],
      },
      "art-movement" : {
        text : "art or scientific movement",
        icon : ["fa-solid fa-holly-berry"],
      },
      "social-movement" : {
        text : "social movement",
        icon : ["fa-solid fa-holly-berry"],
      },
      "tonality" : {
        text : "tonality",
        icon : ["fa-brands fa-itunes-note"],
      },
      "form-of-government" : {
        text : "form of governement",
        icon : ["fa-solid fa-users-between-lines"],
      },
      "modern-language" : {
        text : "modern language",
        icon : ["fa-regular fa-comments"],
      },

    },
  },

  // === nature-related topics ===

  "organism" : {
    text : "organism",
    icon : ["fa-solid fa-certificate"],
    sub : {
      "virus" : {
        text : "virus",
        icon : ["fa-solid fa-virus"],
      },
      "bird" : {
        text : "bird",
        icon : ["fa-solid fa-crow"],
      },
      "mushroom" : {
        text : "mushroom",
        icon : ["oma oma-black-champignon-brown"],
      },
      "amphibian" : {
        text : "amphibian",
        icon : ["fa-solid fa-frog"],
      },
      "insect" : {
        text : "insect",
        icon : ["fa-solid fa-bug"],
      },
      "reptile" : {
        text : "reptile",
        icon : ["oma oma-black-lizard"],
      },
      "plant" : { // includes trees
        text : "plant",
        icon : ["fa-brands fa-pagelines"],
      },
      "plant-organ" : {
        text : "plant organ",
        icon : ["fa-solid fa-seedling"],
      },
    },
  },

  "substance" : { // synthetic or natural substances
    text : "substance",
    icon : ["fa-brands fa-react"],
    sub : {
     "periodic-table-element" : {
        text : "periodic table element",
        icon : ["fa-brands fa-react"],
      },
     "protein" : {
        text : "protein",
        icon : ["fa-solid fa-dna"],
      },
     "chromosome" : {
        text : "chromosome",
        icon : ["fa-solid fa-dna"],
      },
     "gene" : {
        text : "gene",
        icon : ["fa-solid fa-dna"],
      },
     "genome" : {
        text : "genome",
        icon : ["fa-solid fa-dna"],
      },
     "mineral" : {
        text : "genome",
        icon : ["fa-regular fa-gem"],
      },
    },
  },

  "natural-type" : { // clearly a concrete natural *physical thing*: planet, snowflake, organs, ...
    text : "natural entity (not an organism)",
    icon : ["fa-regular fa-snowflake"],
    sub : {
     "astronomical-object" : {
        text : "astronomical object",
        icon : ["fa-regular fa-sun"],
      },
    },
  }, 

  "natural-concept" : { // more abstract natural concepts
    text : "natural concept",
    icon : ["fa-solid fa-temperature-high"],
    sub : {
     "biological-pathway" : {
        text : "biological pathway",
        icon : ["fa-solid fa-arrows-spin"],
      },
     "chemistry" : {
        text : "chemistry",
        icon : ["fa-brands fa-react"],
      },
     "geology" : {
        text : "geology",
        icon : ["fa-solid fa-globe-africa"],
      },
     "astronomy" : {
        text : "astronomy",
        icon : ["fa-regular fa-sun"],
      },
     "anatomy" : {
        text : "anatomy",
        icon : ["fa-solid fa-brain"],
      },
     "medical-condition" : {
        text : "medical condition",
        icon : ["fa-solid fa-stethoscope"],
      },
     "animal-disease" : {
        text : "animal disease",
        icon : ["fa-solid fa-bacterium"],
      },
     "human-disease" : {
        text : "human disease",
        icon : ["fa-solid fa-stethoscope"],
      },
     "human-disease-cause" : {
        text : "human disease cause",
        icon : ["fa-solid fa-stethoscope"],
      },
     "personal-concept" : {
        text : "personal concept",
        icon : ["fa-solid fa-street-view"],

      },
     "geographical-structure" : { // may need a better classification
        text : "geographical structure",
        icon : ["fa-brands fa-firstdraft"],
        //icon : ["fa-brands fa-schlix"],
        //icon : ["fa-solid fa-dungeon"],
      },
    },
  },

  // === abstract topics ===

  "meta-concept" : {
    text : "meta concept",
    icon : ["fa-solid fa-cubes"],
    sub : {
     "mathematics" : {
        text : "mathematical concept",
        icon : ["fa-solid fa-square-root-alt"],
      },
      /*
     "risk" : {
        text : "risk",
        icon : ["fa-solid fa-radiation-alt"],
      },
      */

    },
  },

};

var conzept_tag_names = Object.entries( conzept_tags );

/*

main subjects (version A):

  crime
  ?culture
  energy
  engineering
  entertainment
  events
  human behavior
  humanities
  knowledge
  military
  mind
  objects
  organizations
  people
  philosophy
  policy
  politics
  religion
  science
  society
  technology
  universe
  world

main subjects (version B)
  academic disciplines
  business
  concepts
  crime
  culture
  economy
  education
  energy
  engineering
  entertainment
  events
  food and drink
  geography
  government
  health
  history
  human behavior
  humanities
  industry
  knowledge
  language
  law
  life
  mass media
  mathematics
  military
  mind
  music
  nature
  objects
  organizations
  people
  philosophy
  policy
  politics
  religion
  science
  society
  sports
  technology
  universe
  world

*/
