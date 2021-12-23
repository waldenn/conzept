<?php
/**
 * Displays a response as HTML.
 */
class Scraper_html extends Scraper_Base {

    protected $_sType = 'html';

    public function do() {

        // Check cache
        $_sFileBaseName  = $this->_getRequestCacheName() . ".{$this->_sType}";
        $_sFilePath      = $this->_sCacheDirPathToday . '/' . $_sFileBaseName;

        // Use cache
        if ( file_exists( $_sFilePath ) ) {
            $_iModifiedTime  = ( integer ) filemtime( $_sFilePath );
            if ( $_iModifiedTime + ( ( integer ) $this->_aBaseArguments[ 'cache_lifespan' ] ) > time() ) {
                readfile( $_sFilePath );
                return;
            }
        }

        $_sContent = $this->_getContent();
        echo $_sContent;
        flush();
        file_put_contents( $_sFilePath, $_sContent );   // caching

    }
        protected function _getContent() {
            $_oBrowser  = new Browser(
                $this->_aBaseArguments[ 'binary_path' ],
                $this->_aBaseArguments[ 'user_agent' ],
                $this->_aBaseArguments[ 'headers' ],
                $this->_aClientArguments
            );
            $_oBrowser->setRequestArguments( $this->_aRequestArguments );
            $_oResponse = $_oBrowser->get( $this->_aBaseArguments[ 'url' ] );
            $_sContent  = $_oResponse->getContent();
            if ( $_oResponse->getStatus()&& $_sContent ) {
                return $_sContent;
            }
            // Error
            return "<h2>Failed to Get Response</h2>"
                . "<pre>"
                . htmlspecialchars( print_r( $_oResponse, true ) )
                . "</pre>";

        }

}