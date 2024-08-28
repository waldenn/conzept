'use strict';

function autocompleteArxiv( results, dataset ){

  const source = 'arxiv';

  const total = $( results ).find('opensearch\\:totalResults').text() || 0;

  if ( valid( total > 0 ) ){

    $( results ).find('entry').each( function( index ){

      let title = $(this).find('title').text() || '';

      if ( title ){

        dataset.push( title );

      }

    });

  }

}

function processResultsArxiv( topicResults, struct, index ){

  const source = 'arxiv';

  return new Promise(( resolve, reject ) => {

    let total = $( topicResults, ).find('opensearch\\:totalResults').text() || 0;
    total = parseInt( total );

    if ( total === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( total / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = total;

      // standard result structure (modelled after the Wikipedia API)
      let result = {

        source: {

          data: {

            batchcomplete: '',

            continue: {
              'continue': "-||",
              'sroffset': datasources[ source ].pagesize,
              'source': source,
            },

            query: {

              search : [],

              searchinfo: {
                totalhits: datasources[ source ].total,
              },

            },

          },

        },

      };

			// dynamically add an extra Conzept field (only active with this datasource)
      addConzeptField( 'alphaxiv', {
          create_condition: 'activeOnDatasources( [ "arxiv" ], item.source )',
          title: 'alphaXiv - Arxiv paper comments',
          prop: '',
          type: 'link',
          mv: false,
          url: '${item.comment_link}',
          icon: 'fa-regular fa-comments',
          text: 'alphaXiv',
          section: ['science-open-journals','main'],
          rank: [20.1, 8201.1],
          headline_create: 'valid( item.alphaxiv )',
          headline_rank: 251.1,
        }
      );

			$( topicResults ).find('entry').each( function( index ){

   			let title = $(this).find('title').text() || '';

        // URL vars
        const gid         = $(this).find('id').text();
        const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );
        const start_date  = $(this).find('published').text().split('-')[0];
        const doi         = $(this).find('arxiv\\:doi').text();

        let url           = $( $(this).find('link')[1] ).attr('href');
        let doc_url       = $( $(this).find('link')[1] ).attr('href');
        doc_url		        = doc_url.replace('/abs/', '/pdf/');
        const comment_link= doc_url.replace('arxiv.org', 'alphaxiv.org');

        let desc          = $(this).find('summary').text();

        if ( desc.length > explore.text_limit ){

          desc = desc.slice( 0, explore.text_limit ) + ' (...)';

        }

        //console.log( 'input: ', desc );

        desc             = highlightTerms( desc );

        //console.log( 'output: ', desc );

        let creators      = [];
        let concepts      = [];
        let subtag        = 'science-article';
        let img           = '';

        let document_language   = 'en';
        let document_voice_code = explore.voice_code.startsWith( document_language )? explore.voice_code : 'en';
        let tts_link            = doc_url;
        let pdf_link            = doc_url;

				/*
        if ( valid( comment_link ) ){

          desc += `&nbsp;<a onclick="openInFrame( &quot;${comment_url}&quot; )" href="javascript:void(0)" title="alphaXiv comments" aria-label="alphaXiv comments" aria-role="button"><i class="fa-regular fa-comments"></i></a>`; 

        }
				*/

        $(this).find('author').each( function( j ){

          const author_name       = $(this).text().trim();
          const author_search_url = `https://openalex.org/authors?page=1&filter=default.search%3A${ encodeURIComponent( author_name ) }&sort=relevance_score%3Adesc`;

          // FIXME: the link does not work in openalex-in-presentation-mode
          creators.push( `<a onclick="openInFrame( &quot;${author_search_url}&quot; )" href="javascript:void(0)" title="OpenAlex author search" aria-label="OpenAlex author search" aria-role="button">${author_name}</a>`);

        });

        if ( creators.length > 0 ){

          desc += '<br/><br/><div><i class="fa-solid fa-users-line"></i> ' + creators.join(', ') + '</div>';

        }

        if ( valid( doi ) ){

          desc += `<br/><br/><small>${ doi }</small>`; 

        }

        // fill fields
				let item = {
          source:       source,
					title:        stripHtml( title ),
					description:  desc,
					gid:          doc_url, //gid,
					display_url:  doc_url,
					thumb:        img,
          start_date:   $(this).find('published').text(),

          document_language:    document_language,
          document_voice_code:  document_voice_code,
          pdf_tts_link: tts_link,
          pdf_link:     pdf_link,
					comment_link:	comment_link,

					qid:          '',
          countries:    [],
          tags:         [],
				};

				item.tags[0]	= 'work';
				item.tags[1]	= subtag;

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveArxiv( result, renderObject ){

  const source = 'arxiv';


  if ( !valid( result.value[0] ) ){ // no results were found

    datasources[ source ].done = true;

  }
  else if ( result.value[0] === 'done' ){ // done fetching results

    datasources[ source ].done = true;

  }
  else {

    renderObject[ source ] = { data : result };

  }

}

function renderMarkArxiv( inputs, source, q_, show_raw_results, id ){

  // TODO

}

// TODO: map to Qids?
/*
const arxiv_categories = [

	  {
		      'tag': 'cs.AI',
		      'name': 'Artificial Intelligence'
		    },
	  {
		      'tag': 'cs.AR',
		      'name': 'Hardware Architecture'
		    },
	  {
		      'tag': 'cs.CC',
		      'name': 'Computational Complexity'
		    },
	  {
		      'tag': 'cs.CE',
		      'name': 'Computational Engineering, Finance, and Science'
		    },
	  {
		      'tag': 'cs.CG',
		      'name': 'Computational Geometry'
		    },
	  {
		      'tag': 'cs.CL',
		      'name': 'Computation and Language'
		    },
	  {
		      'tag': 'cs.CR',
		      'name': 'Cryptography and Security'
		    },
	  {
		      'tag': 'cs.CV',
		      'name': 'Computer Vision and Pattern Recognition'
		    },
	  {
		      'tag': 'cs.CY',
		      'name': 'Computers and Society'
		    },
	  {
		      'tag': 'cs.DB',
		      'name': 'Databases'
		    },
	  {
		      'tag': 'cs.DC',
		      'name': 'Distributed, Parallel, and Cluster Computing'
		    },
	  {
		      'tag': 'cs.DL',
		      'name': 'Digital Libraries'
		    },
	  {
		      'tag': 'cs.DM',
		      'name': 'Discrete Mathematics'
		    },
	  {
		      'tag': 'cs.DS',
		      'name': 'Data Structures and Algorithms'
		    },
	  {
		      'tag': 'cs.ET',
		      'name': 'Emerging Technologies'
		    },
	  {
		      'tag': 'cs.FL',
		      'name': 'Formal Languages and Automata Theory'
		    },
	  {
		      'tag': 'cs.GL',
		      'name': 'General Literature'
		    },
	  {
		      'tag': 'cs.GR',
		      'name': 'Graphics'
		    },
	  {
		      'tag': 'cs.GT',
		      'name': 'Computer Science and Game Theory'
		    },
	  {
		      'tag': 'cs.HC',
		      'name': 'Human-Computer Interaction'
		    },
	  {
		      'tag': 'cs.IR',
		      'name': 'Information Retrieval'
		    },
	  {
		      'tag': 'cs.IT',
		      'name': 'Information Theory'
		    },
	  {
		      'tag': 'cs.LG',
		      'name': 'Machine Learning'
		    },
	  {
		      'tag': 'cs.LO',
		      'name': 'Logic in Computer Science'
		    },
	  {
		      'tag': 'cs.MA',
		      'name': 'Multiagent Systems'
		    },
	  {
		      'tag': 'cs.MM',
		      'name': 'Multimedia'
		    },
	  {
		      'tag': 'cs.MS',
		      'name': 'Mathematical Software'
		    },
	  {
		      'tag': 'cs.NA',
		      'name': 'Numerical Analysis'
		    },
	  {
		      'tag': 'cs.NE',
		      'name': 'Neural and Evolutionary Computing'
		    },
	  {
		      'tag': 'cs.NI',
		      'name': 'Networking and Internet Architecture'
		    },
	  {
		      'tag': 'cs.OH',
		      'name': 'Other Computer Science'
		    },
	  {
		      'tag': 'cs.OS',
		      'name': 'Operating Systems'
		    },
	  {
		      'tag': 'cs.PF',
		      'name': 'Performance'
		    },
	  {
		      'tag': 'cs.PL',
		      'name': 'Programming Languages'
		    },
	  {
		      'tag': 'cs.RO',
		      'name': 'Robotics'
		    },
	  {
		      'tag': 'cs.SC',
		      'name': 'Symbolic Computation'
		    },
	  {
		      'tag': 'cs.SD',
		      'name': 'Sound'
		    },
	  {
		      'tag': 'cs.SE',
		      'name': 'Software Engineering'
		    },
	  {
		      'tag': 'cs.SI',
		      'name': 'Social and Information Networks'
		    },
	  {
		      'tag': 'cs.SY',
		      'name': 'Systems and Control'
		    },
	  {
		      'tag': 'econ.EM',
		      'name': 'Econometrics'
		    },
	  {
		      'tag': 'econ.GN',
		      'name': 'General Economics'
		    },
	  {
		      'tag': 'econ.TH',
		      'name': 'Theoretical Economics'
		    },
	  {
		      'tag': 'eess.AS',
		      'name': 'Audio and Speech Processing'
		    },
	  {
		      'tag': 'eess.IV',
		      'name': 'Image and Video Processing'
		    },
	  {
		      'tag': 'eess.SP',
		      'name': 'Signal Processing'
		    },
	  {
		      'tag': 'eess.SY',
		      'name': 'Systems and Control'
		    },
	  {
		      'tag': 'math.AC',
		      'name': 'Commutative Algebra'
		    },
	  {
		      'tag': 'math.AG',
		      'name': 'Algebraic Geometry'
		    },
	  {
		      'tag': 'math.AP',
		      'name': 'Analysis of PDEs'
		    },
	  {
		      'tag': 'math.AT',
		      'name': 'Algebraic Topology'
		    },
	  {
		      'tag': 'math.CA',
		      'name': 'Classical Analysis and ODEs'
		    },
	  {
		      'tag': 'math.CO',
		      'name': 'Combinatorics'
		    },
	  {
		      'tag': 'math.CT',
		      'name': 'Category Theory'
		    },
	  {
		      'tag': 'math.CV',
		      'name': 'Complex Variables'
		    },
	  {
		      'tag': 'math.DG',
		      'name': 'Differential Geometry'
		    },
	  {
		      'tag': 'math.DS',
		      'name': 'Dynamical Systems'
		    },
	  {
		      'tag': 'math.FA',
		      'name': 'Functional Analysis'
		    },
	  {
		      'tag': 'math.GM',
		      'name': 'General Mathematics'
		    },
	  {
		      'tag': 'math.GN',
		      'name': 'General Topology'
		    },
	  {
		      'tag': 'math.GR',
		      'name': 'Group Theory'
		    },
	  {
		      'tag': 'math.GT',
		      'name': 'Geometric Topology'
		    },
	  {
		      'tag': 'math.HO',
		      'name': 'History and Overview'
		    },
	  {
		      'tag': 'math.IT',
		      'name': 'Information Theory'
		    },
	  {
		      'tag': 'math.KT',
		      'name': 'K-Theory and Homology'
		    },
	  {
		      'tag': 'math.LO',
		      'name': 'Logic'
		    },
	  {
		      'tag': 'math.MG',
		      'name': 'Metric Geometry'
		    },
	  {
		      'tag': 'math.MP',
		      'name': 'Mathematical Physics'
		    },
	  {
		      'tag': 'math.NA',
		      'name': 'Numerical Analysis'
		    },
	  {
		      'tag': 'math.NT',
		      'name': 'Number Theory'
		    },
	  {
		      'tag': 'math.OA',
		      'name': 'Operator Algebras'
		    },
	  {
		      'tag': 'math.OC',
		      'name': 'Optimization and Control'
		    },
	  {
		      'tag': 'math.PR',
		      'name': 'Probability'
		    },
	  {
		      'tag': 'math.QA',
		      'name': 'Quantum Algebra'
		    },
	  {
		      'tag': 'math.RA',
		      'name': 'Rings and Algebras'
		    },
	  {
		      'tag': 'math.RT',
		      'name': 'Representation Theory'
		    },
	  {
		      'tag': 'math.SG',
		      'name': 'Symplectic Geometry'
		    },
	  {
		      'tag': 'math.SP',
		      'name': 'Spectral Theory'
		    },
	  {
		      'tag': 'math.ST',
		      'name': 'Statistics Theory'
		    },
	  {
		      'tag': 'astro-ph.CO',
		      'name': 'Cosmology and Nongalactic Astrophysics'
		    },
	  {
		      'tag': 'astro-ph.EP',
		      'name': 'Earth and Planetary Astrophysics'
		    },
	  {
		      'tag': 'astro-ph.GA',
		      'name': 'Astrophysics of Galaxies'
		    },
	  {
		      'tag': 'astro-ph.HE',
		      'name': 'High Energy Astrophysical Phenomena'
		    },
	  {
		      'tag': 'astro-ph.IM',
		      'name': 'Instrumentation and Methods for Astrophysics'
		    },
	  {
		      'tag': 'astro-ph.SR',
		      'name': 'Solar and Stellar Astrophysics'
		    },
	  {
		      'tag': 'cond-mat.dis-nn',
		      'name': 'Disordered Systems and Neural Networks'
		    },
	  {
		      'tag': 'cond-mat.mes-hall',
		      'name': 'Mesoscale and Nanoscale Physics'
		    },
	  {
		      'tag': 'cond-mat.mtrl-sci',
		      'name': 'Materials Science'
		    },
	  {
		      'tag': 'cond-mat.other',
		      'name': 'Other Condensed Matter'
		    },
	  {
		      'tag': 'cond-mat.quant-gas',
		      'name': 'Quantum Gases'
		    },
	  {
		      'tag': 'cond-mat.soft',
		      'name': 'Soft Condensed Matter'
		    },
	  {
		      'tag': 'cond-mat.stat-mech',
		      'name': 'Statistical Mechanics'
		    },
	  {
		      'tag': 'cond-mat.str-el',
		      'name': 'Strongly Correlated Electrons'
		    },
	  {
		      'tag': 'cond-mat.supr-con',
		      'name': 'Superconductivity'
		    },
	  {
		      'tag': 'gr-qc',
		      'name': 'General Relativity and Quantum Cosmology'
		    },
	  {
		      'tag': 'hep-ex',
		      'name': 'High Energy Physics - Experiment'
		    },
	  {
		      'tag': 'hep-lat',
		      'name': 'High Energy Physics - Lattice'
		    },
	  {
		      'tag': 'hep-ph',
		      'name': 'High Energy Physics - Phenomenology'
		    },
	  {
		      'tag': 'hep-th',
		      'name': 'High Energy Physics - Theory'
		    },
	  {
		      'tag': 'math-ph',
		      'name': 'Mathematical Physics'
		    },
	  {
		      'tag': 'nlin.AO',
		      'name': 'Adaptation and Self-Organizing Systems'
		    },
	  {
		      'tag': 'nlin.CD',
		      'name': 'Chaotic Dynamics'
		    },
	  {
		      'tag': 'nlin.CG',
		      'name': 'Cellular Automata and Lattice Gases'
		    },
	  {
		      'tag': 'nlin.PS',
		      'name': 'Pattern Formation and Solitons'
		    },
	  {
		      'tag': 'nlin.SI',
		      'name': 'Exactly Solvable and Integrable Systems'
		    },
	  {
		      'tag': 'nucl-ex',
		      'name': 'Nuclear Experiment'
		    },
	  {
		      'tag': 'nucl-th',
		      'name': 'Nuclear Theory'
		    },
	  {
		      'tag': 'physics.acc-ph',
		      'name': 'Accelerator Physics'
		    },
	  {
		      'tag': 'physics.ao-ph',
		      'name': 'Atmospheric and Oceanic Physics'
		    },
	  {
		      'tag': 'physics.app-ph',
		      'name': 'Applied Physics'
		    },
	  {
		      'tag': 'physics.atm-clus',
		      'name': 'Atomic and Molecular Clusters'
		    },
	  {
		      'tag': 'physics.atom-ph',
		      'name': 'Atomic Physics'
		    },
	  {
		      'tag': 'physics.bio-ph',
		      'name': 'Biological Physics'
		    },
	  {
		      'tag': 'physics.chem-ph',
		      'name': 'Chemical Physics'
		    },
	  {
		      'tag': 'physics.class-ph',
		      'name': 'Classical Physics'
		    },
	  {
		      'tag': 'physics.comp-ph',
		      'name': 'Computational Physics'
		    },
	  {
		      'tag': 'physics.data-an',
		      'name': 'Data Analysis, Statistics and Probability'
		    },
	  {
		      'tag': 'physics.ed-ph',
		      'name': 'Physics Education'
		    },
	  {
		      'tag': 'physics.flu-dyn',
		      'name': 'Fluid Dynamics'
		    },
	  {
		      'tag': 'physics.gen-ph',
		      'name': 'General Physics'
		    },
	  {
		      'tag': 'physics.geo-ph',
		      'name': 'Geophysics'
		    },
	  {
		      'tag': 'physics.hist-ph',
		      'name': 'History and Philosophy of Physics'
		    },
	  {
		      'tag': 'physics.ins-det',
		      'name': 'Instrumentation and Detectors'
		    },
	  {
		      'tag': 'physics.med-ph',
		      'name': 'Medical Physics'
		    },
	  {
		      'tag': 'physics.optics',
		      'name': 'Optics'
		    },
	  {
		      'tag': 'physics.plasm-ph',
		      'name': 'Plasma Physics'
		    },
	  {
		      'tag': 'physics.pop-ph',
		      'name': 'Popular Physics'
		    },
	  {
		      'tag': 'physics.soc-ph',
		      'name': 'Physics and Society'
		    },
	  {
		      'tag': 'physics.space-ph',
		      'name': 'Space Physics'
		    },
	  {
		      'tag': 'quant-ph',
		      'name': 'Quantum Physics'
		    },
	  {
		      'tag': 'q-bio.BM',
		      'name': 'Biomolecules'
		    },
	  {
		      'tag': 'q-bio.CB',
		      'name': 'Cell Behavior'
		    },
	  {
		      'tag': 'q-bio.GN',
		      'name': 'Genomics'
		    },
	  {
		      'tag': 'q-bio.MN',
		      'name': 'Molecular Networks'
		    },
	  {
		      'tag': 'q-bio.NC',
		      'name': 'Neurons and Cognition'
		    },
	  {
		      'tag': 'q-bio.OT',
		      'name': 'Other Quantitative Biology'
		    },
	  {
		      'tag': 'q-bio.PE',
		      'name': 'Populations and Evolution'
		    },
	  {
		      'tag': 'q-bio.QM',
		      'name': 'Quantitative Methods'
		    },
	  {
		      'tag': 'q-bio.SC',
		      'name': 'Subcellular Processes'
		    },
	  {
		      'tag': 'q-bio.TO',
		      'name': 'Tissues and Organs'
		    },
	  {
		      'tag': 'q-fin.CP',
		      'name': 'Computational Finance'
		    },
	  {
		      'tag': 'q-fin.EC',
		      'name': 'Economics'
		    },
	  {
		      'tag': 'q-fin.GN',
		      'name': 'General Finance'
		    },
	  {
		      'tag': 'q-fin.MF',
		      'name': 'Mathematical Finance'
		    },
	  {
		      'tag': 'q-fin.PM',
		      'name': 'Portfolio Management'
		    },
	  {
		      'tag': 'q-fin.PR',
		      'name': 'Pricing of Securities'
		    },
	  {
		      'tag': 'q-fin.RM',
		      'name': 'Risk Management'
		    },
	  {
		      'tag': 'q-fin.ST',
		      'name': 'Statistical Finance'
		    },
	  {
		      'tag': 'q-fin.TR',
		      'name': 'Trading and Market Microstructure'
		    },
	  {
		      'tag': 'stat.AP',
		      'name': 'Applications'
		    },
	  {
		      'tag': 'stat.CO',
		      'name': 'Computation'
		    },
	  {
		      'tag': 'stat.ME',
		      'name': 'Methodology'
		    },
	  {
		      'tag': 'stat.ML',
		      'name': 'Machine Learning'
		    },
	  {
		      'tag': 'stat.OT',
		      'name': 'Other Statistics'
		    },
	  {
		      'tag': 'stat.TH',
		      'name': 'Statistics Theory'
		    }
]
*/

