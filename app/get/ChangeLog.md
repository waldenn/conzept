# Change Log

### 1.3.2 - 20108/10/24
- Changed the default minimum height of screenshots.
- Tweaked the layout.

### 1.3.1 - 2018/10/24
- Tweaked the layout.
- Fixed a bug which caused a PHP notice, undefined index with accessing `$_SERVER[ 'HTTP_USER_AGENT' ]` when it is not set. 

### 1.3.0 - 2018/10/23
- Added the `width` and `height` parameters for the `screenshot` output type.
- Added the `cache-lifespan` parameter that determines the cache duration.
- Added the ability to cache responses.

### 1.2.1 - 2018/10/23
- Changed to display HTML outputs regardless of the response status if the content exits.

### 1.2.0 - 2018/10/23
- Changed to display the HTML output for the `302` status.
- Enabled disk cache of PhantomJS.
- Added the `file-type` sub-parameter for the `screenshot` output type. 
- Added the `output-encoding` parameter.
- Added the `load-images` parameter which decides whether to load images.
- Added the ability to set a random user agent by giving `random` to the `user-agent` parameter. 
- Changed the behavior of the default `user-agent` parameter, which assigns the client user agent.

### 1.1.1 - 2018/10/22
- Added a header item `Access-Control-Allow-Origin: *` for JavaScript Ajax calls.  

### 1.1.0 - 2018/10/21
- Added the `header` query parameter to set additional HTTP header items. 
- Added the ability to set a random user agent when not given. 
- Added the `user-agent` query parameter to set a user agent.
- Added support for `POST` requests.   

### 1.0.0 - 2018/10/20
- Released.