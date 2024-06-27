const groupHelper = (channels) => {
    let group = [];
    channels.forEach((eachChannel) => {
        eachChannel.group.forEach((eachGroup) => {
            if(!group.includes(eachGroup) && eachGroup !== "") {
                group.push(eachGroup)
            }
        })
    })
    return group.sort();
}

export default groupHelper;