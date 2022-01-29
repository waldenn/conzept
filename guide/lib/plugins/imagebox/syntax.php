<?php
/**
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     FFTiger <fftiger@wikisquare.com>, myst6re <myst6re@wikisquare.com>
 */

if(!defined('DOKU_INC')) define('DOKU_INC',realpath(dirname(__FILE__).'/../../').'/');
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_imagebox extends DokuWiki_Syntax_Plugin {

	function getType(){ return 'protected'; }
	function getAllowedTypes() { return array('substition','protected','disabled','formatting'); }
	function getSort(){ return 315; }
	function getPType(){ return 'block'; }
	function connectTo($mode) {	$this->Lexer->addEntryPattern('\[\{\{[^\|\}]+\|*(?=[^\}]*\}\}\])',$mode,'plugin_imagebox'); }
	function postConnect() { $this->Lexer->addExitPattern('\}\}\]','plugin_imagebox'); }

	function handle($match, $state, $pos, Doku_Handler $handler){
		switch($state){
			case DOKU_LEXER_ENTER:
				$match=Doku_Handler_Parse_Media(substr($match,3));

                $dispMagnify = ($match['width'] || $match['height']) && $this->getConf('display_magnify')=='If necessary' || $this->getConf('display_magnify')=='Always';

				$image_size = false;
				list($src,$hash) = explode('#',$match['src'],2);

				if($match['type']=='internalmedia') {
					global $ID;
					$exists = false;
					resolve_mediaid(getNS($ID), $src, $exists);

					if($dispMagnify) {
						$match['detail'] = ml($src,array('id'=>$ID,'cache'=>$match['cache']),($match['linking']=='direct'));
						if($hash) $match['detail'] .= '#'.$hash;
					}

					if($exists)	$image_size = @getImageSize(mediaFN($src));
				}
				else {
					if($dispMagnify) {
						$match['detail'] = ml($src,array('cache'=>'cache'),false);
						if($hash) $match['detail'] .= '#'.$hash;
					}

					$image_size = @getImageSize($src);
				}

				$match['exist'] = $image_size!==false;

                if($match['exist']){
                    if(is_null($match['width']) && is_null($match['height'])) {
                        $match['width'] = $image_size[0];
                        $match['height'] = $image_size[1];
                    }else {
                        if (is_null($match['width'])) {
                            $match['width'] = round($match['height'] * $image_size[0] / $image_size[1]);
                        }
                        if (is_null($match['height'])) {
                            $match['height'] = round($match['width'] * $image_size[1] / $image_size[0]);
                        }
                    }
                }

				if(!$match['align'] /*|| $match['align']=='center'*/&&!$this->getConf('center_align'))
					$match['align'] = 'rien';
			return array($state,$match);

			case DOKU_LEXER_UNMATCHED:
			return array($state,$match);

			case DOKU_LEXER_EXIT:
			return array($state,$match);
		}
	}

	function render($mode, Doku_Renderer $renderer, $data){

		global $ID;
                if($mode == 'metadata'){
			list($state,$match) = $data;

			switch($state){
				case DOKU_LEXER_ENTER:
                                    list ($src) = explode('#', $match['src'], 2);
                                    if(media_isexternal($src)) return;
                                    resolve_mediaid(getNS($ID), $src, $exists);
                                    $renderer->meta['relation']['media'][$src] = $exists;
                                    $renderer->persistent['relation']['media'][$src] = $exists;
                        }
                }


		if($mode == 'xhtml'){
			list($state,$match) = $data;

			switch($state){
				case DOKU_LEXER_ENTER:
					$renderer->doc.= '<div class="thumb2 t'.$match['align'].'"><div class="thumbinner">';
					if($match['exist'])
						$renderer->{$match['type']}($match['src'],$match['title'],'box2',$match['width'],$match['height'],$match['cache'],$match['linking']);
					else
						$renderer->doc.= 'Invalid Link';
					$renderer->doc.= '<div class="thumbcaption" style="max-width: '.($match['width']-6).'px">';
					if($match['detail']) {
						$renderer->doc.= '<div class="magnify">';
						$renderer->doc.= '<a class="internal" title="'.$this->getLang('enlarge').'" href="'.$match['detail'].'" target="_blank">';
						$renderer->doc.= '<img width="15" height="11" alt="" src="'.DOKU_BASE.'lib/plugins/imagebox/magnify-clip.png"/>';
						$renderer->doc.= '</a></div>';
					}
				break;

				case DOKU_LEXER_UNMATCHED:
					$style=$this->getConf('default_caption_style');
					if($style=='Italic')	$renderer->doc .= '<em>'.$renderer->_xmlEntities($match).'</em>';
					elseif($style=='Bold')	$renderer->doc .= '<strong>'.$renderer->_xmlEntities($match).'</strong>';
					else 					$renderer->doc .= $renderer->_xmlEntities($match);
				break;

				case DOKU_LEXER_EXIT:
					$renderer->doc.= '</div></div></div>';
				break;
			}
			return true;
		}
		return false;
	}
}

//Setup VIM: ex: et ts=4 enc=utf-8 :
