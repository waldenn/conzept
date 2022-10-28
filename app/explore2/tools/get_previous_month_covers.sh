#!/bin/sh

# conzept previous-month popular-cover fetch

# source conzept environment variables
. /etc/conzept/settings.conf &&

year=$(date +'%Y') # FIXME: fails for first month of the new year
#year="2021"
month=$(date +'%m' -d 'last month')
dir="$CONZEPT_WEB_DIR/app/explore2/assets/json/covers"

echo "fetching the previous month Wikipedia cover data"

if [ -d dir ]
then
  echo "error: missing directory \"$dir\""
  exit 1
fi

for lang in ab ace ady af ak als am an ang ar arc arz as ast atj av ay az azb ba bal bar bat-smg bcl be be-tarask 'bg' bgn bh bi bjn bm bn bo bpy br bs bug bxr ca cbk-zam cdo ce ceb ch chr chy ckb co cr crh cs csb cu cv cy da de din diq dsb dty dv dz ee el eml en eo es et eu ext fa ff 'fi' fiu-vro fj fo fr frp frr fur fy ga gag gan gd gl glk gn gom gor got gu gv ha hak haw he hi hif hr hsb ht hu hy ia id ie ig ik ilo inh io is it iu ja jam jbo jv ka kaa kab kbd kbp kg khw ki kl km kn ko koi krc ks ksh ku kv kw ky la lad lb lbe lez lfn lg li lij lmo ln lo lrc lt ltg lv mai map-bms mdf mg mhr mi min mk ml mn mr mrj ms mt mwl my myv mzn na nah nap nds nds-nl ne new nia nl nn no nov nrm nso nv ny oc olo om or os pa pag m pap pcd pdc pfl pi pih pl pms pnb pnt ps pt qu 'rm' rmy rn ro roa-rup roa-tara ru rue rw sa sah sat sc scn sco sd se sg sh si simple sk sl sm sn so sq sr srn ss st stq su sv sw szl ta tcy te tet tg th ti tk tl tn to tpi tr ts tt tum tw ty tyv udm ug uk ur uz ve vec vep vi vls vo wa war wo wuu xal xh xmf yi yo za zea zh zh-classical zh-min-nan zh-yue zu gcr mnw szy
do
  echo $i $year $month

  # month tops (run once a month, this is done automatically by a cronjob)
  wget -U 'Firefox 69' "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/$lang.wikipedia/all-access/$year/$month/all-days" -O "$dir/$lang-$year-$month.json"

  # year tops (run once a year)
  #year=2021
  #wget -U 'Firefox 69' "https://pageviews.toolforge.org/topviews/yearly_datasets/$lang.wikipedia/2019.json" -O "$dir/$lang-$year.json"

done

cd $dir && chown www-data:www-data *.json
