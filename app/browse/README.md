# Anvesha

Drill-down browser for any installation of Wikibase, including Wikidata. 

## Installation and Usage

The project can be directly cloned using [git](https://git-scm.com/docs) and ran on any server.
```bash
https://github.com/sahajsk21/Anvesha.git
```
## Setup the configuration file

Create a config.js file in the root("/") folder. Following parameters can be set in this file:-
1. **SITE_NAME** : The title of the website. Takes a string value as input.
2. **PREFERRED_LANGUAGES** : An array of language symbols to set the default languages for the website.
3. **RESULTS_PER_PAGE** : Maximum number of results to be displayed on a page. Takes an integer value as input.
4. **FAVICON** : Path for setting the favicon image. Enter the path as a string value.
5. **LOGO** : Path for setting the logo image. Enter the path as a string value.
6. **SUGGESTED_CLASSES** : Class suggestions to be displayed on the homepage. Takes an array of string values of item IDs (prefixed with Q).
7. **SPARQL_ENDPOINT** : URL input as a string value for the Wikibase instance to be used to fetch data.
8. **INSTANCE_OF_PID** : Property ID for [instance of](https://www.wikidata.org/wiki/Property:P31) property. Takes a string value as input.
9. **PROPERTIES_FOR_THIS_TYPE_PID** : Property ID for [properties for this type](https://www.wikidata.org/wiki/Property:P1963) property. Takes a string value as input.
10. **LINKS_IN_TOPNAV** : Links to be added in the top navbar of the website. Takes an object as input with key-value pairs where the key represents the label and value represents the path.

Example :
```javascript
SITE_NAME = "Anvesha"
PREFERRED_LANGUAGES = ["en","fr"]
RESULTS_PER_PAGE = 50
FAVICON = "images/favicon.png"
LOGO = "images/logo.png"
SUGGESTED_CLASSES = [ "Q5", "Q515", "Q523", "Q4022", "Q7366", "Q7397", "Q7889", "Q8502",
 "Q11303", "Q11424","Q16521", "Q43229", "Q178561", "Q188784", "Q215380", "Q746549", "Q3305213",
 "Q4830453", "Q5398426","Q7725634", "Q15632617"]
SPARQL_ENDPOINT = "https://query.wikidata.org/sparql?query="
INSTANCE_OF_PID = "P31"
PROPERTIES_FOR_THIS_TYPE_PID = "P1963"
LINKS_IN_TOPNAV = {
    "Source":"https://github.com/sahajsk21/Anvesha",
}
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[GPL-3.0 License](https://github.com/sahajsk21/Anvesha/blob/master/LICENSE.md)

## Contact
[Yaron koren](https://github.com/yaronkoren) (yaron57@gmail.com)

[Sahaj Khandelwal](https://github.com/sahajsk21) (ksahajk21@gmail.com)