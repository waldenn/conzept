<?php
/**
 * Displays a response as JSON.
 */
class Scraper_json extends Scraper_html {

    protected $_sType = 'json';

    protected function _getContent() {

        $_oBrowser  = new Browser(
            $this->_aBaseArguments[ 'binary_path' ],
            $this->_aBaseArguments[ 'user_agent' ],
            $this->_aBaseArguments[ 'headers' ],
            $this->_aClientArguments
        );
        $_oBrowser->setRequestArguments( $this->_aRequestArguments );
        $_oResponse = $_oBrowser->get( $this->_aBaseArguments[ 'url' ] );
        return json_encode( $_oResponse );

    }

}