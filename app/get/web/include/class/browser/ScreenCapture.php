<?php

class ScreenCapture extends PhantomJSWrapper {

    /**
     * This class specific arguments.
     *
     * @var array
     */
    protected $_aRequestArguments = array(
        'file_path' => '',  // output file path
        'file_type' => 'jpg', // options: pdf, png, jpeg, bmp, ppm // gif causes an error
        'width'     => 1200,
        'height'    => null,    // null to get all the height
    );

    public function get( $sURL ) {

        $_aRequestArguments = $this->_getRequestArguments();
        $_sOutputFilePath   = str_replace('\\', '/', $_aRequestArguments[ 'file_path' ] );

        /** 
         * @see JonnyW\PhantomJs\Http\CaptureRequest
         **/
        $request = $this->oClient->getMessageFactory()->createCaptureRequest($sURL, $_aRequestArguments[ 'method' ] );
        $request->setBodyStyles( array( 'backgroundColor' => '#ffffff' ) ); // for pages with transparent background
        $request->setOutputFile( $_sOutputFilePath );
        $request->setFormat( $this->_aRequestArguments[ 'file_type' ] );

        $request->setViewportSize(
            $_aRequestArguments[ 'width' ],
            720    // any number will show full height. This number serves as a minimum height.
        );
        if ( $_aRequestArguments[ 'height' ] ) {
            $request->setCaptureDimensions( $_aRequestArguments[ 'width' ], $_aRequestArguments[ 'height' ], 0, 0 );
        }
    
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
    
        // Send the request
        $this->oClient->send( $request, $response );
        return $response;

    }

    /**
     * Formats request arguments.
     * @param array $aOverride
     * @return array
     */
    protected function _getRequestArguments( array $aOverride=array() ) {

        $_aArguments = parent::_getRequestArguments( $aOverride );

        // formatting/sanitization
        if ( ! in_array( $_aArguments[ 'file_type' ], array( 'jpg', 'pdf', 'png', 'jpeg', 'bmp', 'ppm' ) ) ) {
            $_aArguments[ 'file_type' ] = 'jpg';
        }
        return $_aArguments;

    }

}