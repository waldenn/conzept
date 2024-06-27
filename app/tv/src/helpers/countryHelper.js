const countryHelper = (channels) => {
    let countries = [];
    channels.forEach((eachChannel) => {
        const index = countries.findIndex((eachCountry) => eachCountry.code === eachChannel.country.code)
        
        if(index < 0 && eachChannel.country.code !== "") {
            let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
            let countryName =  regionNames.of(eachChannel.country.code)
            let country = {...eachChannel.country, name: countryName};
            countries.push(country);
        }
    })
    return countries.sort((a, b) => {
        if ( a.name < b.name ){
            return -1;
        }
        if ( a.name > b.name ){
        return 1;
        }
        return 0;
    });
}

export default countryHelper;