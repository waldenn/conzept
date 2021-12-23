<?php
/**
 * Created by PhpStorm.
 * User: Internet
 * Date: 10/23/2018
 * Time: 11:55 PM
 */

class Scraper_Base extends Utility {

    /**
     * Override this value in an extended class.
     * Used to construct a cache directory.
     * @var string
     */
    protected $_sType = '';

    protected $_sCacheDirPath = '';

    protected $_sCacheDirPathToday = '';

    protected $_aBaseArguments = array(
        'url'               => '',
        'user_agent'        => '',
        'method'            => '',
        'headers'           => array(),
        'binary_path'       => '',  // PhantomJS binary path
        'cache_lifespan'    => 1200,    // cache life span in seconds. 1200: 20 minutes,
    );

    protected $_aClientArguments = array(
        'load-images'       => false,
        'output-encoding'   => 'utf8',
        'disk-cache'        => true,
        'disk-cache-path'   => '',
    );

    protected $_aRequestArguments = array(
        'method'            => '',
        'file-type'         => 'jpg',
        'data'              => array(),
    );

    public function __construct( array $aBaseArguments, array $aClientArguments, array $aRequestArguments ) {

        $this->_aBaseArguments    = $aBaseArguments + $this->_aBaseArguments;
        $this->_aClientArguments  = $aClientArguments + $this->_aClientArguments;
        $this->_aRequestArguments = $aRequestArguments + $this->_aRequestArguments;

        $this->___setCacheDirectory();

        $this->_construct();
    }

    public function do() {}

    protected function _construct() {}

    /**
     * Returns a request specific cache name.
     * Even if the request URI is the same, if it is a POST request and the query is different, the cached data shouold be different,
     * Thus, a different cache name is given by request arguments.
     * @return string
     */
    protected function _getRequestCacheName() {
        $_aBaseArguments = $this->_aBaseArguments;
        unset( $_aBaseArguments[ 'cache_lifespan' ] );  // must be removed
        return md5(
            serialize(
                array(
                    $_aBaseArguments,
                    $this->_aClientArguments,
                    $this->_aRequestArguments
                )
            )
        );
    }

    private function ___setCacheDirectory() {

        $this->_sCacheDirPath       = Registry::$sTempDirPath . "/{$this->_sType}/";
        $_sToday                    = date("Ymd" );
        $this->_sCacheDirPathToday  = $this->_sCacheDirPath . $_sToday;
        if ( ! file_exists( $this->_sCacheDirPathToday ) ) {
            mkdir( $this->_sCacheDirPathToday, 0777, true );
        }

        // Delete old cache directories.
        // Directories other than todays will be deleted. This means the cache lifespan cannot be longer than a day.
        $_aSubDirs = $this->getSubDirPaths( $this->_sCacheDirPath, array( $_sToday ) );
        foreach( $_aSubDirs as $_sDirPath ) {
            $this->deleteDir( $_sDirPath );
        }

    }


}