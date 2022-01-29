<?php
/**
 * DokuWiki Action Plugin FontFace
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Anika Henke <anika@selfthinker.org>
 */
// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN', DOKU_INC.'lib/plugins/');
if(!defined('DOKU_LF')) define('DOKU_LF', "\n");

require_once(DOKU_PLUGIN.'action.php');

/**
 * All DokuWiki plugins to interfere with the event system
 * need to inherit from this class
 */
class action_plugin_fontface extends DokuWiki_Action_Plugin {

    public function __construct() {
        $this->fontSysDir = DOKU_INC.'lib/plugins/fontface/fonts/';
        $this->fontDir = DOKU_BASE.'lib/plugins/fontface/fonts/';
    }

    // register hook
    function register(Doku_Event_Handler $controller) {
        $controller->register_hook('TPL_METAHEADER_OUTPUT','BEFORE', $this, '_addFontCode');
    }

    /**
     * Add font code (JS and CSS) depending on chosen technique
     *
     * @param unknown_type $event
     * @param unknown_type $param
     */
    function _addFontCode(&$event, $param) {

        $technique     = $this->getConf('technique');
        $fontFileName  = $this->getConf('fontFile');
        $fontFileName2 = $this->getConf('fontFile2');
        $fontName      = $this->getConf('fontName');
        $fontName2     = $this->getConf('fontName2');
        // config option 'elements' used to be called 'headings', fallback to old option for backwards-compatibility
        $headings      = $this->getConf('headings');
        $elements      = !empty($headings) ? $headings : $this->getConf('elements');
        $elements2     = $this->getConf('elements2');

        $CSSfiles = array();
        $CSSembed = '';

        // don't apply anything if no technique is chosen
        if (empty($technique)) {
            return false;
        }

        // incomplete sanity check
        if (empty($fontName) && empty($fontFileName) && empty($fontName2) && empty($fontFileName2)) {
            msg("The FontFace plugin is missing some config settings.", -1);
            return false;
        }

        // prepare CSS and JS to embed depending on the technique
        switch ($technique) {
            case 'fontface':
                $CSSembed .= $this->_getFontFaceCode($fontName, $fontFileName);
                $CSSembed .= $this->_getFontFaceCode($fontName2, $fontFileName2);
                break;

            case 'google':
                $CSSfiles[] = $this->_getGoogleFontPath($fontFileName);
                $CSSfiles[] = $this->_getGoogleFontPath($fontFileName2);
                break;
        }

        // add styles automatically if elements are given, otherwise set them through CSS as usual
        if ( !empty($elements) && !empty($fontName) ) {
            $CSSembed .= $elements." { font-family: '".$fontName."', ".$this->getConf('genericFamily')."; }".NL;
        }
        if ( !empty($elements2) && !empty($fontName2) ) {
            $CSSembed .= $elements2." { font-family: '".$fontName2."', ".$this->getConf('genericFamily2')."; }".NL;
        }

        // include all relevant CSS files
        if (!empty($CSSfiles)){
            foreach($CSSfiles as $CSSfile) {
                $event->data['link'][] = array(
                    'type'    => 'text/css',
                    'rel'     => 'stylesheet',
                    'media'   => 'screen',
                    'href'    => $CSSfile
                );
            }
        }
        // embed all relevant CSS code
        if (!empty($CSSembed)){
            $event->data['style'][] = array(
                'type'    => 'text/css',
                'media'   => 'screen',
                '_data'   => $CSSembed
            );
        }

    }

    /**
     * Check if file option is set and if it exists
     *
     * @param string $file          File to check (path to system directory)
     * @param string $fileDisplay   File to display in error message (path to web directory)
     * @param string $fileConfig    Name of config option
     * @return bool                 If file is okay
     */
    function _isFileOk($file, $fileDisplay, $fileConfig) {
        if (empty($file)) {
            msg("The '<strong>".$fileConfig."</strong>' config setting is <strong>not set</strong>.", -1);
            return false;
        } else if (!file_exists($file)) {
            msg("The file <strong>".$fileDisplay."</strong> (".$fileConfig.") <strong>does not exist</strong>.", -1);
            return false;
        }
        return true;
    }

    /**
     * Get code to embed local uploaded font via @font-face
     *
     * @param string $fontName      Name of the font as used in CSS
     * @param string $fontFileName  File name of the font without extension
     * @return mixed                String of CSS to embed or Bool if there is nothing to embed
     */
    function _getFontFaceCode($fontName, $fontFileName) {
        if (empty($fontName) || empty($fontFileName)) {
            return false;
        }

        $fontSysDir = $this->fontSysDir;
        $fontDir    = $this->fontDir;
        $fontEOT    = $fontFileName.'.eot';
        $fontWOFF   = $fontFileName.'.woff';
        $fontWOFF2  = $fontFileName.'.woff2';
        $fontTTF    = $fontFileName.'.ttf';
        $fontSVG    = $fontFileName.'.svg';

        // check if at least ttf and woff files exist
        if (!$this->_isFileOk($fontSysDir.$fontWOFF, $fontDir.$fontWOFF, 'fontFile') ||
            !$this->_isFileOk($fontSysDir.$fontTTF,  $fontDir.$fontTTF,  'fontFile')) {
            return false;
        }

        $CSSembed       = "@font-face {".NL.
                          "  font-family: '".$fontName."';".NL;
        if (file_exists($fontSysDir.$fontEOT)) {
            $CSSembed   .= "  src: url('".$fontDir.$fontEOT."');".NL;
        }
        $CSSembed       .= "  src: ";
        if (file_exists($fontSysDir.$fontEOT)) {
            $CSSembed   .= "       url('".$fontDir.$fontEOT."?#iefix') format('embedded-opentype'),".NL;
        }
        if (file_exists($fontSysDir.$fontWOFF2)) {
            $CSSembed   .= "       url('".$fontDir.$fontWOFF2."') format('woff2'),".NL;
        }
        $CSSembed       .= "       url('".$fontDir.$fontWOFF."') format('woff'),".NL;
        $CSSembed       .= "       url('".$fontDir.$fontTTF."') format('truetype')";
        if (file_exists($fontSysDir.$fontSVG)) {
            $CSSembed   .= ",".NL;
            $CSSembed   .= "       url('".$fontDir.$fontSVG."#".str_replace(' ', '', $fontName)."') format('svg')";
        }
        $CSSembed       .= ";".NL.
                           "  font-weight: normal;".NL.
                           "  font-style: normal;".NL.
                           "}".NL;
        return $CSSembed;
    }

    /**
     * Get path to Google font
     *
     * @param string $fontFileName  File name of the font without extension
     * @return mixed                String of CSS file path to embed or Bool if there is nothing to embed
     */
    function _getGoogleFontPath($fontFileName) {
        // check if required option is set
        if (empty($fontFileName)) {
            return false;
        }
        return 'https://fonts.googleapis.com/css?family='.str_replace(' ', '+', $fontFileName);
    }

}

// vim:ts=4:sw=4:
