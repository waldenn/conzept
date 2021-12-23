classfilter = Vue.component('class-filter', {
    props: ['websiteText', 'fallbackText', 'classValue', 'classLabel'],
    data() {
        return {
            clsValue: '',
            searchResults: '',
            suggestedClassValues: classes
        }
    },
    template: `
    <div v-if="websiteText!=''">
        <div class="classSearchSection">
            <div class="classInput">
                <input 
                    v-model="clsValue" 
                    @input="showClasses" 
                    style="border: none;outline: none;width: 100%;font-size:1em" 
                    type="search" 
                    :placeholder='websiteText.classPlaceholder||fallbackText.classPlaceholder'>
            </div>
            <div v-if="clsValue.length>0" class="searchOptions">
                <a 
                    class="searchOption" 
                    v-for="result in searchResults" 
                    @click="submit(result.id,result.label)">
                        <b>
                            {{ result.label.replace(/^./, result.label[0].toUpperCase()) }}
                        </b> 
                        : {{ result.description }}
                </a>    
            </div>
        </div>
        <div class="browseOptions" v-if="suggestedClassValues.length !=0 && suggestedClassValues[0].valueLabel != ''">
            <p style="margin-top:20px">{{ websiteText.browse||fallbackText.browse }}</p>
            <ul>
                <li v-for="item in suggestedClassValues">
                    <a 
                        v-if="item.valueLabel != undefined"
                        :href="pathFor(item)" 
                        @click.exact="submit(item.value,item.valueLabel.replace(/^./, item.valueLabel[0].toUpperCase()))" 
                        @click.ctrl="window.open(pathFor(item),'_blank')"
                        onclick="return false;">
                        {{ item.valueLabel.replace(/^./, item.valueLabel[0].toUpperCase()) }}
                    </a>
                </li>
            </ul>
        </div>
    </div>`,
    methods: {
        changePage(page) {
            this.$emit('change-page', page)
        },
        pathFor(item) {
            var curPath = window.location.pathname + window.location.search;
            curPath += (curPath.includes('?')) ? '&' : '?';
            return curPath + 'c=' + item.value;
        },
        submit(cv, cl) {
            this.$emit("change-class", cv, cl);
        },
        showClasses() {
            if (this.clsValue.length > 0) {
                const fullUrl = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&origin=*&format=json&language=' + lang.split(",")[0] + '&uselang=' + lang.split(",")[0] + '&type=item&search=' + this.clsValue;
                axios.get(fullUrl)
                    .then(response => {
                        this.searchResults = [...response.data['search']]
                    })
            }
        }
    },
    mounted() {
        if (this.suggestedClassValues.length > 0) {
            var suggestedClasses = "";
            for (let i = 0; i < this.suggestedClassValues.length; i++) {
                suggestedClasses += " wd:" + this.suggestedClassValues[i].value
            }
            var sparqlQuery = "SELECT ?value ?valueLabel WHERE {\n" +
                "  VALUES ?value { " + suggestedClasses + " }\n" +
                "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                "}";
            const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
            axios.get(fullUrl)
                .then(response => {
                    for (let i = 0; i < response.data['results']['bindings'].length; i++) {
                        index = this.suggestedClassValues.findIndex(filter => filter.value == response.data['results']['bindings'][i].value.value.split("/").slice(-1)[0]);
                        if (index != -1) {
                            this.suggestedClassValues[index].valueLabel = response.data['results']['bindings'][i].valueLabel.value
                        }
                    }
                    this.suggestedClassValues.sort((a, b) => a.valueLabel.localeCompare(b.valueLabel));
                })
        }
    }
})
