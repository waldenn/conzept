/*

IDEOGRAPH - explore ideologies of political parties with SPAQRL requests to WikiData, D3 and PixiJS.

Copyright (C) 2021 André Ourednik

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


let endpoint = "https://query.wikidata.org/sparql?query=";
let loadinginfo = d3.select("#loadinginfo")
let loadinginfotext = "";
let graph, graphstore ; // neccessary globals

// Make a list of countries
let sparql = `
    SELECT DISTINCT ?country ?countryLabel 
    WHERE {
        ?item wdt:P1142 ?linkTo .
        ?linkTo wdt:P31 wd:Q12909644 . # keep only targets that are political ideologies
        VALUES ?type { wd:Q7278  wd:Q24649 } # filter by these types of political actors
        ?item wdt:P31 ?type .
        ?item wdt:P17 ?country .
        MINUS { ?item wdt:P576 ?abolitionDate } # exclude abolished parties
        MINUS { ?country wdt:P576 ?countryAbolitionDate }. # exclude abolished countries
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
    }
`;
let req = endpoint + encodeURIComponent(sparql);
getCountryList(req);

let initialCountries = [ // Europe
    "wd:Q1246", // Kosovo
    "wd:Q142",
    "wd:Q145", // UK
    "wd:Q183",
    "wd:Q189", // Iceland
    "wd:Q191", // Estonia
    "wd:Q20", // Norway
    "wd:Q25", // Wales
    "wd:Q211", // Latvia
    "wd:Q213",
    "wd:Q214", // Sloveni
    "wd:Q215", // Slovakia
    "wd:Q217", // Moldova
    "wd:Q218", // Romania
    "wd:Q219",
    "wd:Q222", // Albania
    "wd:Q223", // Greenland
    "wd:Q224",
    "wd:Q225",
    "wd:Q228", // Andora
    "wd:Q229",
    "wd:Q233", // Malta
    "wd:Q235", // Monaco
    "wd:Q236", // Montenegro
    "wd:Q238", // San Marino
    "wd:Q27", // Ireland
    "wd:Q28", // Hungary
    "wd:Q29", // Spain
    "wd:Q31",
    "wd:Q32", // Luxembourg
    "wd:Q33", // Finlannd
    "wd:Q34", // Sweden
    "wd:Q347", // Lichtenstein
    "wd:Q35",
    "wd:Q36", // Poland
    "wd:Q37", // Lituania
    "wd:Q38",
    "wd:Q39",
    "wd:Q40",
    "wd:Q403", // Serbia
    "wd:Q41" ,// Greece
    "wd:Q45", // Portugal
    "wd:Q4628", // Faroe Islands
    "wd:Q55", // Netherlands
    "wd:Q9676" // Isle of Man
];

makeCountriesGraph(initialCountries);

function makeCountriesGraph(countries) {
    sparql = `
        SELECT DISTINCT ?item ?itemLabel ?country ?countryLabel ?linkTo ?linkToLabel
        WHERE {
            ?item wdt:P1142 | wdt:P1142*/wdt:P279* ?linkTo . # alternative path makes link to ideology superclass
            VALUES ?ideatype { wd:Q7257 wd:Q5333510 wd:Q12909644 wd:Q179805}  # ideologie ou philosophie politique ou économique
            ?linkTo wdt:P31 ?ideatype .
            VALUES ?type { wd:Q7278  wd:Q24649 } # filter by these types of political actors
            ?item wdt:P31 ?type .
            ?item wdt:P17 ?country .
            MINUS { ?item wdt:P576 ?abolitionDate } # exclude abolished parties
            MINUS { ?country wdt:P576 ?countryAbolitionDate }. # exclude abolished countries
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
        } 
    `;
    let req = endpoint + encodeURIComponent(sparql);
    getGraphData(req);
}


// Constructs a list of countnries to choose from. 
// On first run, launch graph construction.
async function getCountryList(req) {   
    loadinginfotext += "Loading list of countries... ";
    loadinginfo.style('display', 'block').text(loadinginfotext);
    let response = await fetch(req, {
        headers: {
            "Accept": "text/csv"
        }
    });  
    let text = await response.text();  
    let countries = csvToArray(text);
    console.log(countries);
    countries.sort((a,b) => (a["countryLabel\r"] > b["countryLabel\r"]) ? 1 : ((b["countryLabel\r"] > a["countryLabel\r"]) ? -1 : 0))
    let countriesdiv = d3.select("#countryselector");
    countries.forEach(c=>{
        let newdiv = countriesdiv.append("div")
        let cval = c.country.replace("http://www.wikidata.org/entity/","wd:");
        let cid = cval.replace("wd:","c")
        newdiv
            .append("input")
            .attr("type","checkbox")
            .attr("name", c["countryLabel\r"])
            .attr("id",cid)
            .attr("value", cval) 
            .attr("onclick","updateGraph()")
        ;
        newdiv
            .append("label")
            .append("a")
            .attr("href",c.country)
            .attr("target","_blank")
            .text(c["countryLabel\r"])
        ;
    });
    initialCountries.forEach(cval => document.getElementById(cval.replace("wd:","c")).checked = true);
}


async function getGraphData(req) {   
    loadinginfotext += "Fetching graph data...\n";
    loadinginfo.style('display', 'block').text(loadinginfotext);
    let response = await fetch(req, {
        headers: {
            "Accept": "text/csv"
        }
    });  
    let text = await response.text();  
    let data = csvToArray(text);
    console.log(data);
    let nodes = [];
    let links = [];
    data.forEach((line)=>{ 
        if (typeof line.item !== "undefined" & typeof line.linkTo !== "undefined") { 
            nodes.push({
                id: line.item.replace("http://www.wikidata.org/entity/","wd:"), 
                label : line.itemLabel,
                group : 1    
            }) ;
            nodes.push({
                id: line.linkTo.replace("http://www.wikidata.org/entity/","wd:"), 
                label : line["linkToLabel\r"], // might need to remove \r from the csv in csvToArray,
                group : 2    
            }) ;
            links.push({
                source: line.item.replace("http://www.wikidata.org/entity/","wd:"),
                target: line.linkTo.replace("http://www.wikidata.org/entity/","wd:"),
                value: 0.5
            });
        }
    });
    nodes = nodes.filter((e, i) => nodes.findIndex(a => a.id === e.id) === i); // get only unique nodes.
    graph = {links:links,nodes:nodes};
    // store the full graph for later use
    graphstore = Object.assign({}, graph);
    drawGraph(graph);
}

function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });
    return arr;
}


let width = screen.availWidth, height = screen.availHeight;


function colour(num){
    if (num > 1) return 0xFF0000
    return 11454440 ;
}

/*
let colour = (function() {
    let scale = d3.scaleOrdinal(d3.schemeCategory20);
    return (num) => parseInt(scale(num).slice(1), 16);
})();
*/

let simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.id))
    .force('charge', d3.forceManyBody().strength(d => d.group == 2 ? -500 :  -5))
    // .force('center', d3.forceCenter(width / 2, height / 2) )
    .force("x", d3.forceX(width / 2).strength(0.5))
    .force("y", d3.forceY(height / 2).strength(0.5))
    .force("collide",d3.forceCollide().radius(4.5)) // d => d.radius  is slow
    .alphaDecay(0.002)
;


let stage = new PIXI.Container();
let renderer = PIXI.autoDetectRenderer(
    width, height,
    {antialias: !0, transparent: !0, resolution: 1}
);
document.body.appendChild(renderer.view);
  
function drawGraph(graph) {
    loadinginfotext += "Drawing graph... ";
    loadinginfo.style('display', 'block').text(loadinginfotext);
    console.log(graph);

    // TRANSFORM THE DATA INTO A D3 GRAPH
    simulation
        .nodes(graph.nodes)
        .on('tick', ticked) // this d3 ticker can be replaced by PIXI's "requestAnimationFrame" but the system is then too excited
        .force('link')
          .links(graph.links);

    // count incoming links to set node sizes
    graph.links.forEach(function(link){
        if (!link.target["linkCount"]) link.target["linkCount"] = 0;
        link.target["linkCount"]++;    
    });


    // Render with PIXI ------

    // let layerLinks = new PIXI.display.Layer(); // does not work
    // see more here: https://github.com/pixijs/layers/wiki


    // the LINKS are just one object that actually gets drawn in the ticks:
    let containerLinks = new PIXI.Container();
    let links = new PIXI.Graphics();
    containerLinks.addChild(links);

    // render NODES

    let containerParties = new PIXI.Container();
    let containerIdeologies = new PIXI.Container();
    graph.nodes.forEach((node) => {
        node.gfx = new PIXI.Graphics();
        node.gfx.lineStyle(0.5, 0xFFFFFF);
        node.gfx.beginFill(colour(node.group));
        node.radius = node.group < 2 ? 3 : 3 + Math.sqrt(node.linkCount);
        node.gfx.drawCircle(0, 0, node.radius );
        node.gfx.interactive = true;
        node.gfx.hitArea = new PIXI.Circle(0, 0, node.radius);
        node.gfx.mouseover = function(ev) { 
            // TODO for some reason, the attached event does not work whenn the graph is updated 
            console.log(node);
            let nodex = node.x + 10;
            let nodey = node.y - 10;
            d3.select("#label")
                .attr("style", "left:"+nodex+"px;top:"+nodey+"px;")
                .select("a")
                .attr("href",node.id.replace("wd:","http://www.wikidata.org/entity/"))
                .attr("target","_blank")
                .text(node.label)     
        }
        node.gfx.click = function(ev) {
            focus(node);
        } 
        if (node.group==1) containerParties.addChild(node.gfx);
        if (node.group==2) containerIdeologies.addChild(node.gfx);
        // stage.addChild(node.gfx);

        if (node.group == 2) {
            node.lgfx = new PIXI.Text(
                node.label, {
                    fontFamily : 'Maven Pro', 
                    fontSize: 9 + node.radius / 2, 
                    fill : 0xFF0000, 
                    align : 'center'
                }
            );
            containerIdeologies.addChild(node.lgfx);
        }
    });

    containerLinks.zIndex = 0;
    containerIdeologies.zIndex = 2;
    containerParties.zIndex = 1;
    stage.addChild(containerLinks);
    stage.addChild(containerParties);
    stage.addChild(containerIdeologies);
    stage.children.sort((itemA, itemB) => itemA.zIndex - itemB.zIndex);

    /*
    stage.children.sort(function(a,b) {
        if (a.fillColor == 11454440 ) return -1;
        return 1;
    }); 
    */

    d3.select(renderer.view)
        .call(
            d3.drag()
                .container(renderer.view)
                .subject(() => simulation.find(d3.event.x, d3.event.y))
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended)
        );

    // ticked()
    function ticked() {
        // requestAnimationFrame(ticked); //this d3 on.ticker can be replaced by PIXI's "requestAnimationFrame" but the system is then too excited. See above
        graph.nodes.forEach((node) => {
            let { x, y, gfx, lgfx, radius } = node;
            gfx.position = new PIXI.Point(x, y);
            if (node.group == 2) lgfx.position = new PIXI.Point(x + radius / 2, y + radius /2);
        });
        links.clear();
        links.alpha = 0.6;
        graph.links.forEach((link) => {
            let { source, target } = link;
            links.lineStyle(Math.sqrt(link.value), 0x999999,link.alpha);
            links.moveTo(source.x, source.y);
            links.lineTo(target.x, target.y);
        });
        links.endFill();
        renderer.render(stage);
        // when this point is reached, the notification about loading can be removed
        loadinginfotext = "";
        loadinginfo.style('display', 'none').text(loadinginfotext);
    }

    simulation.alphaTarget(0.3).restart(); // give it an initial push
}

function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
}

function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}

// Graph highlight -------

let rootSelectedNode = {};

function focus(d) {
    console.log(d);
    if (rootSelectedNode == d) {
        unfocus();
    } else {
        rootSelectedNode = d;
        markSelected(d);
        hideLabels();
        revealLabels();
    }
    updateColor();  
}

function unfocus() {
    graph.nodes.forEach(n => {n.marked = true});
    graph.links.forEach(l => {l.marked = true});
    hideLabels();
}

function markSelected(d){
    graph.nodes.forEach(n => {n.marked = false})
    graph.links.forEach(l => {l.marked = false})
    d.marked = true;
    let linked = [];
    graph.links.filter(l => 
        l.source == d | l.target == d
    ).forEach(l => {
        l.marked = true;
        linked.push(l.source.id);
        linked.push(l.target.id)
    });
    graph.nodes.forEach(n => n.marked = linked.includes(n.id) ? true : false)
}

function updateColor() {
    graph.nodes.filter(n => !n.marked).forEach(n => {
        n.gfx.alpha = 0.2; 
        if (n.group == 2) n.lgfx.alpha=0.2
    });
    graph.links.filter(l => !l.marked).forEach(l => l.alpha = 0.1 );
    graph.nodes.filter(n => n.marked).forEach(n => {
        n.gfx.alpha = 1; 
        if (n.group == 2) n.lgfx.alpha =1
    });
    graph.links.filter(l => l.marked).forEach(l => l.alpha = 1);
}

function revealLabels(){
    graph.nodes.filter(n => n.marked & n.group == 1 ).forEach(n => {
        n.lgfx = new PIXI.Text(
                n.label, {
                    fontFamily : 'Maven Pro', 
                    fontSize: 9 , 
                    fill : n.gfx.fill, 
                    align : 'center'
                }
            );
        stage.addChild(n.lgfx);
    });
}

function hideLabels(){
    graph.nodes.filter(n => n.marked & n.group == 1 ).forEach(n => {
        stage.removeChild(n.lgfx);
        n.lgfx = null;
    });
}


// Graph updates ------------


function updateGraph(){
    simulation.stop();
    graph = graphstore = null;
    loadinginfotext += "Updating Graph...\n";
    loadinginfo.style('display', 'block').text(loadinginfotext);
    let checked = [];
    let boxes = d3.selectAll("input[type='checkbox']:checked")
    boxes._groups[0].forEach(b=>{
        checked.push(b.value)
    });
    console.log(checked);
    stage.removeChildren();
    // d3.select("#label").text("");
    makeCountriesGraph(checked);
}

// TODO add element without destroying everything
function restoreGraph(){
    // add all elements to graph removed by previous filter
    graphstore.nodes.forEach(sn => {
        if (graph.nodes.filter(n=> n.id == sn.id).length==0) graph.nodes.push(Object.assign({}, sn));
    })
    // TODO : something's wrong with attaching those links
    graphstore.links.forEach(sl => {
        if (graph.links.filter(l=> l.id == sl.id).length==0) graph.links.push(Object.assign({}, sl));
    })
    // relink nodes correcly
    graph.links.forEach(l => {
        l.source = graph.nodes.filter(n=> n.id == l.source.id)[0];
        l.target = graph.nodes.filter(n=> n.id == l.target.id)[0];
    });
}

