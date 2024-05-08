// Created by michaelcrabb on 05/03/2017.

const orcidID   = getParameterByName('id')  || '';
const name      = getParameterByName('t')   || '';
const my_data   = []
const language  = getParameterByName('l') || 'en';

let parentref   = '';

function detectMobile(){
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent) );
}

if ( detectMobile ){

  parentref = parent;

}
else { // desktop

  if ( window.parent.name === 'infoframeSplit2' || window.parent.name === 'infoframe_' ){ // request from secondary content iframe
    parentref = parent;
  }
  else { // primary content frame
    parentref = parent.top;
  }

}

function createORCIDProfile(orcidID, elementID) {

  const ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/works";

  //console.log( ORCIDLink );

  fetch( ORCIDLink, { headers: { "Accept": "application/orcid+json" } })
  .then(

    function(response) {

      if (response.status !== 200) {

        return;

      }

      response.json().then(function(data) {

        let output = "";

        for ( const i in data.group) {

          let publicationName = '';
          let publicationYear = '';
          let doiReference    = '';
          let putcode         = '';
          let nr_of_citations = 0;
          let citation_level  = 0; // 0-20, see: https://noranta4.medium.com/why-betterscholar-051ffff7e46d

          // paper name
          if ( data.group[i]["work-summary"]["0"].title.title.value != null ) {

            publicationName = data.group[i]["work-summary"]["0"].title.title.value;

          }

          // publication year
          if ( data.group[i]["work-summary"]["0"]["publication-date"] != null ) {

            publicationYear = data.group[i]["work-summary"]["0"]["publication-date"].year.value;

          }
          else {
            publicationYear = "";
          }

          // DOI reference
          if (data.group[i]["external-ids"]["external-id"]["length"] != 0) {

            for ( const j in data.group[i]["external-ids"]["external-id"]) {

              if (data.group[i]["external-ids"]["external-id"][j]["external-id-type"] == 'doi') {

                doiReference = data.group[i]["external-ids"]["external-id"][j]["external-id-value"];

                break;

              }

            }

          }
          else {
            doiReference = "";
          }

          // journal name
          // putcode = data.group[i]["work-summary"]["0"]["put-code"];
          //console.log(journalTitle);

          let url_string = `https://doi.org/${ doiReference }`;

          /*

          // TODO: show citation rank
          // example: https://api.openalex.org/works/https://doi.org/10.4018/jswis.2009081901
          // FIXME: HTTP 423 status code -> rate limited -> solution: ???
          fetch( `https://api.openalex.org/works/${ url_string }` )
          .then(

            function( response ) {

              //console.log( response );

              if ( response.status !== 200) {

                return;

              }

              response.json().then(function( alex ) {

                //console.log( alex );

                if ( valid( alex.cited_by_count ) ){

                  console.log( alex.cited_by_count );
                  nr_of_citations = alex.cited_by_count;

                }

              });

            }

          );
          */

          // HTML rendering
          output +=`
          <div id="item">
            ${ publicationYear }
            <span id="exploreTopic"><button onclick="gotoExplore( &quot;${ publicationName }&quot;)" onauxclick="gotoExplore( true )" class="dropbtn" title="explore this topic" aria-label="explore this topic"><span class="icon"><i class="fas fa-retweet"></i></span></button></span>
            <a class="item-link" href="javascript:void(0)" onclick="openInNewTab( &quot;${ url_string }&quot; )">${ publicationName } ${ nr_of_citations }</a>
          </div>
        `;

          my_data.push( {
            'year' :  publicationYear,
            'title':  publicationName,
            'url':    url_string,
            //'doi':  doiReference,
          } );

          // getJournalTitle(orcidID, putcode, i);

        }

        $('#title').append( `&nbsp; <small>(${ my_data.length }) <a class="orcid" target="_blank" href="https://orcid.org/${ orcidID }"><i class="fa-brands fa-orcid"></i> ${ orcidID }</a></small>` );

        renderTable();

      });
    }
  )
  .catch(function(err) {

    console.log( 'fetch error: ', err );

  });

}

/*
function getJournalTitle(orcidID, journalID, i) {
  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/work/" + journalID;

  console.log( ORCIDLink );

  fetch(ORCIDLink, {
      headers: {
        "Accept": "application/orcid+json"
      }
    })
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        response.json().then(function(data) {
          if (data["journal-title"] != null) {
            var output = data["journal-title"].value;
            document.getElementById("publication_" + i).innerHTML = document.getElementById("publication_" + i).innerHTML + output;
          }
        });
      }
    )
    .catch(function(err) {
      console.log('fetch error: ', err);
    });

}
*/

function renderTable(){

  $('#datatable').dataTable({

    columns: [

      { data: 'year' },
      { data: 'title' , render: function (data, type, row) {

        //console.log( row, type );

        return `
          <a class="name" href="javascript:void(0)" onclick="openInNewTab( &quot;${ row.url }&quot; )">${ row.title  }</a>
          <span id="exploreTopic"><button onclick="gotoExplore( &quot;${ row.title }&quot;)" onauxclick="gotoExplore( true )" class="dropbtn" title="explore this topic" aria-label="explore this topic"><span class="icon"><i class="fas fa-retweet"></i></span></button></span>
        `;

        }

      },

    ],

    order: [[0, 'desc']],

    data: my_data,

    "pageLength": 10,

    oLanguage: {
      "sStripClasses": "",
      "sSearch": "",
      "sSearchPlaceholder": "Enter any keyword here to filter...",
      "sInfo": "_START_ -_END_ of _TOTAL_",
      "sLengthMenu": '<span>Rows per page:</span><select class="browser-default">' +
        '<option value="10">10</option>' +
        '<option value="20">20</option>' +
        '<option value="30">30</option>' +
        '<option value="40">40</option>' +
        '<option value="50">50</option>' +
        '<option value="-1">All</option>' +
        '</select></div>'
    },

    'autoWidth' : false,
    columnDefs: [{ width: '20%', targets: 0 }],

  });

}

