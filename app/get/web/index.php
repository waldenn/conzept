<?php
// Display Errors
error_reporting(E_ALL);
ini_set('display_errors', 1);   

// Basic Information
class Registry {

    const NAME              = 'Simple Web Scraper';
    const SLUG              = 'SimpleWebScraper';
    const SUBTITLE          = 'Fetches even JavaScript generated contents.';
    const DESCRIPTION       = 'A web page content proxy scraper, supporting JavaScript generated contents, a cross domain solution.';
    const PROGRAM_URI       = 'https://github.com/michaeluno/php-simple-web-scraper';
    const VERSION           = '1.3.2';
    const AUTHOR            = 'Michael Uno';
    const AUTHOR_URI        = 'http://en.michaeluno.jp';

    static public $sFilePath = __FILE__;
    static public $sDirPath;
    static public $sTempDirPath;

    static public function setUp() {
        self::$sDirPath     = dirname( self::$sFilePath );
        self::$sTempDirPath = sys_get_temp_dir() . '/' . self::SLUG;
    }
}
Registry::setUp();

// Includes
require dirname( dirname( __FILE__ ) ) . '/vendor/autoload.php';    // composer
require dirname( __FILE__ ) . '/include/class/utility/AdminPageFramework_RegisterClasses.php';  // auto loader
new AdminPageFramework_RegisterClasses(
    array(),
    array(),
    include( dirname( __FILE__ ) . '/include/class-list.php' )
);

// HTTP Headers
header( 'Access-Control-Allow-Origin: *' );

// Front-end Form
if ( ! isset( $_GET[ 'url' ] ) ) {
    include( dirname( __FILE__ ) . '/include/template/form.php' );
    exit;
}
// Fetched Results
$_oScraper = new ScraperHandler;
$_oScraper->do();
exit;