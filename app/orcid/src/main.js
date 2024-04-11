// Created by michaelcrabb on 05/03/2017.

let orcidID = getParameterByName('id') || '';

if ( valid( orcidID ) ){

  createORCIDProfile(orcidID, 'publications');

}

function createORCIDProfile(orcidID, elementID) {

  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/works";

  console.log( ORCIDLink );

  fetch(ORCIDLink,

      {
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

        // Examine the text in the response
        response.json().then(function(data) {

          ////DEBUG!
          console.log(data);

          var output = "";
          for (var i in data.group) {
            //PAPER NAME
            if (data.group[i]["work-summary"]["0"].title.title.value != null) {
              var publicationName = data.group[i]["work-summary"]["0"].title.title.value;
            }


            //PUBLICATION YEAR
            if (data.group[i]["work-summary"]["0"]["publication-date"] != null) {
              var publicationYear = data.group[i]["work-summary"]["0"]["publication-date"].year.value;
            } else {
              var publicationYear = "";
            }

            //DOI REFERENCE
            if (data.group[i]["external-ids"]["external-id"]["length"] != 0) {
              for (var j in data.group[i]["external-ids"]["external-id"]) {
                if (data.group[i]["external-ids"]["external-id"][j]["external-id-type"] == 'doi') {
                  var doiReference = data.group[i]["external-ids"]["external-id"][j]["external-id-value"];
                  break;
                }
              }
            } else {
              var doiReference = "";
            }

            //JOURNAL NAME
            var putcode = data.group[i]["work-summary"]["0"]["put-code"];
            //console.log(journalTitle);

            //output += "<p><span id='publication_" + i + "'><strong>" + publicationName + "</strong>";
            //output += " (" + publicationYear + ") </em></span>";
            //output += " <a href='https://doi.org/" + doiReference + "'> " + doiReference + "</a></p>";

            let url_string = `https://doi.org/${ doiReference }`;

            output +=`
            <div id="item">
              ${ publicationYear  }
              <span id="exploreTopic"><button onclick="gotoExplore( &quot;${ publicationName }&quot;)" onauxclick="gotoExplore( true )" class="dropbtn" title="explore this topic" aria-label="explore this topic"><span class="icon"><i class="fas fa-retweet"></i></span></button></span>
              <a class="item-link" href="javascript:void(0)" onclick="openLink( &quot;${ url_string }&quot; )">${ publicationName }</a>
            </div>
          `;

            getJournalTitle(orcidID, putcode, i);

          }

          document.getElementById(elementID).innerHTML = output;

        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

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
      console.log('Fetch Error :-S', err);
    });

}

function createORCIDFundingProfile(orcidID, elementID) {

  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/fundings";

  fetch(ORCIDLink,

      {
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

          ////DEBUG!
          // console.log(data);

          var output = "";
          for (var i in data.group) {
            //GET PUT CODES
            var putcode = data.group[i]["funding-summary"]["0"]["put-code"];
            getFundingInformation(putcode, orcidID, elementID)
          }

          document.getElementById(elementID).innerHTML = output;
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

function getFundingInformation(putcode, orcidID, elementID) {
  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/funding/" + putcode;

  fetch(ORCIDLink,

      {
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

          ////DEBUG!
          //console.log(data);

          if (data["title"] != null) {
            var fundingTitle = data["title"]["title"].value;
          } else {
            var fundingTitle = "";
          }

          if (data["organization-defined-type"].value != null) {
            var fundingType = data["organization-defined-type"].value;
          } else {
            var fundingType = "";
          }

          if (data["organization"]["name"] != null) {
            var fundingBody = data["organization"]["name"];
          } else {
            var fundingBody = "";
          }

          if (data["start-date"]["year"] != null) {
            var startDate = data["start-date"]["year"].value;
          } else {
            var startDate = "";
          }

          var output = "<p>";
          output += "<strong>" + fundingTitle + "</strong> ";
          output += "(" + startDate + "), "
          output += fundingBody + " <em>(" + fundingType + ")</em>";
          output += "</p>";

          document.getElementById(elementID).innerHTML = output + document.getElementById(elementID).innerHTML;

        });

      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}
