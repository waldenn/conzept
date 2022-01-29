var conzept_tags = {

/*

  1: set topic tags (tag1, tag2)
  2: set icon for that tag

  main subjects (classification guide):
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


// raw-query-string topic

  "raw-query-string" : {
    text : "raw-query-string",
    icon : ["fas fa-pen"],
    sub : {
    },
  },

// === common wikipedia-page tags ===

  "disambiguation" : {
    text : "disambiguation",
    icon : ["fas fa-question"],
    sub : {
      "person" : {
        text : "person disambiguation",
        icon : [ "fas fa-question", "fas fa-user-alt"],
        //icon : "fas fa-question, fas fa-user-alt", // TODO: first split by comma, then display each icon
      } 
    },
  }, 

  "list" : {
    // TODO: language independent detection?
    //  title.startsWith( 'List of ' ) || title.startsWith( 'Index of ' ) || title.startsWith( 'Glossary of ' ) ||
    //  title.endsWith( 'bibliography' ) ||  title.endsWith( 'discography' ) ||   title.endsWith( 'filmography' ) ||
    //  title.startsWith( 'Portal:') || title.startsWith( 'Book:' ) || title.startsWith( 'Outline of ') ){ // list FIXME use language-indepent-regex
    text : "list",
    icon : ["fas fa-list-ul"],
    sub : {
    },
  },

  "category" : {
    condition: '"${title}".startsWith( "${explore.lang_category}" + ":")', 
    text : "category",
    icon : ["fas fa-folder-open"],
    sub : {
    },
  },

  "wikispecial" : {
    text : "template page",
    icon : ["fab fa-uikit"],
    sub : {
    },
  },

// === topical tags ===

  "location" : {
    text : "location",
    icon : ["fas fa-map-marker-alt"],
    sub : {
      "country" : {
        text : "country",
        icon : ["fas fa-globe-americas"],
      },
      "mountain" : {
        text : "mountain",
        icon : ["fas fa-mountain"],
      },
    },
  },

  "time" : {
    text : "time / period / event",
    icon : ["far fa-clock"],
    sub : {
      "accident" : {
        text : "accident",
        icon : ["fas fa-bolt"],
      },
    },
  },

  // === human-related topics ===

  "organization" : {
    text : "human organization",
    icon : ["far fa-handshake"],
    sub : {
      "business-chain" : {
        text : "business chain",
        icon : ["fas fa-store"],
      },
      "museum" : {
        text : "museum",
        icon : ["fas fa-university"],
      },
      "music-group" : {
        text : "music group",
        icon : ["far fa-handshake", "fas fa-music"],
      }
    },
  },

  "group" : {
    text : "human grouping (not an organization)",
    icon : ["fas fa-hand-holding-heart"],
    sub : {
      "nobility" : {
        text : "nobility",
        icon : ["fas fa-crown"],
      },
      "nobility-family" : {
        text : "nobility family",
        icon : ["fas fa-crown"],
      },

    },
  },

  "work" : {
    text : "created work",
    icon : ["fas fa-hands"],
    sub : {
      "symbol" : {
        text : "symbol",
        icon : ["fas fa-shield-alt"],
      },
      "satellite" : {
        text : "satellite",
        icon : ["fas fa-satellite"],
      },
      "ship" : {
        text : "ship",
        icon : ["fas fa-ship"],
      },
      "fictional-entity" : {
        text : "fictional entity",
        icon : ["fas fa-mask"],
      },
      "dish" : {
        text : "food dish",
        icon : ["fas fa-utensils"],
      },
      "beverage" : {
        text : "beverage",
        icon : ["fas fa-wine-glass-alt"],
      },
      "written-work" : {
        text : "written work",
        icon : ["fas fa-book"],
      },
      "periodical" : {
        text : "periodical publication",
        icon : ["far fa-newspaper"],
      },
      "comics" : {
        text : "comics",
        icon : ["fas fa-mask"],
      },
      "video-game" : {
        text : "video game",
        icon : ["fas fa-gamepad"],
      },
      "music" : {
        text : "music release",
        icon : ["fas fa-music"],
      },
      "film" : {
        text : "film",
        icon : ["fas fa-film"],
      },
      "tv-series" : {
        text : "TV series",
        icon : ["fas fa-ellipsis-h", "fas fa-film"],
        //icon : ["fas fa-grip-lines-vertical", "fas fa-film"],
      },
      "submarine-communications-cable" : {
        text : "submarine communications cable",
        icon : ["fas fa-route"],
      },
      "flag" : {
        text : "flag",
        icon : ["far fa-flag"],
      },
      "website" : {
        text : "website",
        icon : ["far fa-copy"],
      },
      "software" : {
        text : "software",
        icon : ["far fa-window-restore"],
      },
      "cryptocurrency" : {
        text : "cryptocurrency",
        icon : ["fab fa-bitcoin"],
      },
    },
  },

  "person" : {
    text : "person",
    icon : ["fas fa-user-alt"],
    sub : {
      // TODO: writer, composer, ...
      "scientist" : {
        text : "scientist",
        icon : ["fas fa-user-graduate"],
      },
      "musician" : {
        text : "musician",
        icon : ["fas fa-user-alt", "fas fa-music"],
      },
      "painter" : {
        text : "painter",
        icon : ["fas fa-user-alt", "fas fa-palette"],
      },
      "filmmaker" : {
        text : "filmmaker",
        icon : ["fas fa-user-alt", "oma oma-black-movie-camera"],
      },
      "actor" : {
        text : "actor",
        icon : ["fas fa-user-alt", "oma oma-black-performing-arts"],
      },
    },
  }, 

  "cultural-concept" : {
    text : "cultural concept",
    icon : ["fas fa-people-carry"],
    sub : {
     "role" : { // TODO: may need some more thought/accuracy/work
        text : "field-of-work or role",
        icon : ["far fa-address-card"],
      },
     "rank" : { // TODO: may need some more thought/accuracy/work
        text : "position rank",
        icon : ["far fa-address-card"],
      },
      "music-genre" : {
        text : "music genre",
        icon : ["fas fa-music"],
      },
      "religion" : {
        text : "religious concept",
        icon : ["fas fa-dharmachakra"],
      },
      "mythology" : {
        text : "mythological concept",
        icon : ["fas fa-dragon"],
      },
      "education" : {
        text : "educational concept",
        icon : ["fas fa-graduation-cap"],
      },
      "road" : {
        text : "road",
        icon : ["fas fa-road"],
      },
      "network" : {
        text : "network",
        icon : ["fas fa-network-wired"],
      },
      "movement" : {
        text : "movement",
        icon : ["fas fa-holly-berry"],
      },
      "tonality" : {
        text : "tonality",
        icon : ["fab fa-itunes-note"],
      },
    },
  },

  // === nature-related topics ===

  "organism" : {
    text : "organism",
    icon : ["fas fa-paw"],
    sub : {
      "bird" : {
        text : "bird",
        icon : ["fas fa-crow"],
      },
      "mushroom" : {
        text : "mushroom",
        icon : ["oma oma-black-champignon-brown"],
      },
      "amphibian" : {
        text : "amphibian",
        icon : ["fas fa-frog"],
      },
      "insect" : {
        text : "insect",
        icon : ["fas fa-bug"],
      },
      "reptile" : {
        text : "reptile",
        icon : ["oma oma-black-lizard"],
      },
      "plant" : {
        text : "plant",
        icon : ["fab fa-pagelines"],
      },
      "plant-organ" : {
        text : "plant organ",
        icon : ["fas fa-seedling"],
      },
    },
  },

  "substance" : { // synthetic or natural substances
    text : "substance",
    icon : ["fab fa-react"],
    sub : {
     "periodic-table-element" : {
        text : "periodic table element",
        icon : ["fab fa-react"],
      },
     "chromosome" : {
        text : "chromosome",
        icon : ["fas fa-dna"],
      },
     "gene" : {
        text : "gene",
        icon : ["fas fa-dna"],
      },
     "genome" : {
        text : "genome",
        icon : ["fas fa-dna"],
      },
     "mineral" : {
        text : "genome",
        icon : ["far fa-gem"],
      },
    },
  },

  "natural-type" : { // clearly a concrete natural *physical thing*: planet, snowflake, organs, ...
    text : "natural entity (not an organism)",
    icon : ["far fa-snowflake"],
    sub : {
     "astronomical-object" : {
        text : "astronomical object",
        icon : ["far fa-sun"],
      },
    },
  }, 

  "natural-concept" : { // more abstract natural concepts
    text : "natural concept",
    icon : ["fas fa-temperature-high"],
    sub : {
     "chemistry" : {
        text : "chemistry",
        icon : ["fab fa-react"],
      },
     "geology" : {
        text : "geology",
        icon : ["fas fa-globe-africa"],
      },
     "astronomy" : {
        text : "astronomy",
        icon : ["far fa-sun"],
      },
     "anatomy" : {
        text : "anatomy",
        icon : ["fas fa-brain"],
      },
     "medical-condition" : {
        text : "medical condition",
        icon : ["fas fa-stethoscope"],
      },
     "animal-disease" : {
        text : "animal disease",
        icon : ["fas fa-bacterium"],
      },
     "human-disease" : {
        text : "human disease",
        icon : ["fas fa-stethoscope"],
      },
     "human-disease-cause" : {
        text : "human disease cause",
        icon : ["fas fa-stethoscope"],
      },
     "personal-concept" : {
        text : "personal concept",
        icon : ["fas fa-street-view"],

      },
     "geographical-structure" : { // may need a better classification
        text : "geographical structure",
        icon : ["fab fa-firstdraft"],
        //icon : ["fab fa-schlix"],
        //icon : ["fas fa-dungeon"],
      },
    },
  },

  // === abstract topics ===

  "meta-concept" : {
    text : "meta concept",
    icon : ["fas fa-cubes"],
    sub : {
     "mathematics" : {
        text : "mathematical concept",
        icon : ["fas fa-square-root-alt"],
      },
      /*
     "risk" : {
        text : "risk",
        icon : ["fas fa-radiation-alt"],
      },
      */

    },
  },

};

var conzept_tag_names = Object.entries( conzept_tags );

/*

steps for un-classified topics:
  - first get the "tag1"
  - then optionally set the "tag2"
  - ...

main subjects:
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

*/
