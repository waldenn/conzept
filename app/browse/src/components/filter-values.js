filtervalues = Vue.component('filter-values', {
    props: ['websiteText', 'fallbackText', 'classValue', 'classLabel', 'currentFilter', 'totalValues', 'appliedFilters', 'appliedRanges', 'appliedQuantities', 'format'],
    data() {
        return {
            items: [],
            itemsType: '',
            fullPropertyValues: [],
            displayCount: 1,
            currentPage: 1,
            filterProperty: '',
            query: '#',
            noValueURL: '',
            secondaryFilters:[],
            secondaryFiltersCount: -1,
            secondaryFiltersDropdownDisplay: false
        }
    },
    template: `
    <div v-if="websiteText!=''">
        <header-view
            :class-label="classLabel"
            :applied-filters="appliedFilters"
            :applied-ranges="appliedRanges"
            :applied-quantities="appliedQuantities"
            @remove-filter="removeFilter"
            @remove-range="removeRange"
            @remove-quantity="removeQuantity"
            @change-page="changePage"
        >
        </header-view>
        <div class="content">
            <div v-if="secondaryFiltersCount>0" class="filter-box">
                <div class="info">
                    <div style="cursor:pointer"  @click="toggleDropdown">
                        <img v-bind:style="{ transform:'rotate('+ secondaryFiltersDropdownDisplay*180 + 'deg)' }" src="images/down-arrow.svg" height="14px">
                        <span v-html="displayMessage(websiteText.applyLinkedFilter||fallbackText.applyLinkedFilter, currentFilter.valueLabel)"></span>
                    </div>
                    <p v-if="secondaryFiltersDropdownDisplay">{{ websiteText.chooseLinkedFilter||fallbackText.chooseLinkedFilter }}</p>
                </div>
                <ul class="secondary-filter" v-bind:style="{ display: (secondaryFiltersDropdownDisplay?'block':'none') }">
                    <li v-for="(cls,clsLabel) in secondaryFilters">
                        <b>
                            <a 
                                :href="linkToClass(cls)"
                                @click.exact="updateClass(cls)"
                                onclick="return false;"> 
                                {{clsLabel}}:
                            </a>
                        </b>
                        <span v-for="filter in cls">
                            <a 
                                @click.exact="showSecondaryFilter(filter)"
                                onclick="return false;"> 
                                {{filter.valueLabel.value}}
                            </a>
                            <b v-if="cls[cls.length-1].valueLabel.value != filter.valueLabel.value"> </b>
                        </span>
                    </li>
                </ul>
            </div>
            <div v-if="itemsType==''">
                <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                <p v-html="displayMessage(websiteText.gettingValues||fallbackText.gettingValues, currentFilter.valueLabel)"></p>
                <img src='images/loading.gif'>
            </div>
            <div v-else-if="itemsType=='Additionalempty'">
                <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                <p v-html="displayMessage(websiteText.noAdditionalValues||fallbackText.noAdditionalValues, currentFilter.valueLabel)"></p>
            </div>
            <div v-else-if="itemsType=='Error'">
                <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                <p v-html="displayMessage(websiteText.filterError||fallbackText.filterError, currentFilter.valueLabel)"></p>
            </div>
            <div v-else>
                <div v-if="itemsType=='Item'">
                    <p v-if="totalValues!=''" v-html="displayPluralCount(websiteText.itemCount||fallbackText.itemCount,totalValues)"></p>
                    <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                    <p v-if="appliedFilters.findIndex(filter => filter.filterValue == currentFilter.value) != -1" v-html="displayMessage(websiteText.selectAdditionalValue||fallbackText.selectAdditionalValue, currentFilter.valueLabel)"></p>
                    <p v-else v-html="displayMessage(websiteText.selectValue||fallbackText.selectValue, currentFilter.valueLabel)"></p>
                    <div v-if="items.length>resultsPerPage && itemsType=='Item'" style="text-align: center">
                        <a v-if="currentPage>1" @click="currentPage>1?currentPage--:''">&lt;</a>
                        <input 
                            v-model.lazy="currentPage" 
                            type="text" 
                            style="margin-bottom: 15px;width: 48px;text-align: center"> 
                        {{items.length<1000000?" / " + Math.ceil(items.length/resultsPerPage):''}}
                        <a v-if="currentPage<items.length/resultsPerPage" @click="currentPage<items.length/resultsPerPage?currentPage++:''">&gt;</a>
                    </div>
                    <ul>
                        <li v-if="appliedFilters.findIndex(filter => filter.filterValue == currentFilter.value) ==-1">
                            <i>
                                <a 
                                    :href="noValueURL" 
                                    onclick="return false;" 
                                    @click.exact="applyFilter('novalue')" 
                                    @click.ctrl="window.open(noValueURL, '_blank')">
                                    {{ websiteText.noValue||fallbackText.noValue }}
                                </a>
                            </i>
                        </li>
                        <li v-for="(item,index) in items" v-if="index < currentPage*resultsPerPage && index >= (currentPage-1)*resultsPerPage">
                            <a 
                                :href="item.href" 
                                onclick="return false;" 
                                @click.exact="applyFilter(item)" 
                                @click.ctrl="window.open(item.href, '_blank')">
                                {{item.valueLabel.value}}
                            </a> 
                            <span class="result-count">
                                {{ displayPluralCount(websiteText.results||fallbackText.results,item.count.value) }}
                            <span>
                        </li>
                    </ul>
                </div>
                <div v-else-if="itemsType=='ItemFail'">
                    <p><i v-html="displayMessage(websiteText.filterTimeout||fallbackText.filterTimeout, currentFilter.valueLabel)"></i></p>
                    <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                    <p v-html="displayMessage(websiteText.selectValue||fallbackText.selectValue, currentFilter.valueLabel)"></p>
                    <ul>
                        <li>
                            <i>
                                <a 
                                :href="noValueURL" 
                                onclick="return false;" 
                                @click.exact="applyFilter('novalue')" 
                                @click.ctrl="window.open(noValueURL, '_blank')">
                                {{ websiteText.noValue||fallbackText.noValue }}
                            </i>
                        </li>
                        <li v-for="item in items">
                            <a 
                                :href="item.href" 
                                onclick="return false;" 
                                @click.exact="applyFilter(item)" 
                                @click.ctrl="window.open(item.href, '_blank')">
                                {{item.valueLabel.value}}
                            </a>
                        </li>
                    </ul>
                </div>
                <div v-else-if="itemsType=='Time'">
                    <p v-if="totalValues!=''" v-html="displayPluralCount(websiteText.itemCount||fallbackText.itemCount,totalValues)"></p>
                    <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                    <p v-html="displayMessage(websiteText.selectValue||fallbackText.selectValue, currentFilter.valueLabel)"></p>
                    <ul v-if="displayCount == 1">
                        <li v-if="appliedRanges.findIndex(filter => filter.filterValue == currentFilter.value) ==-1">
                            <i>
                                <a 
                                    :href="noValueURL" 
                                    onclick="return false;" 
                                    @click.exact="applyRange('novalue')" 
                                    @click.ctrl="window.open(noValueURL, '_blank')">
                                    {{ websiteText.noValue||fallbackText.noValue }}
                                </a>
                            </i>
                        </li>
                        <li v-for="item in items" v-if="item.numValues>0">
                            <a 
                                :href="item.href" 
                                onclick="return false;" 
                                @click.exact="applyRange(item)" 
                                @click.ctrl="window.open(item.href, '_blank')">
                                {{item.bucketName}} 
                            </a> 
                            <span class="result-count">
                                {{ displayPluralCount(websiteText.results||fallbackText.results,item.numValues) }}
                            <span>
                        </li>
                    </ul>
                    <ul v-if="displayCount == 0">
                        <li>
                            <i>
                                <a 
                                    :href="noValueURL" 
                                    onclick="return false;" 
                                    @click.exact="applyFilter('novalue')" 
                                    @click.ctrl="window.open(noValueURL, '_blank')">
                                    {{ websiteText.noValue||fallbackText.noValue }}
                                </a>
                            </i>
                        </li>
                        <li v-for="item in items">
                            <a 
                                :href="item.href" 
                                onclick="return false;" 
                                @click.exact="applyRange(item)" 
                                @click.ctrl="window.open(item.href, '_blank')">
                                {{item.bucketName}} 
                            </a>
                        </li>
                    </ul>
                </div>
                <div v-else-if="itemsType=='TimeFail'">
                    <p><i v-html="displayMessage(websiteText.filterTimeout||fallbackText.filterTimeout, currentFilter.valueLabel)"></i></p>
                    <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                    <p v-html="displayMessage(websiteText.selectValue||fallbackText.selectValue, currentFilter.valueLabel)"></p>
                    <ul>
                        <li>
                            <i>
                                <a 
                                    :href="noValueURL" 
                                    onclick="return false;" 
                                    @click.exact="applyFilter('novalue')" 
                                    @click.ctrl="window.open(noValueURL, '_blank')">
                                    {{ websiteText.noValue||fallbackText.noValue }}
                                </a>
                                </i>
                            </li>
                        <li v-for="item in items">
                            <a 
                                :href="item.href" 
                                onclick="return false;" 
                                @click.exact="applyRange(item)" 
                                @click.ctrl="window.open(item.href, '_blank')">
                                {{item.bucketName}} 
                            </a>
                        </li>
                    </ul>
                </div>
                <div v-else-if="itemsType=='Quantity'">
                    <p v-if="displayCount == 1 && totalValues!=''" v-html="displayPluralCount(websiteText.itemCount||fallbackText.itemCount,totalValues)"></p>
                    <p v-if="displayCount == 0"><i v-html="displayMessage(websiteText.filterTimeout||fallbackText.filterTimeout, currentFilter.valueLabel)"></i></p>
                    <a @click="changePage('view-all-items')">{{ websiteText.viewList||fallbackText.viewList }}</a>
                    <p v-html="displayMessage(websiteText.selectValue||fallbackText.selectValue, currentFilter.valueLabel)"></p>
                    <ul v-if="displayCount == 1">
                        <li v-if="appliedQuantities.findIndex(filter => filter.filterValue == currentFilter.value) ==-1">
                            <i>
                                <a 
                                    :href="noValueURL" 
                                    onclick="return false;" 
                                    @click.exact="applyQuantityRange('novalue')" 
                                    @click.ctrl="window.open(noValueURL, '_blank')">
                                    {{ websiteText.noValue||fallbackText.noValue }}
                                </a>
                            </i>
                        </li>
                        <li v-for="item in items" v-if="item.numValues>0">
                            <a 
                                :href="item.href" 
                                onclick="return false;" 
                                @click.exact="applyQuantityRange(item)" 
                                @click.ctrl="window.open(item.href, '_blank')">
                                {{item.bucketName}} {{item.unit}} 
                            </a> 
                            <span class="result-count">
                                {{ displayPluralCount(websiteText.results||fallbackText.results,item.numValues) }}
                            <span>
                        </li>
                    </ul>
                    <ul v-if="displayCount == 0">
                        <li>
                            <i>
                                <a 
                                    :href="noValueURL" 
                                    onclick="return false;" 
                                    @click.exact="applyQuantityRange('novalue')" 
                                    @click.ctrl="window.open(noValueURL, '_blank'>
                                    {{ websiteText.noValue||fallbackText.noValue }}
                                </a>
                            </i>
                        </li>
                        <li v-for="item in items">
                            <a 
                                :href="item.href" 
                                onclick="return false;" 
                                @click.exact="applyQuantityRange(item)" 
                                @click.ctrl="window.open(item.href, '_blank')">
                                {{item.bucketName}} 
                            </a>
                        </li>
                    </ul>
                </div>
                <div v-if="items.length>resultsPerPage && itemsType=='Item'" style="text-align: center">
                    <a v-if="currentPage>1" @click="currentPage>1?currentPage--:''">&lt;</a>
                    <input 
                        v-model.lazy="currentPage" 
                        type="text" 
                        style="margin-bottom: 15px;width: 48px;text-align: center"> 
                    {{items.length<1000000?" / " + Math.ceil(items.length/resultsPerPage):''}}
                    <a v-if="currentPage<items.length/resultsPerPage" @click="currentPage<items.length/resultsPerPage?currentPage++:''">&gt;</a>
                </div>
                <!--div><a @click="exportCSV">Export as CSV</a></div-->
            </div>
            <!--div><a :href="query">{{ websiteText.viewQuery||fallbackText.viewQuery }}</a></div-->
        </div>
    </div>`,
    methods: {
        toggleDropdown() {
            this.secondaryFiltersDropdownDisplay = (this.secondaryFiltersDropdownDisplay == false) ? true : false;
        },
        changePage(page) {
            this.$emit('change-page', page)
        },
        showSecondaryFilter(filter) {
            this.$emit('update-secondary', filter)
        },
        linkToClass(cls){
            return window.location.pathname + "?c=" + cls[0].class.value.split('/').slice(-1)[0]
        },
        updateClass(cls) {
            this.$emit('update-class', cls[0].class.value.split('/').slice(-1)[0], cls[0].class.value.split('/').slice(-1)[0])
        },
        displayMessage(message, value) {
            if(message){
                return message.replace("$1", "<b>" + value + "</b>")
            }
        },
        displayPluralCount(message,totalValues){
            if(message){
                matches = message.match('{{PLURAL:[\\s]*\\$1\\|(.*)}}')
                str = matches[1].split('|')[(totalValues > 1 ? 1 : 0)]
                str = str.replace("$1", (totalValues < 1000000 ? numberWithCommas(totalValues) : '1 million +'))
                return message.replace(/{{PLURAL:[\s]*\$1\|(.*)}}/g,str)
            }
        },
        applyFilter(filter) {
            this.$emit('apply-filter', filter)
        },
        applyRange(range) {
            this.$emit('apply-range', range)
        },
        applyQuantityRange(range) {
            this.$emit('apply-quantity', range)
        },
        removeFilter(value) {
            this.$emit("remove-filter", value, 'filter-values');
        },
        removeRange(range) {
            this.$emit("remove-range", range, 'filter-values');
        },
        removeQuantity(quantity) {
            this.$emit("remove-quantity", quantity, 'filter-values');
        },
        exportCSV() {
            document.getElementsByTagName("body")[0].style.cursor = "progress";
            let csvHeader = encodeURI("data:text/csv;charset=utf-8,");
            if (this.itemsType == 'Item' || this.itemsType == 'ItemFail'){
                var csvContent = this.items.map(e => e.value.value.split('/').slice(-1)[0] + "," + `\"${e.valueLabel.value}\"` + (this.displayCount == 1 ? "," + e.count.value : '')).join("\n");
            }
            else if (this.itemsType == 'Time' || this.itemsType == 'TimeFail') {
                var csvContent = this.items.map(e => `\"${e.bucketName}\" ` + (this.displayCount == 1 ? "," + e.numValues : '')).join("\n");
            }
            else if (this.itemsType == 'Quantity') {
                var csvContent = this.items.map(e => `\"${e.bucketName}\" ` + e.unit + (this.displayCount == 1 ? "," + e.numValues : '')).join("\n");
            }
            let downloadURI = csvHeader + encodeURIComponent(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", downloadURI);
            link.setAttribute("download", "data.csv");
            document.body.appendChild(link);
            link.click();
            document.getElementsByTagName("body")[0].style.cursor = "default";
        }
    },
    mounted() {
        /* 
         Get linked filters related to current filter using value type constraint.
         Exclude all filters with property types other than Time, Quantity and Item.
         Exclude all properties with distinct values constraint.
         P2302: Property Constraint
         P2308: Class qualifier
        */
        var sparqlQuery = "SELECT DISTINCT ?value ?valueLabel ?class ?classLabel ?property WHERE {\n" +
            "wd:" + this.currentFilter.value + " p:P2302 ?constraint_statement.\n" +
            "?constraint_statement pq:P2308 ?class.\n" +
            "?constraint_statement ps:P2302 wd:Q21510865.\n" +
            "?class wdt:" + propertiesForThisType + " ?value.\n" +
            "?value wikibase:propertyType ?property.\n" +
            "FILTER(NOT EXISTS {\n" +
            "?value p:P2302 ?constraint.\n" +
            "?constraint ps:P2302 wd:Q21502410.\n" +
            "})\n" +
            "FILTER (?property in (wikibase:Time, wikibase:Quantity, wikibase:WikibaseItem))\n" +
            "SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
            "}"+
            "ORDER BY ?classLabel ?valueLabel";
        const url = sparqlEndpoint + encodeURIComponent(sparqlQuery);
        axios.get(url)
            .then(response =>{
                var filtersByClass = {};
                if(response.data['results']['bindings']){
                    var arr = response.data['results']['bindings'];
                    for (let i = 0; i < arr.length; i++) {
                        if(filtersByClass.hasOwnProperty(arr[i].classLabel.value)){
                            filtersByClass[arr[i].classLabel.value].push(arr[i])
                        }
                        else{
                            filtersByClass[arr[i].classLabel.value] = [arr[i]]
                        }
                    }
                    this.secondaryFilters = filtersByClass
                    this.secondaryFiltersCount = Object.keys(this.secondaryFilters).length
                }
                else{
                    this.secondaryFilters.push({ value: "Empty", valueLabel: "No data" })
                }
            })

        // Convert the applied filters/time ranges/quantities into SPARQL equivalents
        var filterString = "";
        var noValueString = "";
        for (let i = 0; i < this.appliedFilters.length; i++) {
            if (this.appliedFilters[i].parentFilterValue) {
                filterString += "{#filter " + i +"\n?item wdt:" + this.appliedFilters[i].parentFilterValue + " ?temp" + i + ".\n" +
                    "?temp" + i + " wdt:" + this.appliedFilters[i].filterValue + " wd:" + this.appliedFilters[i].value + ".\n}";
            }
            else if (this.appliedFilters[i].value == "novalue") {
                noValueString += "{#filter " + i +"\nFILTER(NOT EXISTS { ?value wdt:" + this.appliedFilters[i].filterValue + " ?no. }).\n}"
            }
            else {
                filterString += "{#filter " + i +"\n?item wdt:" + this.appliedFilters[i].filterValue + " wd:" + this.appliedFilters[i].value + ".\n}";
            }
        }
        var filterRanges = ""
        timeString = "?item wdt:" + this.currentFilter.value + " ?time.\n";
        for (let i = 0; i < this.appliedRanges.length; i++) {
            if (this.appliedRanges[i].valueLL == "novalue") {
                noValueString += "{#date range " + i +"\n FILTER(NOT EXISTS { ?item wdt:" + this.appliedRanges[i].filterValue + " ?no. }).\n}"
            }
            else if(this.appliedRanges[i].parentFilterValue){
                timePrecision = getTimePrecision(this.appliedRanges[i].valueLL, this.appliedRanges[i].valueUL, 1)
                filterRanges += "{#date range " + i + "\n?item wdt:" + this.appliedRanges[i].parentFilterValue+ " ?temp" + i + ".\n"+
                    "?temp" + i + " (p:" + this.appliedRanges[i].filterValue + "/psv:" + this.appliedRanges[i].filterValue + ") ?timenode" + i + ".\n" +
                    "?timenode" + i + " wikibase:timeValue ?time" + i + ".\n" +
                    "?timenode" + i + " wikibase:timePrecision ?timeprecision" + i + ".\n" +
                    "FILTER('" + this.appliedRanges[i].valueLL + "'^^xsd:dateTime <= ?time" + i + " && ?time" + i + " <= '" + this.appliedRanges[i].valueUL + "'^^xsd:dateTime).\n" +
                    "FILTER(?timeprecision" + i + ">=" + timePrecision + ")\n}";
            }
            else if (this.appliedRanges[i].filterValue != this.currentFilter.value) {
                timePrecision = getTimePrecision(this.appliedRanges[i].valueLL, this.appliedRanges[i].valueUL,1)
                filterRanges += "{#date range " + i +"\n?item (p:" + this.appliedRanges[i].filterValue + "/psv:" + this.appliedRanges[i].filterValue + ") ?timenode" + i + ".\n" +
                    "?timenode" + i + " wikibase:timeValue ?time" + i + ".\n" +
                    "?timenode" + i + " wikibase:timePrecision ?timeprecision" + i + ".\n" +
                    "FILTER('" + this.appliedRanges[i].valueLL + "'^^xsd:dateTime <= ?time" + i + " && ?time" + i + " <= '" + this.appliedRanges[i].valueUL + "'^^xsd:dateTime).\n" +
                    "FILTER(?timeprecision" + i + ">=" + timePrecision + ")\n}";
            }
            else {
                // Overwrite the previous value apllied.
                timePrecision = getTimePrecision(this.appliedRanges[i].valueLL, this.appliedRanges[i].valueUL,1)
                timeString = "{#date range " + i +"\n?item (p:" + this.appliedRanges[i].filterValue + "/psv:" + this.appliedRanges[i].filterValue + ") ?timenode.\n" +
                    "?timenode wikibase:timeValue ?time.\n" +
                    "?timenode wikibase:timePrecision ?timeprecision.\n" +
                    "FILTER('" + this.appliedRanges[i].valueLL + "'^^xsd:dateTime <= ?time && ?time <= '" + this.appliedRanges[i].valueUL + "'^^xsd:dateTime).\n" +
                    "FILTER(?timeprecision>=" + timePrecision + ")\n}";
            }
        }
        var filterQuantities = "";
        for (let i = 0; i < this.appliedQuantities.length; i++) {
            if(this.appliedQuantities[i].parentFilterValue){
                if (this.appliedQuantities[i].valueLL == "novalue") {
                    noValueString += "{#quantity range " + i +"\n FILTER(NOT EXISTS { ?item wdt:" + this.appliedQuantities[i].filterValue + " ?no. }).\n}"
                }
                else if (this.appliedQuantities[i].unit == "") {
                    filterQuantities += "{#quantity range " + i +"\n?item wdt:" + this.appliedQuantities[i].parentFilterValue + " ?temp" + i + ".\n" +
                    "?temp" + i + " (p:" + this.appliedQuantities[i].filterValue + "/psv:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                    "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                    "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >" + this.appliedQuantities[i].valueLL + ")\n}"
                }
                else {
                    filterQuantities += "{#quantity range " + i +"\n?item wdt:" + this.appliedQuantities[i].parentFilterValue + " ?temp" + i + ".\n" +
                    "?temp" + i + " (p:" + this.appliedQuantities[i].filterValue + "/psn:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                    "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                    "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >" + this.appliedQuantities[i].valueLL + ")\n}"
                    
                }
            }
            else{
                if (this.appliedQuantities[i].valueLL == "novalue") {
                    noValueString += "{#quantity range " + i +"\n FILTER(NOT EXISTS { ?item wdt:" + this.appliedQuantities[i].filterValue + " ?no. }).\n}"
                }
                else if (this.appliedQuantities[i].unit == "") {
                    filterQuantities += "{#quantity range " + i +"\n?item (p:" + this.appliedQuantities[i].filterValue + "/psv:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                        "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                        "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >" + this.appliedQuantities[i].valueLL + ")\n}"
                }
                else {
                    filterQuantities += "{#quantity range " + i +"\n?item (p:" + this.appliedQuantities[i].filterValue + "/psn:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                        "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                        "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >" + this.appliedQuantities[i].valueLL + ")\n}"
                }
            }
        }
        // Get the property type for current filter
        sparqlQuery = "SELECT ?property WHERE {\n" +
            "  wd:" + this.currentFilter.value + " wikibase:propertyType ?property.\n" +
            "}";
        var fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
        var vm = this;
        axios.get(fullUrl)
            .then((response) => {
                if (response.data['results']['bindings'][0].property.value.split("#")[1] == "Time") {
                    // Time property type
                    // Set the URL parameters for href attribute, i.e., only for display purpose. 
                    var q = window.location.search;
                    parameters = new URLSearchParams(q)
                    parameters.delete("cf")
                    parameters.delete("sf")
                    parameters.set("r." + vm.currentFilter.value, "novalue")
                    vm.noValueURL = window.location.pathname + "?" + parameters
                    
                    var sparqlQuery = "SELECT ?time WHERE {\n" +
                        "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                        filterString +
                        filterRanges +
                        timeString +
                        filterQuantities +
                        noValueString +
                        "}\n" +
                        "ORDER by ?time";
                    vm.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                    fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            if (response.data['results']['bindings'].length) {
                                arr = generateDateBuckets(response.data['results']['bindings'])
                                // Set the href parameter of each bucket.
                                for (var i = 0; i < arr.length; i++) {
                                    var q = window.location.search;
                                    parameters = new URLSearchParams(q)
                                    parameters.delete("cf")
                                    parameters.delete("sf")
                                    if (arr[i].size == 1) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "~" + arr[i].bucketUL.year)
                                    else if (arr[i].size == 2) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year)
                                    else if (arr[i].size == 3) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "-" + arr[i].bucketLL.month)
                                    else if (arr[i].size == 4) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "-" + arr[i].bucketLL.month + "-" + arr[i].bucketLL.day)
                                    else if (arr[i].size == 5) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "-" + arr[i].bucketLL.month + "-" + arr[i].bucketLL.day)
                                    arr[i]['href'] = window.location.pathname + "?" + parameters
                                }
                                if (arr.length) {
                                    vm.items = arr;
                                    vm.itemsType = 'Time'
                                    vm.displayCount = 1
                                }
                                else {
                                    vm.itemsType = 'Additionalempty'
                                }
                            }
                            else {
                                // Check if "No value" is to be displayed or not.
                                index = vm.appliedRanges.findIndex(filter => filter.filterValue == vm.currentFilter.value)
                                if (index == -1) vm.itemsType = "Additionalempty"
                                else vm.itemsType = 'Time'
                            }
                        })
                        .catch(_error => {
                            /* 
                             Gets fallback results in case the primary query fails or times out.
                             Finds random time values and creates buckets.
                            */
                            sparqlQuery = "SELECT ?time WHERE{SELECT ?time WHERE {\n" +
                                "hint:Query hint:optimizer \"None\".\n" +
                                "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                filterString +
                                "?item wdt:" + vm.currentFilter.value + " ?time.\n" +
                                filterRanges +
                                filterQuantities +
                                "}\n" +
                                "LIMIT " + resultsPerPage + "\n" +
                                "}\n" +
                                "ORDER BY ?time";
                            fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                            axios.get(fullUrl)
                                .then(res => {
                                    if (res.data['results']['bindings'].length) {
                                        arr = generateDateBuckets(res.data['results']['bindings'], vm.currentFilter)
                                        // Set the href parameter of each bucket.
                                        for (var i = 0; i < arr.length; i++) {
                                            var q = window.location.search;
                                            parameters = new URLSearchParams(q)
                                            parameters.delete("cf")
                                            parameters.delete("sf")
                                            if (arr[i].size == 1) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "~" + arr[i].bucketUL.year)
                                            else if (arr[i].size == 2) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year)
                                            else if (arr[i].size == 3) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "-" + arr[i].bucketLL.month)
                                            else if (arr[i].size == 4) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "-" + arr[i].bucketLL.month + "-" + arr[i].bucketLL.day)
                                            else if (arr[i].size == 5) parameters.set("r." + vm.currentFilter.value, arr[i].bucketLL.year + "-" + arr[i].bucketLL.month + "-" + arr[i].bucketLL.day)
                                            arr[i]['href'] = window.location.pathname + "?" + parameters
                                        }
                                        vm.items = arr
                                        vm.itemsType = 'Time'
                                        vm.displayCount = 0
                                    }
                                    else {
                                        vm.itemsType = 'TimeFail'
                                    }
                                })
                                .catch(_error => {
                                    vm.itemsType = 'Error'
                                })
                        })
                }
                else if (response.data['results']['bindings'][0].property.value.split("#")[1] == "Quantity") {
                    // Quantity property type
                    // Set the URL parameters for href attribute, i.e., only for display purpose. 
                    var q = window.location.search;
                    parameters = new URLSearchParams(q)
                    parameters.delete("cf")
                    parameters.delete("sf")
                    parameters.set("q." + vm.currentFilter.value, "novalue")
                    vm.noValueURL = window.location.pathname + "?" + parameters
                    /* 
                     Gets items and their normalized amount/quantity.
                     Query for quantities with units. 
                    */
                    var sparqlQuery = "SELECT ?item ?amount WHERE {\n" +
                        "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                        filterString +
                        "?item (p:" + vm.currentFilter.value + "/psn:" + vm.currentFilter.value + ") ?v.\n" +
                        "?v wikibase:quantityAmount ?amount.\n" +
                        filterRanges +
                        filterQuantities +
                        noValueString +
                        "}\n" +
                        "ORDER BY ?amount";
                    vm.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                    var fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => (response.data['results']['bindings'].length ? response : ''))
                        .then((response) => {
                                if (response == "") {
                                    // If the above query returns null then try for un-normalized values.
                                    sparqlQuery = "SELECT ?amount WHERE {\n" +
                                        "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                        filterString +
                                        "?item (p:" + vm.currentFilter.value + "/psv:" + vm.currentFilter.value + ") ?v.\n" +
                                        "?v wikibase:quantityAmount ?amount.\n" +
                                        filterRanges +
                                        filterQuantities +
                                        noValueString +
                                        "}\n" +
                                        "ORDER BY ?amount";
                                    vm.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                                    fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                                    axios.get(fullUrl)
                                        .then(res => {
                                            if (res.data['results']['bindings'].length) {
                                                arr = generateFilterValuesFromNumbers(res.data['results']['bindings']);
                                                // Set the href parameter of each bucket.
                                                for (var i = 0; i < arr.length; i++) {
                                                    var q = window.location.search;
                                                    parameters = new URLSearchParams(q);
                                                    parameters.delete("cf");
                                                    parameters.delete("sf");
                                                    parameters.set("q." + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""));
                                                    arr[i]['href'] = window.location.pathname + "?" + parameters;
                                                }
                                                vm.items = arr;
                                                vm.itemsType = 'Quantity';
                                                vm.displayCount = 1;
                                            }
                                            else {
                                                // Check if "No value" is to be displayed or not.
                                                index = vm.appliedQuantities.findIndex(filter => filter.filterValue == vm.currentFilter.value);
                                                if (index != -1) vm.itemsType = "Additionalempty";
                                                else vm.itemsType = 'Quantity';
                                            }
                                        })
                                        .catch(_error => {
                                            /*
                                             Gets fallback results in case the primary query fails or times out.
                                             Finds random quantity amounts and creates buckets.
                                            */
                                            sparqlQuery = "SELECT ?amount WHERE\n" +
                                                "{\n" +
                                                "SELECT ?amount WHERE {\n" +
                                                "hint:Query hint:optimizer \"None\".\n" +
                                                "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                                "?item (p:" + vm.currentFilter.value + "/psv:" + vm.currentFilter.value + ") ?v.\n" +
                                                "?v wikibase:quantityAmount ?amount.\n" +
                                                "}\n" +
                                                "LIMIT " + resultsPerPage + "\n" +
                                                "}\n" +
                                                "ORDER BY ?amount";
                                            fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                                            axios.get(fullUrl)
                                                .then(r => {
                                                    if (r.data['results']['bindings'].length) {
                                                        arr = generateFilterValuesFromNumbers(r.data['results']['bindings']);
                                                        // Set the href parameter of each bucket.
                                                        for (var i = 0; i < arr.length; i++) {
                                                            var q = window.location.search;
                                                            parameters = new URLSearchParams(q);
                                                            parameters.delete("cf");
                                                            parameters.delete("sf");
                                                            parameters.set("q." + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""));
                                                            arr[i]['href'] = window.location.pathname + "?" + parameters;
                                                        }
                                                        vm.items = arr;
                                                        vm.displayCount = 0;
                                                    }
                                                    vm.itemsType = 'Quantity';
                                                })
                                                .catch(_error => {
                                                    vm.itemsType = 'Error';
                                                });
                                        });
                                }
                                else {
                                    // Above query succeeds, i.e., quantities have units.
                                    firstItem = response.data['results']['bindings'][0].item.value.split("/").slice(-1)[0];
                                    /*
                                     Gets units for the results.
                                     Since the unit of all quantities will be same
                                     just find the unit of first item.
                                    */
                                    var unitQuery = "SELECT ?unitLabel WHERE {\n" +
                                        "    wd:" + firstItem + " (p:" + vm.currentFilter.value + "/psn:" + vm.currentFilter.value + ") ?v.\n" +
                                        "    ?v wikibase:quantityAmount ?amount;\n" +
                                        "       wikibase:quantityUnit ?unit.\n" +
                                        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
                                        "}";
                                    fullUrl = sparqlEndpoint + encodeURIComponent(unitQuery);
                                    axios.get(fullUrl)
                                        .then(res => {
                                            if (response.data['results']['bindings'].length) {
                                                arr = generateFilterValuesFromNumbers(response.data['results']['bindings'], res.data['results']['bindings'][0].unitLabel.value);
                                                // Set the href parameter of each bucket.
                                                for (var i = 0; i < arr.length; i++) {
                                                    var q = window.location.search;
                                                    parameters = new URLSearchParams(q);
                                                    parameters.delete("cf");
                                                    parameters.delete("sf");
                                                    parameters.set("quantity," + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""));
                                                    arr[i]['href'] = window.location.pathname + "?" + parameters;
                                                }
                                                vm.items = arr;
                                                vm.itemsType = 'Quantity';
                                                vm.displayCount = 1;
                                            }
                                            else {
                                                // Check if "No value" is to be displayed or not.
                                                index = vm.appliedFilters.findIndex(filter => filter.filterValue == vm.currentFilter.value);
                                                if (index == -1)
                                                    vm.itemsType = "Additionalempty";
                                                else
                                                    vm.itemsType = 'Quantity';
                                            }
                                        })
                                        .catch(_error => {
                                            vm.itemsType = 'Error';
                                        });
                                }
                            })
                            .catch(_error => {
                                /*
                                    Gets fallback results in case the primary query fails or times out.
                                    Finds random quantity amounts and creates buckets.
                                */
                                sparqlQuery = "SELECT ?amount WHERE\n" +
                                    "{\n" +
                                    "SELECT ?item ?amount WHERE {\n" +
                                    "hint:Query hint:optimizer \"None\".\n" +
                                    "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                    "?item (p:" + vm.currentFilter.value + "/psn:" + vm.currentFilter.value + ") ?v.\n" +
                                    "?v wikibase:quantityAmount ?amount.\n" +
                                    "}\n" +
                                    "LIMIT " + resultsPerPage + "\n" +
                                    "}\n" +
                                    "ORDER BY ?amount";
                                vm.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                                fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                                axios.get(fullUrl)
                                    .then(res => {
                                        if (res.data['results']['bindings'].length) {
                                            arr = generateFilterValuesFromNumbers(res.data['results']['bindings'])
                                            // Set the href parameter of each bucket.
                                            for (var i = 0; i < arr.length; i++) {
                                                var q = window.location.search;
                                                parameters = new URLSearchParams(q)
                                                parameters.delete("cf")
                                                parameters.delete("sf")
                                                parameters.set("q." + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""))
                                                arr[i]['href'] = window.location.pathname + "?" + parameters
                                            }
                                            vm.items = arr
                                            vm.displayCount = 0
                                        }
                                        vm.itemsType = 'Quantity'
                                    })
                                    .catch(_error => {
                                        vm.itemsType = 'Error'
                                    })
                            })
                }
                else {
                    // Item property type
                    // Set the URL parameters for href attribute, i.e., only for display purpose. 
                    var q = window.location.search;
                    parameters = new URLSearchParams(q)
                    parameters.set("f." + vm.currentFilter.value, "novalue")
                    vm.noValueURL = window.location.pathname + "?" + parameters
                    // Gets items and their count. 
                    var sparqlQuery = "SELECT ?value ?valueLabel ?count WHERE {\n" +
                        "{\n" +
                        "SELECT ?value (COUNT(?value) AS ?count) WHERE {\n" +
                        "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                        "?item wdt:" + vm.currentFilter.value + " ?value.\n" +
                        filterString +
                        filterRanges +
                        filterQuantities +
                        noValueString +
                        "}\n" +
                        "GROUP BY ?value\n" +
                        "}\n" +
                        "SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                        "}\n" +
                        "ORDER BY DESC (?count)";
                    vm.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                    var fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            if (response.data['results']['bindings'].length) {
                                arr = [...response.data['results']['bindings']]
                                // Remove the already applied filter value.
                                index = []
                                for (let i = 0; i < vm.appliedFilters.length; i++) {
                                    if (vm.appliedFilters[i].filterValue == vm.currentFilter.value) {
                                        index.push(vm.appliedFilters[i].value)
                                    }
                                }
                                arr = arr.filter(x => !index.includes(x.value.value.split('/').slice(-1)[0]))
                                if (arr.length > 0) {
                                    vm.itemsType = "Item"
                                    vm.items = arr
                                    vm.displayCount = 1
                                }
                                else {
                                    vm.itemsType = "Additionalempty"
                                }
                                // Set the href parameter of each value.
                                for (var i = 0; i < arr.length; i++) {
                                    var q = window.location.search;
                                    parameters = new URLSearchParams(q)
                                    parameters.delete("cf")
                                    parameters.delete("sf")
                                    // Multiple values for a filter
                                    var existingValues = ""
                                    for (let i = 0; i < vm.appliedFilters.length; i++) {
                                        if (vm.appliedFilters[i].filterValue == vm.currentFilter.value) {
                                            existingValues = existingValues + vm.appliedFilters[i].value + "-";
                                        }
                                    }
                                    parameters.set("f." + vm.currentFilter.value, existingValues + arr[i].value.value.split('/').slice(-1)[0])
                                    arr[i]['href'] = window.location.pathname + "?" + parameters
                                }
                            }
                            else {
                                // Check if "No value" is to be displayed or not.
                                index = vm.appliedFilters.findIndex(filter => filter.filterValue == vm.currentFilter.value)
                                if (index == -1) vm.itemsType = "Additionalempty"
                                else vm.itemsType = 'Item'
                            }
                        })
                        .catch(_error => {
                            /*
                                Gets fallback results in case the primary query fails or times out.
                                Finds random 300 values.
                            */
                            sparqlQuery = "SELECT ?value ?valueLabel WHERE{\n" +
                                "{\n" +
                                "SELECT DISTINCT ?value\n" +
                                "{\n" +
                                "SELECT ?value WHERE {\n" +
                                "hint:Query hint:optimizer \"None\".\n" +
                                "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                "?item wdt:" + vm.currentFilter.value + " ?value.\n" +
                                filterString +
                                filterRanges +
                                filterQuantities +
                                "}\n" +
                                "LIMIT 300\n" +
                                "}\n" +
                                "\n" +
                                "}\n" +
                                "SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                                "}\n" +
                                "ORDER BY ?valueLabel";
                            fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                            axios.get(fullUrl)
                                .then((res) => {
                                    // Sorting the results
                                    arr = [...res.data['results']['bindings']].slice(0).sort(
                                        function (a, b) {
                                            var x = a.valueLabel.value.toLowerCase();
                                            var y = b.valueLabel.value.toLowerCase();
                                            return x < y ? -1 : x > y ? 1 : 0;
                                        })
                                    // Set the href parameter of each value.
                                    for (var i = 0; i < arr.length; i++) {
                                        var q = window.location.search;
                                        parameters = new URLSearchParams(q)
                                        parameters.delete("cf")
                                        parameters.delete("sf")
                                        parameters.set("f." + vm.currentFilter.value, arr[i].value.value.split('/').slice(-1)[0])
                                        arr[i]['href'] = window.location.pathname + "?" + parameters
                                    }
                                    vm.items = arr
                                    vm.itemsType = "ItemFail"
                                    vm.displayCount = 0
                                })
                                .catch(_error => {
                                    vm.itemsType = 'Error'
                                })

                        })
                }
                // Download csv directly
                if (this.format == 'csv') {
                    this.exportCSV();
                }
            })
    }
})
