<?php
use JonnyW\PhantomJs\Client;

abstract class PhantomJSWrapper {

    /**
     * @var Client
     */
    public $oClient;

    protected $_sUserAgent = '';

    protected $_aHeaders = array();

    /**
     * Request specific arguments. (vs client arguments)
     * Should be referred when get() is performed.
     * @remark  should be overridden by an extended class.
     * @var array
     */
    protected $_aRequestArguments = array();
    private   $___aDefaultRequestArguments = array(
        'method'    => 'GET',
        'timeout'   => 10000,   // n seconds * 1000
        'delay'     => 5,       // delay to wait for complete page load
        'data'      => array(),  // for POST data
    );

    /**
     * PhantomJSWrapper constructor.
     *
     * @param string string          $sPhantomJSBinaryPath
     * @param string string          $sUserAgent
     * @param array  array           $aHeaders
     * @param array  array|string    $asPhantomJSConfig  An array holding PhantomJS client configurations or a string of config file path.
     */
    public function __construct( $sPhantomJSBinaryPath='', $sUserAgent='', array $aHeaders=array(), $asPhantomJSConfig=array() ) {

        // @see http://jonnnnyw.github.io/php-phantomjs/4.0/3-usage/#custom-headers
        $this->oClient = Client::getInstance();
        $this->oClient->isLazy(); // Tells the client to wait for all resources before rendering

        // Configurations
        $this->___setConfigurations( $this->oClient, $asPhantomJSConfig );

        // Binary Path
        if ( file_exists( $sPhantomJSBinaryPath ) ) {
            $this->oClient->getEngine()->setPath( str_replace('\\', '/', $sPhantomJSBinaryPath ) );
        }

        $this->_sUserAgent = $sUserAgent;
        $this->_aHeaders   = $aHeaders;

        // Format default request arguments.
        $this->_aRequestArguments = $this->_aRequestArguments + $this->___aDefaultRequestArguments;

    }

        /**
         * @param Client $oClient
         * @param $asConfig
         */
        private function ___setConfigurations( Client $oClient, $asConfig ) {
            if ( is_array( $asConfig ) ) {
                foreach( $asConfig as $_sKey => $_mValue ) {
                    // $oClient->getEngine()->addOption('--load-images=true');
                    // $oClient->getEngine()->addOption('--ignore-ssl-errors=true');
                    $_sValue = $this->___getValueSanitized( $_mValue );
                    $oClient->getEngine()->addOption("--{$_sKey}={$_sValue}" );
                }
                return;
            }
            if ( ! is_string( $asConfig ) ) {
                return;
            }
            // At this point it is assumed to be a path

            // Set config
            // @see http://phantomjs.org/api/command-line.html
            $_sConfigPath          = str_replace('\\', '/', $sPhantomJSConfigPath );
            if ( file_exists( $_sConfigPath ) ) {
                $oClient->getEngine()->addOption('--config="' . $_sConfigPath . '"' );
            }

        }
            /**
             * @param $mValue
             *
             * @return string   a literal string of `true` or `false`, or a string value.
             */
            private function ___getValueSanitized( $mValue ) {
                if ( is_bool( $mValue ) ) {
                    return $mValue ? 'true' : 'false';
                }
                if ( is_numeric( $mValue ) ) {
                    return $mValue ? 'true' : 'false';
                }
                return ( string ) $mValue;
            }

    /**
     * @return array
     */
    protected function _getRequestArguments( array $aOverride=array() ) {
        return $aOverride + $this->_aRequestArguments;
    }
    public function setRequestArguments( array $aOverride=array() ) {
        $this->_aRequestArguments = $aOverride + $this->_aRequestArguments;
    }

}
