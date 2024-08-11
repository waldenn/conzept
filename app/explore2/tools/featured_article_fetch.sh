#!/bin/bash

#LANGS=(ab ace ady af ak als am an ang ar arc arz as ast atj av ay az azb ba bal bar bat-smg bcl be be-tarask 'bg' bgn bh bi bjn bm bn bo bpy br bs bug bxr ca cbk-zam cdo ce ceb ch chr chy ckb co cr crh cs csb cu cv cy da de din diq dsb dty dv dz ee el eml en eo es et eu ext fa ff fi fiu-vro fj fo fr frp frr fur fy ga gag gan gd gl glk gn gom gor got gu gv ha hak haw he hi hif hr hsb ht hu hy ia id ie ig ik ilo inh io is it iu ja jam jbo jv ka kaa kab kbd kbp kg khw ki kl km kn ko koi krc ks ksh ku kv kw ky la lad lb lbe lez lfn lg li lij lmo ln lo lrc lt ltg lv mai map-bms mdf mg mhr mi min mk ml mn mr mrj ms mt mwl my myv mzn na nah nap nds nds-nl ne new nia nl nn no nov nrm nso nv ny oc olo om or os pa pag m pap pcd pdc pfl pi pih pl pms pnb pnt ps pt qu 'rm' rmy rn ro roa-rup roa-tara ru rue rw sa sah sat sc scn sco sd se sg sh si simple sk sl sm sn so sq sr srn ss st stq su sv sw szl ta tcy te tet tg th ti tk tl tn to tpi tr ts tt tum tw ty tyv udm ug uk ur uz ve vec vep vi vls vo wa war wo wuu xal xh xmf yi yo za zea zh zh-classical zh-min-nan zh-yue zu gcr mnw szy dag mad zgh igl dtp kcg nqo bew dga gpe bbc kus guw ami pcm fat guc tay blk trv pwn gur btm fon tly anp shi mni alt avk skr smn lld ary awa ban hyw shn kk )
LANGS=(nia)

for lang in ${LANGS[*]}
do
  echo $lang

  cd ./tmp

  # get data
  wget -U 'Firefox 88' https://query.wikidata.org/sparql?query=SELECT%20%3Fitem%20WHERE%20%7B%0A%20%20%3Fitem%20wikibase%3Asitelinks%20%3Flinkcount.%0A%20%20%3Fsitelink%20schema%3AisPartOf%20%3Chttps%3A%2F%2F$lang.wikipedia.org%2F%3E%3B%0A%20%20%20%20schema%3AinLanguage%20%3Flang%3B%0A%20%20%20%20schema%3Aabout%20%3Fitem%3B%0A%20%20%20%20wikibase%3Abadge%20wd%3AQ17437796.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22$lang%22.%20%7D%0A%7D -O $lang

  # cleanup data
  sed -i -n '/uri/p' $lang  &&
  sed -i 's/.*Q//g' $lang &&
  sed -i 's/<\/uri>//g' $lang
  ls -1 | paste -sd "," $lang > $lang.json &&
  sed -i '1s/^/[/' $lang.json &&
  sed -i '1s/$/]/' $lang.json &&
  rm $lang

done
