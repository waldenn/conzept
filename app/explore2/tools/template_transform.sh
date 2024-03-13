#!/bin/sh

# transform template files (by inserting the Conzept environment variables)

# source conzept environment variables
. /etc/conzept/settings.conf &&

# loop over each Conzept app
find ../../ -maxdepth 1 -mindepth 1 -type d | while read dir; do

  # HTML templates
  if [ -f "$dir/index.template.html" ]
  then
    sed -e "s|CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|$CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|g ; s|CONZEPT_COMMON_HTML_INCLUDE|$CONZEPT_COMMON_HTML_INCLUDE|g ; s|CONZEPT_VERSION|$CONZEPT_VERSION|g ; s|CONZEPT_INDICATORS_VERSION|$CONZEPT_INDICATORS_VERSION|g ; s|CONZEPT_WEB_BASE|$CONZEPT_WEB_BASE|g ; s|CONZEPT_HOSTNAME|$CONZEPT_HOSTNAME|g ; s|CONZEPT_LOCALES|$CONZEPT_LOCALES|g ; s|CONZEPT_AI_TUTORS|$CONZEPT_AI_TUTORS|g ; s|CONZEPT_FONT|$CONZEPT_FONT|g ; s|CONZEPT_TRACKER_HTML_INCLUDE|$CONZEPT_TRACKER_HTML_INCLUDE|g" "$dir/index.template.html"  > "$dir/index.html"
  fi

  # PHP templates
  if [ -f "$dir/index.template.php" ]
  then
    sed -e "s|CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|$CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|g ; s|CONZEPT_COMMON_HTML_INCLUDE|$CONZEPT_COMMON_HTML_INCLUDE|g ; s|CONZEPT_VERSION|$CONZEPT_VERSION|g ; s|CONZEPT_INDICATORS_VERSION|$CONZEPT_INDICATORS_VERSION|g ; s|CONZEPT_WEB_BASE|$CONZEPT_WEB_BASE|g ; s|CONZEPT_HOSTNAME|$CONZEPT_HOSTNAME|g ; s|CONZEPT_LOCALES|$CONZEPT_LOCALES|g ;s|CONZEPT_AI_TUTORS|$CONZEPT_AI_TUTORS|g ; s|CONZEPT_FONT|$CONZEPT_FONT|g ; s|CONZEPT_TRACKER_HTML_INCLUDE|$CONZEPT_TRACKER_HTML_INCLUDE|g" "$dir/index.template.php"  > "$dir/index.php"
  fi

  # special case: "event" app
  if [ -f "$dir/header_index.template.php" ]
  then
    sed -e "s|CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|$CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|g ; s|CONZEPT_COMMON_HTML_INCLUDE|$CONZEPT_COMMON_HTML_INCLUDE|g ; s|CONZEPT_VERSION|$CONZEPT_VERSION|g ; s|CONZEPT_INDICATORS_VERSION|$CONZEPT_INDICATORS_VERSION|g ; s|CONZEPT_WEB_BASE|$CONZEPT_WEB_BASE|g ; s|CONZEPT_HOSTNAME|$CONZEPT_HOSTNAME|g ; s|CONZEPT_FONT|$CONZEPT_FONT|g" "$dir/header_index.template.php"  > "$dir/header_index.php"
  fi

done

# special case: "iiif-ng" app
if [ -f "../../iiif-ng/dist/uv.template.html" ]
then
sed -e "s|CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|$CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|g ; s|CONZEPT_COMMON_HTML_INCLUDE|$CONZEPT_COMMON_HTML_INCLUDE|g ; s|CONZEPT_VERSION|$CONZEPT_VERSION|g ; s|CONZEPT_INDICATORS_VERSION|$CONZEPT_INDICATORS_VERSION|g ; s|CONZEPT_WEB_BASE|$CONZEPT_WEB_BASE|g ; s|CONZEPT_HOSTNAME|$CONZEPT_HOSTNAME|g ; s|CONZEPT_LOCALES|$CONZEPT_LOCALES|g ; s|CONZEPT_AI_TUTORS|$CONZEPT_AI_TUTORS|g ; s|CONZEPT_FONT|$CONZEPT_FONT|g ; s|CONZEPT_TRACKER_HTML_INCLUDE|$CONZEPT_TRACKER_HTML_INCLUDE|g" "../../iiif-ng/dist/uv.template.html"  > "../../iiif-ng/dist/uv.html"
fi

# loop over each Conzept quiz-app (located one level deeper than normal apps)
find ../../quiz -maxdepth 1 -mindepth 1 -type d | while read dir; do

  # HTML templates
  if [ -f "$dir/index.template.html" ]
  then
    sed -e "s|CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|$CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|g ; s|CONZEPT_COMMON_HTML_INCLUDE|$CONZEPT_COMMON_HTML_INCLUDE|g ; s|CONZEPT_VERSION|$CONZEPT_VERSION|g ; s|CONZEPT_INDICATORS_VERSION|$CONZEPT_INDICATORS_VERSION|g ; s|CONZEPT_WEB_BASE|$CONZEPT_WEB_BASE|g ; s|CONZEPT_HOSTNAME|$CONZEPT_HOSTNAME|g ; s|CONZEPT_LOCALES|$CONZEPT_LOCALES|g ; s|CONZEPT_AI_TUTORS|$CONZEPT_AI_TUTORS|g ; s|CONZEPT_FONT|$CONZEPT_FONT|g ; s|CONZEPT_TRACKER_HTML_INCLUDE|$CONZEPT_TRACKER_HTML_INCLUDE|g" "$dir/index.template.html"  > "$dir/index.html"
  fi

  # PHP templates
  if [ -f "$dir/index.template.php" ]
  then
    sed -e "s|CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|$CONZEPT_COMMON_HTML_INCLUDE_NO_JQUERY|g ; s|CONZEPT_COMMON_HTML_INCLUDE|$CONZEPT_COMMON_HTML_INCLUDE|g ; s|CONZEPT_VERSION|$CONZEPT_VERSION|g ; s|CONZEPT_INDICATORS_VERSION|$CONZEPT_INDICATORS_VERSION|g ; s|CONZEPT_WEB_BASE|$CONZEPT_WEB_BASE|g ; s|CONZEPT_HOSTNAME|$CONZEPT_HOSTNAME|g ; s|CONZEPT_LOCALES|$CONZEPT_LOCALES|g ;s|CONZEPT_AI_TUTORS|$CONZEPT_AI_TUTORS|g ; s|CONZEPT_FONT|$CONZEPT_FONT|g ; s|CONZEPT_TRACKER_HTML_INCLUDE|$CONZEPT_TRACKER_HTML_INCLUDE|g" "$dir/index.template.php"  > "$dir/index.php"
  fi

done

# json-proxy service config file
if [ -f "../../../services/json-proxy/json-proxy.template.json" ]
then
  sed -e "s|CONZEPT_YOUTUBE_API_KEY|$CONZEPT_YOUTUBE_API_KEY|g" "../../../services/json-proxy/json-proxy.template.json" > "../../../services/json-proxy/json-proxy.json"
fi