$(document).ready(function() {

  $('#title').html( '<i class="fa-brands fa-stack-overflow"></i> ' +  name );

  if ( valid( orcidID ) ){

    createORCIDProfile(orcidID, 'publications');

  }

  $( '.search-toggle' ) .on( 'click', function() { $('.input-sm').focus(); });

});

function gotoExplore( title, newtab ){

  if ( newtab ){

    openInNewTab( 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/explore/' + title + '?l=' + language + '&t=wikipedia&i=' + qid );

  }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: title, hash: '', language: language } }, '*' );

  }

}

(function(window, document, undefined) {

  var factory = function($, DataTable) {
    "use strict";

    $('.search-toggle').click(function() {

      if ($('.hiddensearch').css('display') == 'none')
        $('.hiddensearch').slideDown();
      else
        $('.hiddensearch').slideUp();

    });

    /* Set the defaults for DataTables initialisation */
    $.extend(true, DataTable.defaults, {
      dom: "<'hiddensearch'f'>" +
        "tr" +
        "<'table-footer'lip'>",
      renderer: 'material'
    });

    /* Default class modification */
    $.extend(DataTable.ext.classes, {
      sWrapper: "dataTables_wrapper",
      sFilterInput: "form-control input-sm",
      sLengthSelect: "form-control input-sm"
    });

    /* Bootstrap paging button renderer */
    DataTable.ext.renderer.pageButton.material = function(settings, host, idx, buttons, page, pages) {

      var api     = new DataTable.Api(settings);
      var classes = settings.oClasses;
      var lang    = settings.oLanguage.oPaginate;
      var btnDisplay, btnClass, counter = 0;

      var attach = function(container, buttons) {

        var i, ien, node, button;

        var clickHandler = function(e) {

          e.preventDefault();

          if ( !$(e.currentTarget).hasClass('disabled') ) {

            api.page(e.data.action).draw(false);

          }

        };

        for (i = 0, ien = buttons.length; i < ien; i++) {
          button = buttons[i];

          if ($.isArray(button)) {
            attach(container, button);
          } else {
            btnDisplay = '';
            btnClass = '';

            switch (button) {

              case 'first':
                btnDisplay = lang.sFirst;
                btnClass = button + (page > 0 ?
                  '' : ' disabled');
                break;

              case 'previous':
                btnDisplay = '<i class="material-icons">chevron_left</i>';
                btnClass = button + (page > 0 ?
                  '' : ' disabled');
                break;

              case 'next':
                btnDisplay = '<i class="material-icons">chevron_right</i>';
                btnClass = button + (page < pages - 1 ?
                  '' : ' disabled');
                break;

              case 'last':
                btnDisplay = lang.sLast;
                btnClass = button + (page < pages - 1 ?
                  '' : ' disabled');
                break;

            }

            if (btnDisplay) {
              node = $('<li>', {
                  'class': classes.sPageButton + ' ' + btnClass,
                  'id': idx === 0 && typeof button === 'string' ?
                    settings.sTableId + '_' + button : null
                })
                .append($('<a>', {
                    'href': '#',
                    'aria-controls': settings.sTableId,
                    'data-dt-idx': counter,
                    'tabindex': settings.iTabIndex
                  })
                  .html(btnDisplay)
                )
                .appendTo(container);

              settings.oApi._fnBindAction(
                node, {
                  action: button
                }, clickHandler
              );

              counter++;
            }
          }
        }
      };

      // IE9 throws an 'unknown error' if document.activeElement is used
      // inside an iframe or frame. 
      var activeEl;

      try {
        // Because this approach is destroying and recreating the paging
        // elements, focus is lost on the select button which is bad for
        // accessibility. So we want to restore focus once the draw has
        // completed
        activeEl = $(document.activeElement).data('dt-idx');
      } catch (e) {}

      attach(
        $(host).empty().html('<ul class="material-pagination"/>').children('ul'),
        buttons
      );

      if (activeEl) {
        $(host).find('[data-dt-idx=' + activeEl + ']').focus();
      }
    };

    /*
     * TableTools Bootstrap compatibility
     * Required TableTools 2.1+
     */
    if (DataTable.TableTools) {
      // Set the classes that TableTools uses to something suitable for Bootstrap
      $.extend(true, DataTable.TableTools.classes, {
        "container": "DTTT btn-group",
        "buttons": {
          "normal": "btn btn-default",
          "disabled": "disabled"
        },
        "collection": {
          "container": "DTTT_dropdown dropdown-menu",
          "buttons": {
            "normal": "",
            "disabled": "disabled"
          }
        },
        "print": {
          "info": "DTTT_print_info"
        },
        "select": {
          "row": "active"
        }
      });

      // Have the collection use a material compatible drop down
      $.extend(true, DataTable.TableTools.DEFAULTS.oTags, {
        "collection": {
          "container": "ul",
          "button": "li",
          "liner": "a"
        }
      });
    }

  }; // /factory

  // Define as an AMD module if possible
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'datatables'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    factory(require('jquery'), require('datatables'));
  } else if (jQuery) {
    // Otherwise simply initialise as normal, stopping multiple evaluation
    factory(jQuery, jQuery.fn.dataTable);
  }

})(window, document);


