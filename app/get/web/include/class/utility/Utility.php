<?php

class Utility {

    /**
     * Used to parse string parameter values such as `load-image=false`.
     *
     * If parsed normally string like `true`, `false` will be considered a true value.
     * This method converts them into a boolean value.
     *
     * @param $isValue
     * @return boolean
     */
    static public function getBoolean( $ibsValue ) {
        if ( is_bool( $ibsValue ) ) {
            return $ibsValue;
        }
        if ( is_numeric( $ibsValue ) ) {   // includes string numbers
            return ( boolean ) $ibsValue;
        }
        if ( is_string( $ibsValue ) ) {
            $_sBoolean = strtolower( $ibsValue );
            return 'false' === $_sBoolean
                ? false
                : true;
        }
        // for integer and other types.
        return ( boolean ) $ibsValue;
    }
    
    static public function getOneFromList( $sListFilePath ) {

        $_abList = file( $sListFilePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES );
        if ( empty( $_abList ) ) {
            return null;
        }
        $_aList = $_abList;
        shuffle( $_aList );
        return reset($_aList );

    }

    static public function getCopyRight( $sCopyRightHolder, $iStartYear=2018 ) {

        $_sCurrentYear = date('Y'); // Keeps the second year updated
        $_sYear = $iStartYear
            . ( ( string ) $iStartYear !== $_sCurrentYear
                ? '-' . $_sCurrentYear
                : ''
            );
        return '&copy; Copyright ' . $_sYear . ' ' . $sCopyRightHolder;

    }

    static public function getSubDirPaths( $sDirPath, array $aExcludeNames=array() ) {
        $_aDirs = array_filter( glob( "{$sDirPath}/*" ), 'is_dir' );
        $_aFormat = array();
        foreach( $_aDirs as $_iIndex => $_sPath ) {
            $_sDirName = basename( $_sPath );
            if ( in_array( $_sDirName, $aExcludeNames ) ) {
                continue;
            }
            $_aFormat[] = str_replace('\\', '/', $_sPath );
        }
        return $_aFormat;
    }

    public static function deleteDir($dirPath) {
        if (! is_dir($dirPath)) {
            throw new InvalidArgumentException("$dirPath must be a directory");
        }
        if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
            $dirPath .= '/';
        }
        $files = glob($dirPath . '*', GLOB_MARK);
        foreach ($files as $file) {
            if (is_dir($file)) {
                self::deleteDir($file);
            } else {
                unlink($file);
            }
        }
        rmdir($dirPath);
    }


    static public function getArchitecture() {
        return 2147483647 == PHP_INT_MAX 
            ? '86'
            : '64';       
    }

    static public function getOS() {
        if ( 'WIN' === strtoupper( substr( PHP_OS, 0, 3 ) ) ) {
            return 'WIN';
        }
        if ( false !== strpos( getenv("HTTP_USER_AGENT") , "Mac" ) ) {
            return 'MAC';
        }
        return 'UNIX';
    }

    static public function getYesNo( $value ) {
        return empty( $value )
            ? 'No'
            : 'Yes';
    }
    
    static public function listFolderFiles($dir){
        $ffs = scandir($dir);

        unset($ffs[array_search('.', $ffs, true)]);
        unset($ffs[array_search('..', $ffs, true)]);

        // prevent empty ordered elements
        if (count($ffs) < 1)
            return;

        echo '<ol>';
        foreach($ffs as $ff){
            echo '<li>'.$ff;
            if( is_dir($dir.'/'.$ff) ) {
                self::listFolderFiles($dir.'/'.$ff);
            }
            echo '</li>';
        }
        echo '</ol>';
    }

    
}

