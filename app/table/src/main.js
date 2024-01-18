let heading     = getParameterByName('t') || '';
const language  = getParameterByName('l') || '';
const filter    = getParameterByName('filter') || '';
const group_by  = getParameterByName('groupby') || '';

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

//console.log( heading, filter, group_by );

async function getData() {

  const response = await fetch( `https://api.openalex.org/works?page=1&filter=${ filter }&group_by=${ group_by }` );

  const data = await response.json();

  //console.log( data.group_by );

  $('#datatable').dataTable({

    columns: [
      { data: 'count' },
      { data: 'key', render: function (data, type, row) {

          //console.log( data, row.key_display_name );

          const key = data.split('/').pop();

          let url_string = '';

          if ( group_by === 'concepts.id' ){

            url_string = `https://openalex.org/works?sort=cited_by_count%3Adesc&column=display_name,publication_year,type,open_access.is_oa,cited_by_count&page=1&filter=${ group_by }%3A${ key },${ filter }`;

          }
          else if ( group_by === 'authorships.institutions.id' ){

            url_string = `https://openalex.org/works?sort=cited_by_count%3Adesc&column=display_name,publication_year,type,open_access.is_oa,cited_by_count&page=1&filter=authorships.institutions.lineage%3A${ key },${ filter }`;

          }

          //console.log( url_string );

          return `
            <a class="name" href="javascript:void(0)" onclick="openLink( &quot;${ url_string }&quot; )">${ row.key_display_name }</a>
            <span id="exploreTopic"><button onclick="gotoExplore( &quot;${ row.key_display_name }&quot;)" onauxclick="gotoExplore( true )" class="dropbtn" title="explore this topic" aria-label="explore this topic"><span class="icon"><i class="fas fa-retweet"></i></span></button></span>
          `;

          //return data.replace( /openalex/g, 'FOO' );

        }
      },

      //{ data: 'key_display_name' },
    ],

    order: [[0, 'desc']],

    data: data.group_by,

    "pageLength": 200,

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


  heading = decodeURI( heading );
  $('#table-title').text( heading );

  getData();

  $( '.search-toggle' ) .on( 'click', function() { $('.input-sm').focus(); });

});

function gotoExplore( title, newtab ){

  const url = CONZEPT_WEB_BASE + '/app/video/#/search/' + title;

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
          if (!$(e.currentTarget).hasClass('disabled')) {
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


