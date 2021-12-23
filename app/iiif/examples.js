$(function() {

    var bootstrapper, editor;
    var uvVersion = 'uv';

    function loadViewer() {

        // todo: update embed.js to work with script loaders.
        if (window.initPlayers && window.easyXDM) {
            initPlayers($('.uv'));
        } else {
            setTimeout(loadViewer, 100);
        }
    }

    function loadConfigSchema(cb) {

        var path = uvVersion + '/schema/' + getConfigName() + '.schema.json';

        $.getJSON(path, function (schema) {
            formatSchema(schema);
            cb(schema);
        }).error(function() {
            cb(null);
        });
    }

    function getConfigName() {
        return bootstrapper.config.name + '.' + getLocale();
    }

    function formatSchema(schema) {
        collapse(jmespath.search(schema, 'properties.*'));
        collapse(jmespath.search(schema, 'properties.modules.properties.*'));
        hide(jmespath.search(schema, 'properties.[localisation]'));
    }

    function collapse(nodes) {
        setOption(nodes, 'collapsed', true);
    }

    function hide(nodes) {
        setOption(nodes, 'hidden', true);
    }

    function setOption(nodes, option, value) {
        for (var i = 0; i < nodes.length; i++){
            var node = nodes[i];

            if (!node.options){
                node.options = {};
            }

            node.options[option] = value;
        }
    }

    function formatUrl(url) {
        var parts = Utils.Urls.getUrlParts(location.href);
        var pathname = parts.pathname;
        if (!pathname.startsWith('/')){
            pathname = '/' + pathname;
        }
        return String.format(url, pathname);
    }

    function loadManifests(cb) {

        // load manifests
        $.getJSON('manifests.json', function(manifests){

            var $manifestSelect = $('#manifestSelect');

            for (var i = 0; i < manifests.collections.length; i++) {
                var collection = manifests.collections[i];

                if (collection.visible === false) continue;

                $manifestSelect.append('<optgroup label="' + collection.label + '">');

                for (var j = 0; j < collection.manifests.length; j++) {
                    var manifest = collection.manifests[j];

                    if (manifest.visible !== false){
                        $manifestSelect.append('<option value="' + manifest['@id'] + '">' + manifest.label + '</option>');
                    }
                }

                $manifestSelect.append('</optgroup>');
            }

            cb();
        });
    }

    function isIE8(){
        return (browserDetect.browser === 'Explorer' && browserDetect.version === 8);
    }

    function createEditor(schema) {

        $('#editor').empty();

        if (isIE8() || typeof(JSONEditor) === 'undefined') {
            return;
        }

        editor = new JSONEditor(document.getElementById('editor'),{
            form_name_root: '',
            theme: 'foundation5',
            iconlib: 'fontawesome4',
            schema: schema,
            disable_edit_json: false,
            disable_properties: true,
            required_by_default: false
        });

        editor.on('change', function() {
            // Get an array of errors from the validator
            var errors = editor.validate();

            // Not valid
            if(errors.length) {
                //console.log(errors);
            }
        });
    }

    function reload() {

        //var testids = $('#testids').is(':checked');
        //var defaultToFullScreen = $('#defaultToFullScreen').is(':checked');
        var manifest = $('#manifest').val();

        // clear hash params
        clearHashParams();

        var qs = document.location.search.replace('?', '');
        //qs = Utils.Urls.UpdateURIKeyValuePair(qs, 'testids', testids);
        //qs = Utils.Urls.UpdateURIKeyValuePair(qs, 'defaultToFullScreen', defaultToFullScreen);
        qs = Utils.Urls.updateURIKeyValuePair(qs, 'manifest', manifest);
        //qs = Utils.Urls.updateURIKeyValuePair(qs, 'locale', locale);

        if (window.location.search === '?' + qs){
            window.location.reload();
        } else {
            window.location.search = qs;
        }
    }

    function clearHashParams(){
        document.location.hash = '';
    }

    function getLocale() {
        return bootstrapper.params.localeName;
    }

    function setSelectedManifest(){

        var manifest = Utils.Urls.getQuerystringParameter('manifest');

        if (manifest) {
            $('#manifestSelect').val(manifest);
        } else {
            var options = $('#manifestSelect option');

            if (options.length){
                manifest = options[0].value;
            }
        }

        $('#manifest').val(manifest);
        updateDragDrop();

        $('.uv').attr('data-uri', manifest);
    }

    function updateDragDrop(){
        $('#dragndrop').attr('href', location.origin + location.pathname + '?manifest=' + $('#manifest').val());
    }

    function setTestIds(){
        //var testids = $('#testids').is(':checked');

        var qs = Utils.Urls.getQuerystringParameter('testids');

        if (qs === 'true') {
            createTestIds();
            $('#testids').attr('checked', 'true');
        } else {
            $('#testids').removeAttr('checked');
        }
    }

    function setDefaultToFullScreen(){
        var defaultToFullScreen = $('#defaultToFullScreen').is(':checked');

        var qs = Utils.Urls.getQuerystringParameter('defaultToFullScreen');

        if (qs === 'true') {
            $('.uv').attr('data-fullscreen', true);
            $('#defaultToFullScreen').attr('checked', 'true');
        } else {
            $('.uv').removeAttr('data-fullscreen');
            $('#defaultToFullScreen').removeAttr('checked');
        }
    }

    function openEditor() {
        var configName = getConfigName();
        var configDisplayName = configName;

        var sessionConfig = sessionStorage.getItem(configName);

        if (sessionConfig){
            config = JSON.parse(sessionConfig);
            configDisplayName += '*';
            $('.config-name').text('(' + configDisplayName + ')');
            showEditor();
            editor.setValue(config);
        } else {

            var root = '';

            if (isLocalhost || isGithub){
                root = '/examples/';
            }

            $.getJSON(root + uvVersion + '/lib/' + configName + '.config.json', function(config){
                $('.config-name').text('(' + configDisplayName + ')');
                showEditor();
                editor.setValue(config);
            });
        }
    }

    function showEditor() {
        $('#editPnl').swapClass('hide', 'show');
        $('#saveBtn').swapClass('hide', 'show');
        $('#resetBtn').swapClass('show', 'hide');
        $('#editBtn').swapClass('show', 'hide');
        $('#closeBtn').swapClass('hide', 'show');
    }

    function closeEditor() {
        $('.config-name').empty();
        $('#editPnl').swapClass('show', 'hide');
        $('#saveBtn').swapClass('show', 'hide');
        $('#resetBtn').swapClass('hide', 'show');
        $('#editBtn').swapClass('hide', 'show');
        $('#closeBtn').swapClass('show', 'hide');
    }

    function uvEventHandlers() {

        $(document).bind('uv.onCreated', function (event, obj) {
            setTestIds();
        });

        $(document).bind('uv.onDrop', function (event, manifestUri) {
            clearHashParams();
        });

        $(document).bind('uv.onLoad', function (event, obj) {

            closeEditor();

            bootstrapper = obj.bootstrapper;

            loadConfigSchema(function(schema) {
                if (schema){
                    createEditor(schema);
                    if (!isIE8()) {
                        $('#configEditor').show();
                    }
                }
                $('footer').show();
            });
        });
    }

    function init() {

        // if hosted on something like an azure website without the /examples path
        if (!isLocalhost && !isGithub) {
            // remove '/examples' from paths
            $('.uv').updateAttr('data-config', '/examples/', '/');

            $('.uv').updateAttr('data-uri', '/examples/', '/');

            $('#manifestSelect option').each(function() {
                $(this).updateAttr('value', '/examples/', '/');
            });
        }

        $('#setOptionsBtn').on('click', function(e) {
            e.preventDefault();
            reload();
        });

        $('#manifestSelect').on('change', function() {
            $('#manifest').val($('#manifestSelect option:selected').val());
            updateDragDrop();
        });

        $('#manifest').click(function() {
            $(this).select();
        });

        $('#manifest').keypress(function(e) {
            if(e.which === 13) {
                reload();
            }
        });

        $('#setManifestBtn').on('click', function(e) {
            e.preventDefault();
            reload();
        });

        $('#editBtn').on('click', function(e) {
            e.preventDefault();
            openEditor();
        });

        $('#closeBtn').on('click', function(e) {
            e.preventDefault();
            closeEditor();
        });

        $('#saveBtn').on('click', function(e) {
            e.preventDefault();

            var errors = editor.validate();

            // if(errors.length) {
            //     //console.log(errors);
            //     return;
            // }

            // save contents of #json to session storage
            sessionStorage.setItem(getConfigName(), JSON.stringify(editor.getValue()));

            reload();
        });

        $('#resetBtn').on('click', function(e){
            e.preventDefault();
            sessionStorage.clear();
            reload();
        });

        uvEventHandlers();

        if ($('#manifestSelect option').length || $('#manifestSelect optgroup').length){
            setSelectedManifest();
        }

        //setDefaultToFullScreen();
        loadViewer();
    }

    var isLocalhost = document.location.href.indexOf('localhost') !== -1;
    var isGithub = document.location.href.indexOf('github') !== -1;

    loadManifests(function() {
        init();
    });
});