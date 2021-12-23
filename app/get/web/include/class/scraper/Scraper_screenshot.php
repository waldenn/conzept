<?php

/**
 * Displays a response as a screenshot.
 */
class Scraper_screenshot extends Scraper_Base {

    protected $_sType = 'screenshot';

    protected function _construct() {

        // Sanitize parameters
        $this->_aClientArguments[ 'load-images' ] = isset( $_REQUEST[ 'load-images' ] ) && ! Utility::getBoolean( $_REQUEST[ 'load-images' ] )
            ? false
            : true;
        
        $this->_aRequestArguments[ 'width' ] = isset( $_REQUEST[ 'width' ] )
            ? ( integer ) $_REQUEST[ 'width' ]
            : 480;
        $this->_aRequestArguments[ 'height' ] = isset( $_REQUEST[ 'height' ] )
            ? ( integer ) $_REQUEST[ 'height' ]
            : null; // to get all the height

    }

    public function do() {

        // Check cache
        $_aRequestArguments = $this->_aRequestArguments;
        $_sFileType      = in_array( $_aRequestArguments[ 'file-type' ], array( 'jpg', 'pdf', 'png', 'jpeg', 'bmp', 'ppm' ) )
            ? $_aRequestArguments[ 'file-type' ]
            : 'jpg';
        $_sFileBaseName  = $this->_getRequestCacheName() . ".{$_sFileType}";
        $_sFilePath      = $this->_sCacheDirPathToday . '/' . $_sFileBaseName;

        // Use cache
        if ( file_exists( $_sFilePath ) ) {
            $_iModifiedTime  = ( integer ) filemtime( $_sFilePath );
            if ( $_iModifiedTime + ( ( integer ) $this->_aBaseArguments[ 'cache_lifespan' ] ) > time() ) {
                $this->___render( $_sFilePath );
                return;
            }
        }

        $_oScreenCapture = new ScreenCapture(
            $this->_aBaseArguments[ 'binary_path' ],
            $this->_aBaseArguments[ 'user_agent' ],
            $this->_aBaseArguments[ 'headers' ],
            $this->_aClientArguments
        );

        /// Request Arguments
        $_aRequestArguments[ 'file_path' ] = $_sFilePath;
        $_aRequestArguments[ 'file_type' ] = $_sFileType;
        $_oScreenCapture->setRequestArguments( $_aRequestArguments );

        /// Get a response
        $_oScreenCapture->get( $this->_aBaseArguments[ 'url' ] );

        /// Render the image
        $this->___render( $_sFilePath );

    }

        private function ___render( $sFilePath ) {
            $_aImageInfo = getimagesize( $sFilePath );
            header("Content-type: {$_aImageInfo[ 'mime' ]}" );
            readfile( $sFilePath );
        }

}