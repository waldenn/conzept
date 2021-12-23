<?php
?>
<!DOCTYPE html>
<html>
<head>

    <!-- site info -->
    <title><?php echo Registry::NAME; ?></title>
    <meta name="description" content="<?php echo Registry::DESCRIPTION; ?>">
    <link rel="canonical" href="https://php-simple-web-scraper.herokuapp.com/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?php echo Registry::NAME; ?> - <?php echo Registry::SUBTITLE; ?>">
    <meta property="og:description" content="<?php echo Registry::DESCRIPTION; ?>">

    <!-- resources -->
    <link rel="stylesheet" type="text/css" href="asset/css/bulma.min.css">
    <link rel="stylesheet" type="text/css" href="asset/font-awesome/css/all.min.css">
    <link rel="stylesheet" href="asset/github-buttons/assets/css/main.css">

</head>
<body>
    <div class="container is-fluid">
        <section class="hero">
          <div class="hero-body">
            <div class="container">              
                <div class="columns">
                    <div class="column">
                        <i class="fa fa-globe" style="font-size:48px;"></i>
                    </div>
                    <div class="column is-full">
                        <h1 class="title" style="line-height: 1.2;">
                        <?php echo Registry::NAME; ?>
                        </h1>         
                    </div>
                </div>
              <h2 class="subtitle">
                  <?php echo Registry::SUBTITLE; ?>
              </h2>
            </div>
          </div>
        </section>    

        <div class="level">
            <div style='width: 50%; margin-left: auto; margin-right: auto; text-align: center;'>
                <p>Type a URL and press <code class="is-small">Go</code>.</p>
                <p>Use the URL shown in the address bar. For advanced usage, see <a href="<?php echo Registry::PROGRAM_URI;?>" target="_blank">here</a>.</p>
            </div>
        </div>
        <div class="columns" style="min-height: 420px;">
            <div class="column is-four-fifths is-offset-1">
                <form method="get">
                    <div class="field has-addons">
                        <p class="control is-expanded has-icons-left">
                            <label>                               
                                <input class="is-medium input" required="required" type="url" name="url" placeholder="Type a URL." />
                                <span class="icon is-small is-left">
                                  <i class="fa fa-arrow-right"></i>
                                </span>          
                            </label>
                        </p>        
                        <p class="control">
                            <label>                               
                                <button class="is-medium button is-primary is-info">Go</button>                                
                            </label>                            
                        </p>                        
                    </div>
                    <p>
                        <label for="html" class="radio">
                            <input id="html" type="radio" name="output" checked="checked" />
                            HTML
                        </label>
                        <label for="json" class="radio">
                            <input id="json" type="radio" name="output" value="json" />
                            JSON
                        </label>
                        <label for="screenshot" class="radio">
                            <input id="screenshot" type="radio" name="output" value="screenshot" />
                            Screenshot
                        </label>
                    </p>
                </form>        
            </div>
            <div class="column"></div>
        </div>

        <footer class="footer">
            <div class="columns is-mobile">
                <div class="column is-3 is-offset-9">
                    <p class="is-pulled-right">
                        <a class="github-button" href="https://github.com/michaeluno/php-simple-web-scraper" data-size="large" data-show-count="true" aria-label="Star michaeluno/php-simple-web-scraper on GitHub">Star</a>
                        <a class="github-button" href="https://github.com/michaeluno/php-simple-web-scraper/fork" data-size="large" data-show-count="true" aria-label="Fork michaeluno/php-simple-web-scraper on GitHub">Fork</a>
                    </p>
                </div>
            </div>
            <div class="content has-text-centered">
                <p>
                    <?php
                    $_sMessage = 'You can create your own proxy scraper.' . '&#13;'
                        . 'Available on GitHub.';
                    echo '<a href="' . Registry::PROGRAM_URI . '" target="_blank" title="' . $_sMessage . '">'
                        . Registry::NAME . ' ' . Registry::VERSION
                        . '</a>&nbsp;';
                    echo sprintf(
                        Utility::getCopyRight( '%1$s', 2018 ),
                        '<a href="' . Registry::AUTHOR_URI . '" target="_blank">' . Registry::AUTHOR . "</a>"
                    ); ?>
                </p>
            </div>
        </footer>           
    </div><!-- .container -->
    <script async defer src="asset/github-buttons/buttons.js"></script>
</body>
</html>
