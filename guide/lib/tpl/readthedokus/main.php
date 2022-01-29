<?php
/**
 * DokuWiki ReadtheDokus Template
 *
 * @link     http://dokuwiki.org/template:readthedokus
 * @author   Masaki Yasutake <my17560@gmail.com>
 * @license  MIT
 */

global $conf, $ID, $INFO;

if (!defined('DOKU_INC')) die();
$showSidebar = page_findnearest($conf['sidebar']);
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php echo $conf['lang'] ?>"
  lang="<?php echo $conf['lang'] ?>" dir="<?php echo $lang['direction'] ?>" class="no-js">
<head>
    <meta charset="UTF-8" />
    <title><?php tpl_pagetitle() ?> [<?php echo strip_tags($conf['title']) ?>]</title>
    <script>(function(H){H.className=H.className.replace(/\bno-js\b/,'js')})(document.documentElement)</script>
    <?php tpl_metaheaders() ?>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <?php echo tpl_favicon(array('favicon', 'mobile')) ?>
    <?php tpl_includeFile('tpl_parts/tpl_meta.html') ?>
    <?php tpl_includeFile('meta.html') ?>

    <link rel="stylesheet" href="/app/explore2/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

</head>
<body id="dokuwiki__top" data-id="<?php echo $ID ?>" data-namespace="<?php echo $INFO['namespace'] ?>" data-useragent="<?php echo $_SERVER['HTTP_USER_AGENT'] ?>">
	<div id="dokuwiki__site" class="<?php echo tpl_classes(); ?> <?php echo ($showSidebar) ? 'hasSidebar' : ''; ?> <?php echo ( $showSidebar ? "showSidebar" : "" ); ?>">
		<!-- Header -->
        <?php tpl_includeFile('tpl_parts/tpl_header.html') ?>

        <div class="wrapper group">
			<!-- Sidebar -->
           	<?php tpl_includeFile('tpl_parts/tpl_sidebar.html') ?>

			<!-- Content -->
			<main id="dokuwiki__content">
        		<?php tpl_includeFile('tpl_parts/tpl_mobileheader.html') ?>
				<div class="group">
            		<?php tpl_includeFile('tpl_parts/tpl_content.html') ?>
				</div>
			</main>
        </div>

		<!-- Footer -->
        <?php tpl_includeFile('tpl_parts/tpl_footer.html') ?>
    </div>

	<!-- Utils -->
    <div class="no" style="display:none"><?php tpl_indexerWebBug() /* provide DokuWiki housekeeping, required in all templates */ ?></div>
	<div id="__media_query"></div>
</body>
</html>
