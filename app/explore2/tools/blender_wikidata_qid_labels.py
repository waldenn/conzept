# modify Blender-file collection-data with Wikidata Qids
# 1) ./blender human_anatomy.blend --background --python labels.py
# 2) gltf-pipeline -i human_anatomy.glb -o human_anatomy.gltf -d
# 3) edit gltf file

import bpy
import requests
import re

def get_wikidata_qid( label ):

    base_url = "https://www.wikidata.org/w/api.php"

    params = {
        "action": "wbsearchentities",
        "format": "json",
        "language": "en",
        "search": label
    }

    try:
        response = requests.get(base_url, params=params)
        data = response.json()
        entities = data.get("search", [])

        if entities:
            # Return the QID of the first result
            return entities[0]["id"]

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

    return None

def traverse_tree(t):
    yield t
    for child in t.children:
        yield from traverse_tree(child)

def write_changes_to_file(): # Save the changes to the Blender file
    bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
    #bpy.ops.wm.save_as_mainfile(filepath="/tmp/out.blend")

#coll = bpy.context.scene.collection
#for index, c in enumerate( list( traverse_tree( coll ) ) ):

index = 0

# set the name of all meshes to Qid
for name, obj in bpy.data.objects.items():

    if obj.type == 'MESH' or obj.type == 'CURVE': # [SHIFT-A]: FONT, MESH, CURVE, ...
       continue # skip

    name  = name.strip().replace('(','').replace(')','').replace('[','').replace(']','')

    label = name.split('.')

    name  = label[0]

    try:
        postfix=label[1] 
    except IndexError:
        postfix=''

    # check if we already Qid-ed this string
    pattern = r'^Q\d'
    match = re.match( pattern, name )
    if match:
      continue # skip

    #print( name )
    print( obj.type )
   
    qid = get_wikidata_qid( name )

    if qid:
        print(f"{index}: '{name}', {qid}, {postfix}" )

        index += 1

        if len( postfix ) > 1: # with postfix
          obj.name = f"{qid}.{postfix}.{index}"
        else: # no postfix
          obj.name = f"{qid}..{index}"

    else:
      continue # skip
        #print(f"{index}: '{name}', ...")

    if index % 500 == 0:
      print( 'saving state...' )
      bpy.context.view_layer.update()
      write_changes_to_file()

    #if index == 10:
    # break

# update the Outliner to reflect the change
bpy.context.view_layer.update()

# Write changes to the Blender file
write_changes_to_file()
