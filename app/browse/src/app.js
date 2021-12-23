var app = new Vue({
    data: {
        page: '',
        clsValue: '',
        classLabel: '',
        appFilters: [],
        appRanges: [],
        appQuantities: [],
        currentFilterLabel: '',
        currentFilterValue: '',
        secondaryFilterLabel: '',
        secondaryFilterValue: '',
        currentFilterPropertyType: '',
        getFiltersFromURL: 1,
        allItemscomponentKey: 0,
        filterscomponentKey: 0,
        total: '',
        siteText: '',
        fallbackSiteText: '',
        format: ''
    },
    mounted: function () {
        // History logging
        if (this.classLabel != "") {
            window.history.pushState({
                page: this.view,
                classValue: this.classValue,
                filters: this.appliedFilters,
                quantities: this.appliedQuantities,
                ranges: this.appliedRanges,
                currentFilterLabel: this.currentFilterLabel,
                currentFilterValue: urlParams.has('cf') ? urlParams.get('cf') : '',
                secondaryFilterLabel: this.secondaryFilterLabel,
                secondaryFilterValue: urlParams.has('sf') ? urlParams.get('sf') : '',
                fromURL: 0,
                allItemscomponentKey: this.allItemscomponentKey,
                filterscomponentKey: this.filterscomponentKey,
            }, '',
                window.location.pathname + "?" + urlParams
            );
        }
        window.onpopstate = history.onpushstate = function (e) {
            if (e.state) {
                app.page = e.state.page
                app.clsValue = e.state.classValue
                app.getFiltersFromURL = e.state.fromURL
                app.appFilters = e.state.filters
                app.appQuantities = e.state.quantities
                app.appRanges = e.state.ranges
                app.currentFilterLabel = e.state.currentFilterLabel
                app.currentFilterValue = e.state.currentFilterValue
                app.allItemscomponentKey = e.state.allItemscomponentKey
                app.filterscomponentKey = e.state.filterscomponentKey
            }
        };

        // Fetching language file 
        var fullUrl = "languages/" + primaryLang + ".json";
        axios.get(fullUrl)
            .then(response => this.siteText = response.data)
            .catch(_error => {
                var fallbackUrl = "languages/en.json";
                axios.get(fallbackUrl)
                    .then(res => {
                        this.siteText = res.data
                    })
            });
        // Fallback messages
        fullUrl = "languages/en.json";
        axios.get(fullUrl)
            .then(response => this.fallbackSiteText = response.data)
    },
    methods: {
        updatePage: function (page) {
            if (page == "subclass" || page == "superclass" || page == "filters") {
                urlParams.set("view", page)
            }
            else if (page == "view-all-items") {
                urlParams.delete("cf")
                urlParams.delete("sf")
                urlParams.delete("view")
            }
            if (!urlParams.get("lang")) {
                urlParams.set("lang", lang.split(",")[0])
            }
            this.page = page
            this.total = ""
            window.history.pushState({
                page: page,
                classValue: this.classValue,
                filters: this.appliedFilters,
                quantities: this.appliedQuantities,
                ranges: this.appliedRanges,
                currentFilterLabel: this.currentFilterLabel,
                currentFilterValue: this.currentFilterValue,
                secondaryFilterLabel: this.secondaryFilterLabel,
                secondaryFilterValue: this.secondaryFilterValue,
                fromURL: 0,
                allItemscomponentKey: this.allItemscomponentKey,
                filterscomponentKey: this.filterscomponentKey,
            }, '',
                window.location.pathname + "?" + urlParams
            );
        },
        updateClassValue: function (classValue, classLabel = "") {
            urlParams = new URLSearchParams("")
            urlParams.set('c', classValue)
            this.clsValue = classValue;
            this.classLabel = classLabel
            this.currentFilterLabel = '';
            this.currentFilterValue = '';
            this.appFilters = [];
            this.appRanges = [];
            this.appQuantities = [];
            this.allItemscomponentKey = 0;
            this.filterscomponentKey = 0;
            this.totalValues = ''
            this.updatePage('view-all-items')

        },
        updateFilter: function (filter) {
            this.currentFilterLabel = filter.valueLabel.value
            this.currentFilterValue = filter.value.value.split('/').slice(-1)[0]
            urlParams.set('cf', this.currentFilterValue)
            urlParams.delete('view')
            this.updatePage('filter-values')
        },
        updateSecondaryFilter: function (filter) {
            this.secondaryFilterLabel = filter.valueLabel.value
            this.secondaryFilterValue = filter.value.value.split('/').slice(-1)[0]
            urlParams.set('sf', this.secondaryFilterValue)
            urlParams.delete('view')
            this.updatePage('secondary-filter-values')
        },
        applyFilter: function (filter) {
            if (filter == "novalue") {
                if (this.appFilters.findIndex(filter => filter.filterValue == this.currentFilter.value) == -1) {
                    this.appFilters.push({
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        value: "novalue",
                        valueLabel: "No Value"
                    });
                    urlParams.set("f." + this.currentFilter.value, "novalue")
                }
            }
            else {
                var existingValues = ""
                for (let i = 0; i < this.appFilters.length; i++) {
                    if (this.appFilters[i].filterValue == this.currentFilter.value) {
                        existingValues = existingValues + this.appFilters[i].value + "-";
                    }
                }
                this.appFilters.push({
                    filterValue: this.currentFilter.value,
                    filterValueLabel: this.currentFilter.valueLabel,
                    value: filter.value.value.split('/').slice(-1)[0],
                    valueLabel: filter.valueLabel.value
                });
                urlParams.set("f." + this.currentFilter.value, existingValues + filter.value.value.split('/').slice(-1)[0])
            }
            urlParams.delete("cf")
            urlParams.delete("sf")
            this.updatePage('view-all-items')
        },
        applySecondaryFilter:function(filter){
            if (filter == "novalue") {
                if (this.appFilters.findIndex(filter => filter.filterValue == this.secondaryFilter.value) == -1) {
                    this.appFilters.push({
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        value: "novalue",
                        valueLabel: "No Value"
                    });
                    urlParams.set("f." + this.currentFilter.value + "." + this.secondaryFilter.value, "novalue")
                }
            }
            else {
                var existingValues = ""
                for (let i = 0; i < this.appFilters.length; i++) {
                    if (this.appFilters[i].filterValue == this.secondaryFilter.value) {
                        existingValues = existingValues + this.appFilters[i].value + "-";
                    }
                }
                this.appFilters.push({
                    parentFilterValue: this.currentFilter.value,
                    parentFilterValueLabel: this.currentFilter.valueLabel,
                    filterValue: this.secondaryFilter.value,
                    filterValueLabel: this.secondaryFilter.valueLabel,
                    value: filter.value.value.split('/').slice(-1)[0],
                    valueLabel: filter.valueLabel.value
                });
                urlParams.set("f." + this.currentFilter.value + "." + this.secondaryFilter.value, existingValues + filter.value.value.split('/').slice(-1)[0])
            }
            urlParams.delete("cf")
            urlParams.delete("sf")
            this.updatePage('view-all-items')
        },
        applyRange: function (range) {
            const i = this.appRanges.findIndex(_item => _item.filterValue == this.currentFilter.value);
            if (i > -1) {
                if (range == 'novalue') {
                    this.appRanges[i] = {
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue"
                    }
                    urlParams.set("r." + this.currentFilter.value, "novalue")
                }
                else {
                    this.appRanges[i] = {
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: Object.values(range.bucketLL).join("-"),
                        valueUL: Object.values(range.bucketUL).join("-")
                    }
                    if (range.size == 1) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "~" + range.bucketUL.year)
                    else if (range.size == 2) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year)
                    else if (range.size == 3) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "-" + range.bucketLL.month)
                    else if (range.size == 4) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                    else if (range.size == 5) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                }
            }
            else {
                if (range == 'novalue') {
                    this.appRanges.push({
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue"
                    });
                    urlParams.set("r." + this.currentFilter.value, "novalue")
                }
                else {
                    this.appRanges.push({
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: Object.values(range.bucketLL).join("-"),
                        valueUL: Object.values(range.bucketUL).join("-")
                    });
                    if (range.size == 1) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "~" + range.bucketUL.year)
                    else if (range.size == 2) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year)
                    else if (range.size == 3) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "-" + range.bucketLL.month)
                    else if (range.size == 4) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                    else if (range.size == 5) urlParams.set("r." + this.currentFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                }

            }
            urlParams.delete("cf")
            urlParams.delete("sf")
            this.updatePage('view-all-items')
        },
        applySecondaryRange: function(range){
            const i = this.appRanges.findIndex(_item => _item.filterValue == this.currentFilter.value);
            if (i > -1) {
                if (range == 'novalue') {
                    this.appRanges[i] = {
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue"
                    }
                    urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, "novalue")
                }
                else {
                    this.appRanges[i] = {
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: Object.values(range.bucketLL).join("-"),
                        valueUL: Object.values(range.bucketUL).join("-")
                    }
                    if (range.size == 1) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "~" + range.bucketUL.year)
                    else if (range.size == 2) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year)
                    else if (range.size == 3) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "-" + range.bucketLL.month)
                    else if (range.size == 4) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                    else if (range.size == 5) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                }
            }
            else {
                if (range == 'novalue') {
                    this.appRanges.push({
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue"
                    });
                    urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, "novalue")
                }
                else {
                    this.appRanges.push({
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: Object.values(range.bucketLL).join("-"),
                        valueUL: Object.values(range.bucketUL).join("-")
                    });
                    if (range.size == 1) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "~" + range.bucketUL.year)
                    else if (range.size == 2) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year)
                    else if (range.size == 3) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "-" + range.bucketLL.month)
                    else if (range.size == 4) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                    else if (range.size == 5) urlParams.set("r." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL.year + "-" + range.bucketLL.month + "-" + range.bucketLL.day)
                }

            }
            urlParams.delete("cf")
            urlParams.delete("sf")
            this.updatePage('view-all-items')
        },
        applyQuantityRange: function (range) {
            const i = this.appQuantities.findIndex(_item => _item.filterValue == this.currentFilter.value);
            if (i > -1) {
                if (range == 'novalue') {
                    this.appQuantities[i] = {
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue",
                        unit: ""
                    }
                    urlParams.set("q." + this.currentFilter.value, "novalue")
                }
                else {
                    this.appQuantities[i] = {
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: range.bucketLL,
                        valueUL: range.bucketUL,
                        unit: range.unit
                    }
                    urlParams.set("q." + this.currentFilter.value, range.bucketLL + "~" + range.bucketUL + (range.unit != "" ? ("~" + range.unit) : ""))
                }
            }
            else {
                if (range == 'novalue') {
                    this.appQuantities.push({
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue",
                        unit: ""
                    })
                    urlParams.set("q." + this.currentFilter.value, "novalue")

                }
                else {
                    this.appQuantities.push({
                        filterValue: this.currentFilter.value,
                        filterValueLabel: this.currentFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: range.bucketLL,
                        valueUL: range.bucketUL,
                        unit: range.unit
                    });
                    urlParams.set("q." + this.currentFilter.value, range.bucketLL + "~" + range.bucketUL + (range.unit != "" ? ("~" + range.unit) : ""))
                }
            }
            urlParams.delete("cf")
            urlParams.delete("sf")
            this.updatePage('view-all-items')
        },
        applySecondaryQuantityRange:function(range){
            const i = this.appQuantities.findIndex(_item => _item.filterValue == this.secondaryFilter.value);
            if (i > -1) {
                if (range == 'novalue') {
                    this.appQuantities[i] = {
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue",
                        unit: ""
                    }
                    urlParams.set("q." + this.currentFilter.value + "." + this.secondaryFilter.value, "novalue")
                }
                else {
                    this.appQuantities[i] = {
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: range.bucketLL,
                        valueUL: range.bucketUL,
                        unit: range.unit
                    }
                    urlParams.set("q." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL + "~" + range.bucketUL + (range.unit != "" ? ("~" + range.unit) : ""))
                }
            }
            else {
                if (range == 'novalue') {
                    this.appQuantities.push({
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: "No Value",
                        valueLL: "novalue",
                        valueUL: "novalue",
                        unit: ""
                    })
                    urlParams.set("q." + this.currentFilter.value + "." + this.secondaryFilter.value, "novalue")

                }
                else {
                    this.appQuantities.push({
                        parentFilterValue: this.currentFilter.value,
                        parentFilterValueLabel: this.currentFilter.valueLabel,
                        filterValue: this.secondaryFilter.value,
                        filterValueLabel: this.secondaryFilter.valueLabel,
                        valueLabel: range.bucketName,
                        valueLL: range.bucketLL,
                        valueUL: range.bucketUL,
                        unit: range.unit
                    });
                    urlParams.set("q." + this.currentFilter.value + "." + this.secondaryFilter.value, range.bucketLL + "~" + range.bucketUL + (range.unit != "" ? ("~" + range.unit) : ""))
                }
            }
            urlParams.delete("cf")
            urlParams.delete("sf")
            this.updatePage('view-all-items')
        },
        forceAllItemsRerender() {
            this.allItemscomponentKey += 1;
        },
        forceFiltersRerender() {
            this.filterscomponentKey += 1;
        },
        removeFilter: function (filter, page) {
            if(filter.parentFilterValue){
                values = urlParams.get("f." + filter.parentFilterValue + "." + filter.filterValue).split("-")
            }
            else{
                values = filter.value.split("-")
            }
            if (values.length > 1) {
                i = values.indexOf(filter.value)
                values.splice(i, 1)
                if (filter.parentFilterValue){
                    urlParams.set("f." + filter.filterValue, values.join("-"))
                }
                else{
                    urlParams.set("f." + filter.parentFilterValue + "." + filter.filterValue, values.join("-"))
                }
            }
            else {
                if (filter.parentFilterValue) {
                    urlParams.delete("f." + filter.parentFilterValue + "." + filter.filterValue)
                }
                else {
                    urlParams.delete("f." + filter.filterValue)
                }
            }
            index = this.appFilters.findIndex(i => (i.filterValue == filter.filterValue && i.value == filter.value));
            this.appFilters.splice(index, 1)
            this.updatePage(page)
            this.getFiltersFromURL = 0
            this.forceAllItemsRerender()
            this.forceFiltersRerender()
        },
        removeRange: function (range, page) {
            index = this.appRanges.findIndex(filter => filter.filterValue == range.filterValue);
            if (range.parentFilterValue) {
                urlParams.delete("r." + range.parentFilterValue + "." + range.filterValue)
            }
            else {
                urlParams.delete("r." + range.filterValue)
            }
            this.appRanges.splice(index, 1)
            this.updatePage(page)
            this.getFiltersFromURL = 0
            this.forceAllItemsRerender()
            this.forceFiltersRerender()
        },
        removeQuantity: function (quantity, page) {
            index = this.appQuantities.findIndex(filter => filter.filterValue == quantity.filterValue);
            if(quantity.parentFilterValue){
                urlParams.delete("q." + quantity.parentFilterValue + "." + quantity.filterValue)
            }
            else{
                urlParams.delete("q." + quantity.filterValue)
            }
            this.appQuantities.splice(index, 1)
            this.updatePage(page)
            this.getFiltersFromURL = 0
            this.forceAllItemsRerender()
            this.forceFiltersRerender()
        },
        parseDateRange(dateString) {
            dateParts = dateString.split("~")
            if (dateParts.length == 2) {// Date interval
                if (dateParts[0].split("-").length == 1 && dateParts[1].split("-").length == 1) {
                    // Year only
                    label1 = dateParts[0]
                    label2 = dateParts[1]
                    return [dateParts[0] + "-01-01", dateParts[1] + "-12-30", label1 + " - " + label2]
                }
                else if (dateParts[0].split("-").length == 2 || dateParts[1].split("-").length == 2) {
                    if (dateParts[0].split("-")[0] == "") {
                        // Negative year
                        label1 = yearToBCFormat(dateParts[0])
                        label2 = yearToBCFormat(dateParts[1])
                        return [dateParts[0] + "-01-01", dateParts[1] + "-12-30", label1 + " - " + label2]
                    }
                    else {
                        // YYYY-MM
                        label1 = monthNumberToString(dateParts[0].split("-")[1]) + " " + dateParts[0].split("-")[0]
                        label2 = monthNumberToString(dateParts[1].split("-")[1]) + " " + dateParts[1].split("-")[0]
                        return [dateParts[0] + "-01", dateParts[1] + "-30", label1 + " - " + label2]
                    }
                }
                else if (dateParts[0].split("-").length > 2 && dateParts[1].split("-").length > 2) {
                    // YYYY-MM-DD
                    label1 = monthNumberToString(dateParts[0].split("-")[1]) + " " + dateParts[0].split("-")[2] + ", " + dateParts[0].split("-")[0]
                    label2 = monthNumberToString(dateParts[1].split("-")[1]) + " " + dateParts[1].split("-")[2] + ", " + dateParts[1].split("-")[0]
                    return [dateParts[0], dateParts[1], label1 + " - " + label2]
                }
            }
            else if (dateParts.length == 1) {// No interval
                if (dateParts[0].split("-").length == 1) {
                    // Year Only
                    return [dateParts[0] + "-01-01", dateParts[0] + "-12-30", dateParts[0]]
                }
                else if (dateParts[0].split("-").length == 2) {
                    if (dateParts[0].split("-")[0] == "") {
                        // Negative year
                        return [dateParts[0] + "-01-01", dateParts[0] + "-12-30", yearToBCFormat(dateParts[0])]
                    }
                    else {
                        // YYYY-MM
                        label = monthNumberToString(dateParts[0].split("-")[1]) + " " + dateParts[0].split("-")[0]
                        return [dateParts[0] + "-01", dateParts[0] + "-30", label]
                    }
                }
                else if (dateParts[0].split("-").length > 2) {
                    // YYYY-MM-DD
                    label = monthNumberToString(dateParts[0].split("-")[1]) + " " + dateParts[0].split("-")[2] + ", " + dateParts[0].split("-")[0]
                    nextDateArray = dateParts[0].split("-")
                    nextDateArray[nextDateArray.length - 1] = Number(nextDateArray[nextDateArray.length - 1]) + 1
                    return [dateParts[0], nextDateArray.join("-"), label]
                }
            }
        },
        changeLanguage(lang) {
            urlParams.set("lang", lang)
            this.updatePage(this.page)
            location.reload()
        }
    },
    computed: {
        view: function () {
            if (this.page == "") {
                if (urlParams.has("format")) {
                    this.format = urlParams.get("format")
                }
                if (!urlParams.has("c") && !urlParams.has("view")) {
                    return 'class-filter'
                }
                else if (urlParams.has("c") && !urlParams.has("cf") && !urlParams.has("view")) {
                    return 'view-all-items'
                }
                else if (urlParams.has("c") && urlParams.has("cf") && urlParams.has("sf")) {
                    return 'secondary-filter-values'
                }
                else if (urlParams.has("c") && urlParams.has("cf") && !urlParams.has("view")) {
                    return 'filter-values'
                }
                else if (urlParams.has("c") && urlParams.get("view") == "subclass") {
                    return 'subclass'
                }
                else if (urlParams.has("c") && urlParams.get("view") == "superclass") {
                    return 'superclass'
                }
                else if (urlParams.has("c") && urlParams.get("view") == "filters") {
                    return 'filters'
                }
            }
            return this.page
        },
        classValue: function () {
            if (this.clsValue == '') {
                value = urlParams.has('c') ? urlParams.get('c') : ''
            }
            else {
                value = this.clsValue
            }
            if (value != '') {
                sparqlQuery = "SELECT ?valueLabel WHERE {\n" +
                    "  VALUES ?value { wd:" + value + " }\n" +
                    "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                    "}";
                const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                axios.get(fullUrl)
                    .then(response => {
                        str = response.data['results']['bindings'][0].valueLabel.value
                        this.classLabel = str.replace(/^./, str[0].toUpperCase());
                    })
            }
            return value
        },
        currentFilter: function () {
            if (this.currentFilterValue == '') {
                val = urlParams.has('cf') ? urlParams.get('cf') : ''
            }
            else {
                val = this.currentFilterValue
            }
            var sparqlQuery = "SELECT ?valueLabel WHERE {\n" +
                "  VALUES ?value { wd:" + val + " }\n" +
                "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                "}";
            const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
            axios.get(fullUrl)
                .then(response => (this.currentFilterLabel = response.data['results']['bindings'][0].valueLabel.value))
            return { value: val, valueLabel: this.currentFilterLabel }
        },
        secondaryFilter: function () {
            if (this.secondaryFilterValue == '') {
                val = urlParams.has('sf') ? urlParams.get('sf') : ''
            }
            else {
                val = this.secondaryFilterValue
            }
            var sparqlQuery = "SELECT ?valueLabel WHERE {\n" +
                "  VALUES ?value { wd:" + val + " }\n" +
                "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                "}";
            const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
            axios.get(fullUrl)
                .then(response => (this.secondaryFilterLabel = response.data['results']['bindings'][0].valueLabel.value))
            return { value: val, valueLabel: this.secondaryFilterLabel }
        },
        appliedFilters: function () {
            if (this.appFilters.length == 0 && this.getFiltersFromURL == 1) {
                /*  
                 Find all keys with "f.filterValue" or "f.filterValue.secondaryFilter" from the URL.
                 Split the key about "." to get filter and
                 split the result about "-" to get all the values for that particular filter.
                */
                url = decodeURI(urlParams);
                var res = url.match(/[fF]\.[Pp](\d+)((\.[Pp](\d+))?)/g);
                var filters = values = "";
                let filterSet = new Set()
                if (res != null) {
                    for (var i = 0; i < res.length; i++) {
                        arr = res[i].split(".")
                        if (urlParams.get(res[i]) == "novalue") {
                            if(arr[2]){
                                this.appFilters.push({
                                    parentFilterValue:arr[1],
                                    parentFilterValueLabel:arr[1],
                                    filterValue: arr[2],
                                    filterValueLabel: arr[2],
                                    value: "novalue",
                                    valueLabel: "No Value"
                                })
                                filterSet.add(arr[2])
                            }
                            else{
                                this.appFilters.push({
                                    filterValue: arr[1],
                                    filterValueLabel: arr[1],
                                    value: "novalue",
                                    valueLabel: "No Value"
                                })
                            }
                        }
                        else {
                            if(arr[2]){
                                for (const v of urlParams.get(res[i]).split("-")) {
                                    this.appFilters.push({
                                        parentFilterValue: arr[1],
                                        parentFilterValueLabel: arr[1],
                                        filterValue: arr[2],
                                        filterValueLabel: arr[2],
                                        value: v,
                                        valueLabel: v
                                    })
                                    values += " wd:" + v
                                }
                                filterSet.add(arr[2])
                            }
                            else{
                                for (const v of urlParams.get(res[i]).split("-")) {
                                    this.appFilters.push({
                                        filterValue: arr[1],
                                        filterValueLabel: arr[1],
                                        value: v,
                                        valueLabel: v
                                    })
                                    values += " wd:" + v
                                }
                            }
                        }
                        filterSet.add(arr[1])
                    }
                    for (let item of filterSet) {
                        filters += " wdt:" + item
                    }
                    // Get filter labels
                    var sparqlQuery = "SELECT ?prop ?propLabel WHERE {\n" +
                        "  VALUES ?p {  " + filters + " }\n" +
                        "  ?prop wikibase:directClaim ?p.\n" +
                        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                        "}";
                    var fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            for (let i = 0; i < response.data['results']['bindings'].length; i++) {
                                for (let j = 0; j < this.appFilters.length; j++) {
                                    if (this.appFilters[j].filterValue == response.data['results']['bindings'][i].prop.value.split("/").slice(-1)[0]) {
                                        this.appFilters[j].filterValueLabel = response.data['results']['bindings'][i].propLabel.value
                                    }
                                    if (this.appFilters[j].parentFilterValue == response.data['results']['bindings'][i].prop.value.split("/").slice(-1)[0]) {
                                        this.appFilters[j].parentFilterValueLabel = response.data['results']['bindings'][i].propLabel.value
                                    }
                                }
                            }
                        })
                    // Get value labels
                    sparqlQuery = "SELECT ?value ?valueLabel WHERE {\n" +
                        "  VALUES ?value {  " + values + " }\n" +
                        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". } \n" +
                        "}";
                    var fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            for (let i = 0; i < response.data['results']['bindings'].length; i++) {
                                index = this.appFilters.findIndex(filter => filter.value == response.data['results']['bindings'][i].value.value.split("/").slice(-1)[0]);
                                if (index != -1) {
                                    this.appFilters[index].valueLabel = response.data['results']['bindings'][i].valueLabel.value
                                }
                            }
                        })
                }
            }
            return this.appFilters
        },
        appliedRanges: function () {
            if (this.appRanges.length == 0 && this.getFiltersFromURL == 1) {
                /*
                 Find all keys with "r.filterValue" from the URL.
                 Split the key about "." to get filter and
                 split the result about "~" to get upper and lower limits of the date range.
                */
                url = decodeURI(urlParams);
                var res = url.match(/[rR]\.[Pp](\d+)((\.[Pp](\d+))?)/g);
                var filters = "";
                if (res != null) {
                    for (var i = 0; i < res.length; i++) {
                        arr = res[i].split(".")
                        if (urlParams.get(res[i]) == "novalue") {
                            if(arr[2]){
                                this.appRanges.push({
                                    parentFilterValue: arr[1],
                                    parentFilterValueLabel: arr[1],
                                    filterValue: arr[2],
                                    filterValueLabel: arr[2],
                                    valueLL: "novalue",
                                    valueUL: "novalue",
                                    valueLabel: "No Value"
                                })
                                filters += " wdt:" + arr[1]
                            }
                            else{
                                this.appRanges.push({
                                    filterValue: arr[1],
                                    filterValueLabel: arr[1],
                                    valueLL: "novalue",
                                    valueUL: "novalue",
                                    valueLabel: "No Value"
                                })
                            }
                        }
                        else {
                            dateRangeParts = this.parseDateRange(urlParams.get(res[i]))
                            if(arr[2]){
                                this.appRanges.push({
                                    parentFilterValue: arr[1],
                                    parentFilterValueLabel: arr[1],
                                    filterValue: arr[2],
                                    filterValueLabel: arr[2],
                                    valueLL: dateRangeParts[0],
                                    valueUL: dateRangeParts[1],
                                    valueLabel: dateRangeParts[2]
                                })
                                filters += " wdt:" + arr[2]
                            }
                            else{
                                this.appRanges.push({
                                    filterValue: arr[1],
                                    filterValueLabel: arr[1],
                                    valueLL: dateRangeParts[0],
                                    valueUL: dateRangeParts[1],
                                    valueLabel: dateRangeParts[2]
                                })
                            }
                        }
                        filters += " wdt:" + arr[1]
                    }
                    var sparqlQuery = "SELECT ?prop ?propLabel WHERE {\n" +
                        "  hint:Query hint:optimizer \"None\".\n" +
                        "  VALUES ?p {  " + filters + " }\n" +
                        "  ?prop wikibase:directClaim ?p.\n" +
                        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                        "}";
                    var fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            for (let i = 0; i < response.data['results']['bindings'].length; i++) {
                                for (let j = 0; j < this.appRanges.length; j++) {
                                    if (this.appRanges[j].filterValue == response.data['results']['bindings'][i].prop.value.split("/").slice(-1)[0]) {
                                        this.appRanges[j].filterValueLabel = response.data['results']['bindings'][i].propLabel.value
                                    }
                                    if (this.appRanges[j].parentFilterValue == response.data['results']['bindings'][i].prop.value.split("/").slice(-1)[0]) {
                                        this.appRanges[j].parentFilterValueLabel = response.data['results']['bindings'][i].propLabel.value
                                    }
                                }
                            }
                        })
                }
            }
            return this.appRanges
        },
        appliedQuantities: function () {
            if (this.appQuantities.length == 0 && this.getFiltersFromURL == 1) {
                /*
                 Find all keys with "q.filterValue" from the URL.
                 Split the key about "." to get filter and
                 split the result about "~" to get upper limit,
                 lower limit and unit of the quantity.
                */
                url = decodeURI(urlParams);
                var res = url.match(/[qQ]\.[Pp](\d+)((\.[Pp](\d+))?)/g);
                var filters = "";
                if (res != null) {
                    for (var i = 0; i < res.length; i++) {
                        arr = res[i].split(".")
                        if (urlParams.get(res[i]) == "novalue") {
                            if(arr[2]){
                                this.appQuantities.push({
                                    parentFilterValue: arr[1],
                                    parentFilterValueLabel: arr[1],
                                    filterValue: arr[2],
                                    filterValueLabel: arr[2],
                                    valueLL: "novalue",
                                    valueUL: "novalue",
                                    valueLabel: "No Value",
                                    unit: ""
                                })
                                filters += " wdt:" + arr[2]
                            }
                            else{
                                this.appQuantities.push({
                                    filterValue: arr[1],
                                    filterValueLabel: arr[1],
                                    valueLL: "novalue",
                                    valueUL: "novalue",
                                    valueLabel: "No Value",
                                    unit: ""
                                })
                            }
                        }
                        else {
                            if(arr[2]){
                                this.appQuantities.push({
                                    parentFilterValue: arr[1],
                                    parentFilterValueLabel: arr[1],
                                    filterValue: arr[2],
                                    filterValueLabel: arr[2],
                                    valueLL: urlParams.get(res[i]).split("~")[0].trim(),
                                    valueUL: urlParams.get(res[i]).split("~")[1].trim(),
                                    valueLabel: numberWithCommas(urlParams.get(res[i]).split("~")[0].trim()) + " - " + numberWithCommas(urlParams.get(res[i]).split("~")[1].trim()),
                                    unit: urlParams.get(res[i]).split("~")[2] ? urlParams.get(res[i]).split("~")[2] : ""
                                })
                                filters += " wdt:" + arr[2]
                            }
                            else{
                                this.appQuantities.push({
                                    filterValue: arr[1],
                                    filterValueLabel: arr[1],
                                    valueLL: urlParams.get(res[i]).split("~")[0].trim(),
                                    valueUL: urlParams.get(res[i]).split("~")[1].trim(),
                                    valueLabel: numberWithCommas(urlParams.get(res[i]).split("~")[0].trim()) + " - " + numberWithCommas(urlParams.get(res[i]).split("~")[1].trim()),
                                    unit: urlParams.get(res[i]).split("~")[2] ? urlParams.get(res[i]).split("~")[2] : ""
                                })
                            }
                        }
                        filters += " wdt:" + arr[1]
                    }
                    var sparqlQuery = "SELECT ?prop ?propLabel WHERE {\n" +
                        "  hint:Query hint:optimizer \"None\".\n" +
                        "  VALUES ?p {  " + filters + " }\n" +
                        "  ?prop wikibase:directClaim ?p.\n" +
                        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                        "}";
                    var fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            for (let i = 0; i < response.data['results']['bindings'].length; i++) {
                                for (let j = 0; j < this.appQuantities.length; j++) {
                                    if (this.appQuantities[j].filterValue == response.data['results']['bindings'][i].prop.value.split("/").slice(-1)[0]) {
                                        this.appQuantities[j].filterValueLabel = response.data['results']['bindings'][i].propLabel.value
                                    }
                                    if (this.appQuantities[j].parentFilterValue == response.data['results']['bindings'][i].prop.value.split("/").slice(-1)[0]) {
                                        this.appQuantities[j].parentFilterValueLabel = response.data['results']['bindings'][i].propLabel.value
                                    }
                                }
                            }
                        })
                }
            }
            return this.appQuantities
        },
        totalValues: function () {
            var filterString = "";
            var noValueString = "";
            for (let i = 0; i < this.appliedFilters.length; i++) {
                if (this.appliedFilters[i].parentFilterValue) {
                    filterString += "?value wdt:" + this.appliedFilters[i].parentFilterValue + " ?temp.\n" +
                        "?temp wdt:" + this.appliedFilters[i].filterValue + " wd:" + this.appliedFilters[i].value + ".\n";
                }
                else if (this.appliedFilters[i].value == "novalue") {
                    noValueString += " FILTER(NOT EXISTS { ?value wdt:" + this.appliedFilters[i].filterValue + " ?no. }).\n"
                }
                else {
                    filterString += "?value wdt:" + this.appliedFilters[i].filterValue + " wd:" + this.appliedFilters[i].value + ".\n";
                }
            }
            var filterRanges = "";
            for (let i = 0; i < this.appliedRanges.length; i++) {
                if (this.appliedRanges[i].valueLL == "novalue") {
                    noValueString += " FILTER(NOT EXISTS { ?value wdt:" + this.appliedRanges[i].filterValue + " ?no. }).\n"
                }
                else {
                    timePrecision = getTimePrecision(this.appliedRanges[i].valueLL, this.appliedRanges[i].valueUL)
                    filterRanges += "?value (p:" + this.appliedRanges[i].filterValue + "/psv:" + this.appliedRanges[i].filterValue + ") ?timenode" + i + ".\n" +
                        "  ?timenode" + i + " wikibase:timeValue ?time" + i + ".\n" +
                        "  ?timenode" + i + " wikibase:timePrecision ?timeprecision" + i + ".\n" +
                        "  FILTER('" + this.appliedRanges[i].valueLL + "'^^xsd:dateTime <= ?time" + i + " && ?time" + i + " < '" + this.appliedRanges[i].valueUL + "'^^xsd:dateTime).\n" +
                        "  FILTER(?timeprecision" + i + ">=" + timePrecision + ")\n";
                }
            }
            var filterQuantities = "";
            for (let i = 0; i < this.appliedQuantities.length; i++) {
                if (this.appliedQuantities[i].parentFilterValue) {
                    if (this.appliedQuantities[i].valueLL == "novalue") {
                        noValueString += " FILTER(NOT EXISTS { ?value wdt:" + this.appliedQuantities[i].filterValue + " ?no. }).\n"
                    }
                    else if (this.appliedQuantities[i].unit == "") {
                        filterQuantities += "?value wdt:" + this.appliedQuantities[i].parentFilterValue + " ?temp.\n" +
                            "?temp (p:" + this.appliedQuantities[i].filterValue + "/psv:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                            "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                            "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >=" + this.appliedQuantities[i].valueLL + ")\n"
                    }
                    else {
                        filterQuantities += "?value wdt:" + this.appliedQuantities[i].parentFilterValue + " ?temp.\n" +
                            "?temp (p:" + this.appliedQuantities[i].filterValue + "/psn:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                            "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                            "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >=" + this.appliedQuantities[i].valueLL + ")\n"
                    }
                }
                else {
                    if (this.appliedQuantities[i].valueLL == "novalue") {
                        noValueString += " FILTER(NOT EXISTS { ?value wdt:" + this.appliedQuantities[i].filterValue + " ?no. }).\n"
                    }
                    else if (this.appliedQuantities[i].unit == "") {
                        filterQuantities += "?value (p:" + this.appliedQuantities[i].filterValue + "/psv:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                            "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                            "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >=" + this.appliedQuantities[i].valueLL + ")\n"
                    }
                    else {
                        filterQuantities += "?value (p:" + this.appliedQuantities[i].filterValue + "/psn:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                            "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                            "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >=" + this.appliedQuantities[i].valueLL + ")\n"
                    }
                }
            }
            sparqlQuery = "SELECT (COUNT(DISTINCT ?value) AS ?count) WHERE {\n" +
                "  ?value wdt:" + instanceOf + " wd:" + this.classValue + ".  \n" +
                filterString +
                filterRanges +
                filterQuantities +
                noValueString +
                "}";
            fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
            axios.get(fullUrl)
                .then(response => this.total = response.data['results']['bindings'][0].count.value)
                .catch(error => {
                    this.total = 1000000
                })
            return this.total
        }
    }
}).$mount('#app')
