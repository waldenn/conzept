class Utils {
	static arrayUnique(array) {
		var a = array.concat();
		for(var i=0; i<a.length; ++i) {
			for(var j=i+1; j<a.length; ++j) {
				if(a[i] === a[j]) a.splice(j--, 1);
			}
		}
	
		return a;
	}
	static copyTextToClipboard(text) {
		var textArea = document.createElement("textarea");

		textArea.style.position = 'fixed';
		textArea.style.top = 0;
		textArea.style.left = 0;
		textArea.style.width = '2em';
		textArea.style.height = '2em';
		textArea.style.padding = 0;
		textArea.style.border = 'none';
		textArea.style.outline = 'none';
		textArea.style.boxShadow = 'none';
		textArea.style.background = 'transparent';
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();

		try {
			document.execCommand('copy');
			document.body.removeChild(textArea);
			return true;
		} catch(e) {
			console.error(e);
			document.body.removeChild(textArea);
			return false;
		}
	}
	static validateNumber(i, fallback) {
		return (isNaN(i) ? fallback : i);
	}
}
/**
 * Sanitises a given string
 *
 * @param	string	text	Text to sanitise
 * @return	string	Sanitised string
 */
function _e(text) {
	return $('<div/>').text(text).html();
}

function getParameterByName(name, url) {

  if ( !url ){
    url = window.location.href;
  }

  //name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec( url );

  if (!results) return undefined;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, " "));

}
