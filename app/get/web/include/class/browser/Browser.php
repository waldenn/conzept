<?php

class Browser extends PhantomJSWrapper {

    public function get( $sURL ) {

        $_aRequestArguments = $this->_getRequestArguments();
        
        $request  = $this->oClient->getMessageFactory()->createRequest( $sURL, $_aRequestArguments[ 'method' ] );
        $request->setTimeout( $_aRequestArguments[ 'timeout' ] );
        $request->setDelay( $_aRequestArguments[ 'delay' ] );

        // @see https://github.com/jonnnnyw/php-phantomjs/issues/208
        if ( $this->_sUserAgent ) {
            $request->addSetting( 'userAgent', $this->_sUserAgent );
        }

        // @see http://jonnnnyw.github.io/php-phantomjs/4.0/3-usage/#custom-headers
        $request->addHeaders( $this->_aHeaders );

        // @see http://jonnnnyw.github.io/php-phantomjs/3.0/3-usage/#post-request
        if ( 'POST' === $_aRequestArguments[ 'method' ] ) {
            $request->setRequestData( $_aRequestArguments[ 'data' ] ); // Set post data
        }

        $response = $this->oClient->getMessageFactory()->createResponse();

        $this->oClient->send( $request, $response );
        return $response;

    }

}