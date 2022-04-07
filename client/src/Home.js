import React, {useEffect} from "react";
import * as d3 from "d3";   //npm install d3 --save!!
import data from "./FINAL-SET.csv";

var cleanedAndOrganizedData;
var allNodes;

function setCleanedAndOrganizedData(array)
{
    return array;
}

function setNodes(node)
{
    return node;
}

const Home = () => 
{
    //YOU BEST FIX THOSE SVGs! THE SIZES AND LOCATION NEED DRASTIC ADJUSTING
    
    //Here, I will make a call to all the svg related functions
    useEffect(() => {
        
        //Make the final set of organized data
        d3.csv(data).then(
            function(data)
            {
                //Begin by organizing the inputted csv data in a menaningful way, somehow
                //console.log(data)
                var masterArray = organizeData(data)
                console.log(masterArray)
                cleanedAndOrganizedData = setCleanedAndOrganizedData(masterArray)
        
                makePathway(masterArray)
                makeRegulationList(masterArray)
                makePPIBase(masterArray)
            })

    })

    /*
        Here is the function that organizes all the data from the inputted csv

    */
    function organizeData(data)
    {
        //Declare a temporary array that is able to hold the contents to be passed to the masterArray
        let arr = []

        //Take in an manipulate the csv data to organize a ton of protein objects
        //Each protein object will be pushed into the temporary array arr

        for(var i = 0; i < data.length; i++)
        { 
          var proteinObject = 
          {
              name: data[i]["Protein Name"],
              actualName: getRealName(data[i]["Protein Name"]),
              id: data[i]["Protein ID"],
              pathway: commaSeparatedStringToList(data[i]["Pathway"]),
              connections: commaSeparatedStringToList(data[i]["List of Proteins Connected To"]),
              molecules: commaSeparatedStringToList(data[i]["Molecules Connected To"]),
              pathwayConnection: data[i]["Other Pathways Connected To"],
              TF: commaSeparatedStringToList(data[i]["List of TF Reg"]),
              regulation: commaSeparatedStringToList(data[i]["Corresponding reg"]),
              branch: data[i]["Branch point"],              
              PPINetwork: commaSeparatedStringToList(data[i]["PPI network"]),
              PPIInteraction: commaSeparatedStringToList(data[i]["PPI network interaction type"])
          }

          arr.push(proteinObject)
        }

        return arr;

        //Removes any dashes in protein names used by the program to denote node differences but not researchers
        function getRealName(string)
        {                
            let temp = ""   //This is a temporary string needed to add characters for the real name
            var count = 0   //Counter variable

            if(string.includes("-"))
            {
                while(string[count + 1] !== "-")
                {
                    temp = temp + string[count]
                    count++;
                }
                
                return temp;
            }
            else
            {
                return string;
            }

        }
        
        //Makes a list of all pathways a protein is a part of

        //Converts to comma separated sting to a list
        function commaSeparatedStringToList(longString)
        {
            //A temporary array that will hold the pathways to convert into a string
            let arr = []

            //A variable to hold onto the last index of the string
            let lastIndex = 0

            //First, check if the protein is found in multiple pathways. If it is, do work to splice them out
            //Else, just push the whole string onto the array and return it
            if(longString.includes(','))
            {
                //Iterate through the string until you encounter a ',' and slice until you reach the end of the string
                for(var i = 0; i <= longString.length; i++)
                {
                    if(longString[i] === ','|| i === longString.length)
                    {
                        //Now separate the string from the last knonw index to the column
                        let separateString = longString.slice(lastIndex, i)

                        //Add it to the array and up the previous index to the next index after the comma
                        arr.push(separateString)
                        lastIndex = i + 1
                    }
                }

                return arr;
            }
            else
            {
                arr.push(longString)
                return arr;
            }

        }
    }

    /*
        Here is the function for making the main pathway
            - Allows one to see a pathway selected
            - Can select and see a different pathway
            - Able to see different layouts (Only proteins, protein to molecules, with transcription factors present)
    */
    function makePathway(masterArray)
    {
        /*  Necessary variabels for this function and other nested functions
            with the intended use and function noted according to the <variable></variable>   */
        var selectedPathway = /*"Citrate Cycle"*/ "Glycolysis/Gluconeogensis"
        var pathwayType = "Protein-Protein"
        var TFPresent = false

        //Makes the background panel and the radio buttons
        drawBasicBackground()

            //A dropdown menu so that the user can choose the pathway of choice
            //Get all the potential values for pathways in the csv
            var pathwayDropDownValues = getAllPathwayOptions(masterArray)
            //console.log(pathwayDropDownValues)
            console.log(selectedPathway)

            //Create the actual dropdown menu
            d3.select("#selectButton")
              .selectAll('myOptions')
     	      .data(pathwayDropDownValues)
              .enter()
    	      .append('option')
              .text(function(d){return d;}) // text showed in the menu
              .attr("value", function(d){return d;}) // corresponding value returned by the button
              
            d3.select("#selectButton")
              .on("change", function(event, d)
                 {
                    //Update which pathway we want to draw
                    selectedPathway = d3.select(this).property("value")
                    console.log(selectedPathway) 
                    
                    //Get rid of the existing pathway and redraw everything that is basically there
                    d3.select("#Pathway").selectAll("svg > *").remove()
                    drawBasicBackground()

                    //Draw the new pathway
                    drawPathway(masterArray, pathwayType, selectedPathway, TFPresent)
                 })
                
         //A function that inputs all the values for potentially viewed vis
        function getAllPathwayOptions(masterArray)
        {
            //Temporary array used to hold the different pathways
            let arr = []

            for(var i = 0; i < masterArray.length; i++)
            {
                masterArray[i]["pathway"].forEach(function(element)
                                                  {
                                                    if(!(arr.includes(element)))
                                                    {
                                                        arr.push(element)
                                                    }
                                                  })
            }
                return arr;
        }

        function drawBasicBackground()
        {

            //Radio button creating
            var labels= ["Protein-Protein", "Protein-Molecule-Protein"] //A set of labels for the buttons. All other layouts should be pused onto this list!
            var TFlabel = ["Toggle Transcription Factors"]
            var layoutType = ["Protein-Protein", "Protein-Molecule-Protein"] //The layouts that are applicable. Variable to store names as strings for id attribute creation
            var rbWidth = 210 //button width
            var rbHeight = 30 //button height
            var rbSpace = 30 //space between buttons
            var x0 = 20 //x offset
            var y0 = 10 //y offset

            var x0TF = 500 //x offset for the TF radio button
            var y0TF = 10 //y offset for the TF radio button

            //Background for the svg
            d3.select("#Pathway")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 4000)
                .attr("height", 2000)
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("fill", "black")

            //Radio buttons
            //Create the listed buttons to view the following: protein-protein ; protein-molecule-protein
            //Inspiration and coding help came from this source: http://www.nikhil-nathwani.com/blog/posts/radio/radio.html
            var radioButtons = d3.select("#Pathway")
                                 .append("g")
                                 .attr("id", "radioButtons") 

            //Create the group of rectangles and text that will compose these buttons
            var radioButtonGroups = radioButtons.selectAll("g.button")
                                               .data(labels)
                                               .enter()
                                               .append("g")
                                               .attr("class", "button")
                                               .style("cursor", "pointer")
                                               .on("click", function(d)
                                                  {
                                                    //Update type of pathway we want to draw
                                                    pathwayType = d3.select(this).text()
                                                    console.log(pathwayType) 
                                                    
                                                    //Get rid of the existing pathway and redraw everything that is basically there
                                                    d3.select("#Pathway").selectAll("svg > *").remove()
                                                    drawBasicBackground()
                                                    updateRadioButtons(d3.select(this), d3.select(this.parentNode))
                                                    
                                                    //Draw the new pathway
                                                    drawPathway(masterArray, pathwayType, selectedPathway, TFPresent)
                                                  })

            //adding a rect to each button group
            radioButtonGroups.append("rect")
                             .attr("class", "buttonRect")
                             .attr("id", function(d, i)
                                  {
                                     //console.log(layoutType[i])
                                     //console.log(i)
                                     return layoutType[i];
                                  })
                             .attr("width", rbWidth)
                             .attr("height", rbHeight)
                             .attr("x",function(d,i) 
                                 {
                                     return x0 + (rbWidth + rbSpace) * i;
                                 })
                             .attr("y", y0)
                             .attr("rx", 5) //Give nice rounded corners
                             .attr("ry", 5) //Give nice rounded corners
                             .attr("stroke", function(d){if(pathwayType === this.id){return "white"}else{return "black"}})
                             .attr("fill", function(d){if(pathwayType === this.id){return "blue"}else{return "red"}})

            //adding text to each button group, centered within the button rect
            radioButtonGroups.append("text")
                             .attr("class", "buttonText")
                             .attr("x",function(d, i) 
                                  {
                                    return x0 + (rbWidth + rbSpace) * i + rbWidth / 2;
                                  })
                             .attr("y", y0 + (rbHeight / 2))
                             .attr("text-anchor", "middle")
                             .attr("dominant-baseline", "central")
                             .attr("fill", "white")
                             .text(function(d) {return d})


            //Now, a radio button to disable and enable the transcription factors
                        //Radio buttons
            //Create the listed buttons to view the following: protein-protein ; protein-molecule-protein
            //Inspiration and coding help came from this source: http://www.nikhil-nathwani.com/blog/posts/radio/radio.html
            var radioButtonsTF = d3.select("#Pathway")
                                 .append("g")
                                 .attr("id", "radioButtonTF") 

            //Create the group of rectangles and text that will compose these buttons
            var radioButtonTFGroups = radioButtonsTF.selectAll("g.button")
                                               .data(TFlabel)
                                               .enter()
                                               .append("g")
                                               .attr("class", "button")
                                               .style("cursor", "pointer")
                                               .on("click", function(d)
                                                  {
                                                    //Update type of pathway we want to draw
                                                    if(TFPresent === false)
                                                    {
                                                        TFPresent = true
                                                    }
                                                    else
                                                    {
                                                        TFPresent = false
                                                    }
                                                    console.log(TFPresent) 
                                                    
                                                    //Get rid of the existing pathway and redraw everything that is basically there
                                                    d3.select("#Pathway").selectAll("svg > *").remove()
                                                    drawBasicBackground()
                                                    //updateRadioButtons(d3.select(this), d3.select(this.parentNode))
                                                    
                                                    //Draw the new pathway
                                                    drawPathway(masterArray, pathwayType, selectedPathway, TFPresent)
                                                  })

            //adding a rect to each button group
            radioButtonTFGroups.append("rect")
                               .attr("class", "buttonRect")
                               .attr("id", function(d, i)
                                    {
                                       //console.log(layoutType[i])
                                       //console.log(i)
                                       return TFlabel[0];
                                    })
                               .attr("width", rbWidth)
                               .attr("height", rbHeight)
                               .attr("x",function(d,i) 
                                   {
                                       return x0TF + (rbWidth + rbSpace) * i;
                                   })
                               .attr("y", y0TF)
                               .attr("rx", 5) //Give nice rounded corners
                               .attr("ry", 5) //Give nice rounded corners
                               .attr("stroke", function(d){if(TFPresent === true){return "white"}else{return "black"}})
                               .attr("fill", function(d){if(TFPresent === true){return "blue"}else{return "red"}})

            //adding text to each button group, centered within the button rect
            radioButtonTFGroups.append("text")
                               .attr("class", "TFbuttonText")
                               .attr("x",function(d, i) 
                                    {
                                      return x0TF + (rbWidth + rbSpace) * i + rbWidth / 2;
                                    })
                              .attr("y", y0TF + (rbHeight / 2))
                              .attr("text-anchor", "middle")
                              .attr("dominant-baseline", "central")
                              .attr("fill", "white")
                              .text(function(d) {return d})


            //A function to all the radio buttons to update color for the selected radio button 
            //and to inform which model of the pathway should be shown
            function updateRadioButtons(button, parent)
            {
                parent.selectAll("rect")
                      .attr("fill", "red")
                      .attr("stroke", "black")
    
                button.select("rect")
                      .attr("fill", "blue")
                      .attr("stroke", "white")    
            }



            /*d3.select("#Pathway")
                             .append("g")
                             .attr("id", "dropdown menu")
                             .append("option")
                             .data(pathwayDropDownValues)
                             .enter()
                             .attr("value", function(d){return d;})
                             .text(function(d){return d;})
              /*.append("select")
              .selectAll("option")
              .data(pathwayDropDownValues)
              .enter()
              .append('option')
              .style("left", "10px")
              .style("top", "5px")
              .text(function (d) {return d;})
              .attr("value", function (d) {return d;}) */
              //.on("change", updatePathwayLayout(masterArray, d3.select(this).attr("value")))
      
        }

        //Actually making the pathway
        //Always start with Glycolysis
        drawPathway(masterArray, pathwayType, selectedPathway, TFPresent)

        function drawPathway(masterArray, pathwayType, selectedPathway, TFPresent)
        {
            //Call functions that assign links and nodes specific to the pathway selected
            //console.log(selectedPathway)
            var nodesP = assignNodes(masterArray, pathwayType, selectedPathway, TFPresent)
            var linksP = assignLinks(masterArray, nodesP, selectedPathway, TFPresent)
            console.log(nodesP)
            console.log(linksP)

            if(linksP[0] === "NOTHING")
            {
                linksP.pop()
                
                var pathwayObject = 
                {
                    source: 0,
                    target: 0
                }

                linksP.push(pathwayObject)
            }

            //Create the pathway force-directed network
            var width = Number(d3.select("#Pathway").style("width").replace(/px$/, '')) + 50
            var height = Number(d3.select("#Pathway").style("height").replace(/px$/, ''))

        //These will the the heirarchical classes which contain the nodes and links 
        //AND will have different attributes associated with them in the overall svg here
        //Much of this heirarchal code is from this user and post on observable - thank you for your help and direction: https://observablehq.com/@brunolaranjeira/d3-v6-force-directed-graph-with-directional-straight-arrow
        const links = linksP
        const nodes = nodesP
      
        //This is the simulation itself that is a force directed network (tick function called later after initializing all
        //the links and nodes attributes specific to this svg)
        const simulation = d3.forceSimulation(nodes)
              .force("link", d3.forceLink(links).id(function(d){return d.index}).distance(70))
              .force("charge", d3.forceManyBody().strength(function(d){if(pathwayType === "Protein-Protein"){return -1700}else{return -1300}}))
              .force("center", d3.forceCenter(width / 2, (height / 2) + 100))
              .force("x", d3.forceX())
              .force("y", d3.forceY())
              .force('collide', d3.forceCollide().radius(function(d){return d.radius}))
      
        //Here redefines the svg so the simulation can be placed into it and I don't have to keep calling the select function
        const svg = d3.select("#Pathway")
                      //.attr("viewBox", [-width / 2, -height / 2, width, height])

        //Begin with updating and specifying the various link attributes for each link that is contained in the
        //the links "constant class"
        const link = svg.append("g")
                        .attr("fill", "none")   
                        .attr("stroke-width", 1.5)  //These two specific that a link has no fill and a stroke width, get more specific in the latter half
                        .selectAll("path")
                        .data(links)
                        .join("path")
                        .attr("stroke", "white")//function(d){if(d.interaction === undefined || d.interaction.indexOf("and") !== -1){d.interaction = "Multiple (hover over proteins)"; return colorLegend(d.interaction)}else{return colorLegend(d.interaction)}}) //Now, we select all paths as before but link it to the updatedLinks data stored in links - all black stroke lines

        //Updated and specify the various attributes associated with each node that is a subset of the whole nodes class
        //Here I am just defining the basic attibutes for the nodes similarly to how it was done in the links above 
        var node = svg.append("g")
                        .attr("fill", "white") //Append to the avg as basic background white color
                        .attr("stroke-linecap", "round")
                        .attr("stroke-linejoin", "round") //Some cool styles that denote how the links and nodes should be joined together!
                        .selectAll("g")
                        .data(nodes)
                        .join("g")  //Here, now we join the node constant to all updatedNodes contained in nodes "constant class" - purposely left open ended for spacing so it is easier to read and understand but also to make additions!
                    
                    node.append("text")
                        .attr("x", 30)
                        .attr("y", "0.31em")
                        .text(function(d){return d.actualName})
                        .clone(true).lower()
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 3) //Here now on the same svg we can append both the circle nodes and text to them. The positions for that are given (exact x and y taken from observable link above since it looks nice but can easily change if need be)                
                 
                    node.append("circle")
                        .attr("stroke", "white")//(d){if(d.name === proteinInterest){return "white"}else{if(d.interaction === undefined || d.interaction.indexOf("and") !== -1){d.interaction = "Multiple (hover over proteins)"; return colorLegend(d.interaction)}else{return colorLegend(d.interaction)}}})
                        .attr("stroke-width", 1.5)
                        .attr("r", function(d){return d.radius})
                        .attr('fill', function(d){return d.color})
                        .attr("id", function(d){return d.actualName})//function(d){if(d.name === proteinInterest){return "green"}else{return "black"}}) //Now specifying the different attribtues that are important for each node to be a circle visible on the svg!
                  
        //Set global variable to send around 
        allNodes = setNodes(node)
        
        //A little sneaky tooltip for ya!
        node.append("rect")
            .attr("id", "tooltip")
            .attr("x", -5)
            .attr("y", -5)
            .attr("width", 1)
            .attr("height", 1)
            .attr("fill", "white")
            .attr("stroke", "black")
            .style("position", "absolute") // the absolute position is necessary so that we can manually define its position later
            .style("visibility", "hidden") // hide it from default at the start so it only appears on hover    
        
        node.append("text")
            .attr("id", "tooltipText1")
            .attr("x", 5) 
            .attr("y", 15)
            .attr('fill', 'black')
            .attr('stroke', 'bold')
            .attr('font-size', 12.5)
            .style("position", "absolute") // the absolute position is necessary so that we can manually define its position later
            .style("visibility", "hidden") // hide it from default at the start so it only appears on hover   
            .text(function(d){if(d.label.includes("#Pr")){return "Gene Name: " + d.actualName;}else if(d.label.includes("#Mo")){return "Molecule Name: " + d.actualName;}else{return "Transcription Factor: " + d.actualName;}})
                    
        node.append("text")
            .attr("id", "tooltipText2")
            .attr("x", 5) 
            .attr("y", 30)
            .attr('fill', 'black')
            .attr('stroke', 'bold')
            .attr('font-size', 12.5)
            .style("position", "absolute") // the absolute position is necessary so that we can manually define its position later
            .style("visibility", "hidden") // hide it from default at the start so it only appears on hover   
            .text(function(d){if(d.label.includes("#Pr")){return "Protein Name: " + d.id;}else if(d.label.includes("#Mo")){return "";}else{return "Typical Regulation Impact: " + d.regulation;}})
            
                    
                    //Draw PPI 
                    node.on("click", function(event, d)
                    {
                        //console.log(d3.select(this).select("circle"))
                        //console.log(d3.select(this).select("#tooltip"))
                        //console.log(d.name)
                        //console.log(String(this.id))
                        //console.log(this.name)
                        if(d.label.includes("#Pr"))
                        {
                            createPPI(d.actualName, d.name, masterArray)
                        }
                        else if(d.label.includes("#TF"))
                        {
                            alert("Transcription factors do not have a PPI Network")
                        }
                        else
                        {
                            alert("Molecules do not have a PPI Network")
                        }

                    })

                    node.on("mouseover", function()
                        {
                            d3.select(this)
                              .select("#tooltip")
                              .attr("width", 450)
                              .attr("height", 50)
                              .style("visibility", "visible")
                            
                            d3.select(this).raise()

                            //Make the text invisible
                            d3.select(this)
                              .select("#tooltipText1")
                              .style("visibility", "visible")
                              .raise()

                            d3.select(this)
                              .select("#tooltipText2")
                              .style("visibility", "visible")
                              .raise()
                        })
                        .on("mouseout", function()
                        {
                            d3.select(this)
                              .select("#tooltip")
                              .attr("width", 1)
                              .attr("height", 1)
                              .style("visibility", "hidden")

                            //Make the text invisible
                            d3.select(this)
                              .select("#tooltipText1")
                              .style("visibility", "hidden")

                            d3.select(this)
                              .select("#tooltipText2")
                              .style("visibility", "hidden")

                              d3.select(this).lower()
                        })


        //Now, to keep the network well updated and better looking than ever before by adding a call to linkArc (which makes the lines straigther n the viewbox) and
        //a call to a transfrom attribute of the nodes that will properly display the text alongside and with the circle nodes as it moves
        simulation.on("tick", function(d)
                              {
                                  link.attr("d", function(d){return (`M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`)})
                                  node.attr("transform", function(d){return (`translate(${d.x},${d.y})`)})
                              })

            //Create the list of nodes that fit the pathway typein question 
            function assignNodes(masterArray, pathwayType, selectedPathway, TFPresent)
            {                
                //Here is a temporary array to hold the nodes for the pathway
                let arr = []

                //Determine which layout organization to proceed with: protein-protein vs protein-molecule-protein
                if(pathwayType === "Protein-Protein")
                {
                    //Go through all the proteins
                    for(var i = 0; i < masterArray.length; i++)
                    {
                        //console.log(masterArray[i]["pathway"])
                        if(masterArray[i]["pathway"].includes(selectedPathway))
                        {
                            //console.log(masterArray[i]["pathway"])
                            var pathwayObject = 
                            {
                                name: masterArray[i]["name"],
                                actualName: masterArray[i]["actualName"],
                                id: masterArray[i]["id"],
                                label: "#Pr" + masterArray[i]["name"],
                                radius: 20,
                                color: "white"
                            }
        
                            arr.push(pathwayObject)
                        }
                    }

                    //Then connect to all pathways - WIP!!!
                    /*for(var j = 0; j < masterArray.length; j++)
                    {
                        if(masterArray[j]["pathway"].includes(selectedPathway) && (masterArray[j]["pathwayConnection"] !== undefined) && !(arr.includes(masterArray[j]["Other Pathways Connected To"])))
                        {
                            console.log(masterArray[j]["pathwayConnection"])

                            var pathwayObject = 
                            {
                                name: masterArray[j]["Other Pathways Connected To"],
                                label: "#Pa" + masterArray[j]["Other Pathways Connected To"],
                                width: 40,
                                height: 20                            
                            }

                            arr.push(pathwayObject)
                        }

                        
                        /*masterArray[j]["Other Pathways Connected To"].forEach(function(element)
                                                                              {
                                                                                  if(!(arr.includes(element)) && (element !== ""))
                                                                                  {
                                                                                        console.log(element)
                                                                                        arr.push(element)
                                                                                  }
                                                                               })
                    }*/
                }
                else if(pathwayType === "Protein-Molecule-Protein")
                {                        
                    //Temp array to hold what molecules have been added
                    var addedMolecules = []

                    //Go through all the proteins and molecules
                    for(var i = 0; i < masterArray.length; i++)
                    {                            
                        //console.log(masterArray[i]["pathway"])
                        if(masterArray[i]["pathway"].includes(selectedPathway))
                        {
                            //console.log(masterArray[i]["pathway"])
                            //Here is the protein entry
                            var pathwayObject = 
                            {
                                name: masterArray[i]["name"],
                                actualName: masterArray[i]["actualName"],
                                id: masterArray[i]["id"],
                                label: "#Pr" + masterArray[i]["name"],
                                radius: 20,
                                color: "white"
                            }
        
                            arr.push(pathwayObject)

                            //Here is the molecule(s) entry
                            masterArray[i]["molecules"].forEach(function(element)
                                                                {
                                                                    
                                                                    if(!(addedMolecules.includes(element)) && (element !== ""))
                                                                    {
                                                                        //console.log(element)
                                                                        var moleculeObject = 
                                                                        {
                                                                            name: element,
                                                                            actualName: element,
                                                                            label: "#Mo" + element,
                                                                            radius: 15,
                                                                            color: "gold"
                                                                        }
                                                                    
                                                                        addedMolecules.push(element)
                                                                        arr.push(moleculeObject)
                                                                    }

                                                                })
                        }
                    }
                }

                //Now add the TF if present
                if((TFPresent === true))
                {
                    //Temp array to hold what TF have been added
                    var addedTF = []

                    //Go through all the proteins and molecules
                    for(var i = 0; i < masterArray.length; i++)
                    {                            
                        //console.log(masterArray[i]["pathway"])
                        if(masterArray[i]["pathway"].includes(selectedPathway))
                        {
                            //Here is the molecule(s) entry
                            masterArray[i]["TF"].forEach(function(element)
                                                                {
                                                                    
                                                                    if(!(addedTF.includes(element)) && (element !== ""))
                                                                    {
                                                                        console.log(element)
                                                                        var moleculeObject = 
                                                                        {
                                                                            name: element,
                                                                            actualName: element,
                                                                            regulation: getRegulation(masterArray[i]["regulation"], masterArray[i]["TF"].indexOf(element)),
                                                                            label: "#TF" + element,
                                                                            radius: 15,
                                                                            color: "purple"
                                                                        }
                                                                    
                                                                        addedTF.push(element)
                                                                        arr.push(moleculeObject)
                                                                    }

                                                                })
                        }
                    } 
                }

                //get Regulation type (up or down from Systems Bio Mtb Databases)
                function getRegulation(regulationElements, indexNumber)
                {
                    console.log(regulationElements[indexNumber])

                    if(regulationElements[indexNumber] === "1")
                    {
                        return "Upregulates"
                    }
                    else
                    {
                        return "Downregulates"
                    }
                }

                //console.log(addedMolecules)
                console.log(addedTF)
                addedMolecules = []
                addedTF = []
                return arr;
            }

            function assignLinks(masterArray, nodesP, selectedPathway, TFPresent)
            {
                //Temporary arrays
                //  - The first will hold source and target objects of the final map 
                //  - The second will hold the last index between commas for slicing to ensure protein names are added properly to the final links array
                let arr = []
                //let lastIndex = 0
          
                if(pathwayType === "Protein-Protein")
                {
                    for(var i = 0; i < masterArray.length; i++)
                    {
                        if(masterArray[i]["pathway"].includes(selectedPathway))
                        {
                            //let str = masterArray[i]["connections"]
                            //console.log(masterArray[i]["connections"][0] == "")
                            if(masterArray[i]["connections"][0] === "")
                            {
                                var pathwayObject = 
                                {
                                    source: 0,
                                    target: 0
                                }

                                arr.push(pathwayObject)
                            }
                            else
                            {
                            masterArray[i]["connections"].forEach(function(protein)
                                                                {
                                                                        var pathwayObject = 
                                                                        {
                                                                            source: nodesP.findIndex(object => {return object.name === protein}),
                                                                            target: nodesP.findIndex(object => {return object.name === masterArray[i]["name"]})
                                                                        }

                                                                        arr.push(pathwayObject)
                                                                })
                            }
                            /*switch(str.length)
                            {
                                case 0:
                                    //console.log("HERE AT 0")
                                    arr.push("NOTHING")
                                    break;

                                case 1:
                                    var pathwayObject = 
                                    {
                                        source: nodesP.findIndex(object => {return object.name === masterArray[i]["name"]}),
                                        target: nodesP.findIndex(object => {return object.name === str})
                                    }
                                    arr.push(pathwayObject)
                                    break;

                                default:
                                    //console.log("Default")
                                    for(var j = 0; j <= str.length; j++)
                                    {
                                        if(str[j] === ',' || j === str.length)
                                        {
                                            //Now separate the string from the last knonw index to the column
                                            let separateString = str.slice(lastIndex, j)
                                            //console.log(separateString)

                                            //Add it to the array and up the previous index to the next index after the comma
                                            var pathwayObject = 
                                            {
                                                source: nodesP.findIndex(object => {return object.name === masterArray[i]["name"]}),
                                                target: nodesP.findIndex(object => {return object.name === separateString})
                                            }
                                            lastIndex = j + 1

                                            arr.push(pathwayObject)
                                        }
                                    }
                                    //Need to reset last index for next iteration
                                    lastIndex = 0
                    
                            }*/
                        }
                    }
                }
                else if(pathwayType === "Protein-Molecule-Protein")
                {
                    for(var i = 0; i < masterArray.length; i++)
                    {
                        if(masterArray[i]["pathway"].includes(selectedPathway))
                        {
                            //Need to link together the molecules to their respective proteins in this case
                            masterArray[i]["molecules"].forEach(function(molecule)
                                                                {
                                                                    var pathwayObject = 
                                                                    {
                                                                        source: nodesP.findIndex(object => {return object.name === molecule}),
                                                                        target: nodesP.findIndex(object => {return object.name === masterArray[i]["name"]})
                                                                    }
                                                                    arr.push(pathwayObject)
                                                                })
                            //console.log(masterArray[i] + '\n' + str)

                            /*switch(str.length)
                            {
                                case 0:
                                    //console.log("HERE AT 0")
                                    arr.push("NOTHING")
                                    break;

                                case 1:
                                    var pathwayObject = 
                                    {
                                        source: nodesP.findIndex(object => {return object.name === masterArray[i]["name"]}),
                                        target: nodesP.findIndex(object => {return object.name === str})
                                    }
                                    arr.push(pathwayObject)
                                    break;

                                default:
                                    //console.log("Default")
                                    for(var j = 0; j <= str.length; j++)
                                    {
                                        if(str[j] === ',' || j === str.length)
                                        {
                                            //Now separate the string from the last knonw index to the column
                                            let separateString = str.slice(lastIndex, j)
                                            //console.log(separateString)

                                            //Add it to the array and up the previous index to the next index after the comma
                                            var pathwayObject = 
                                            {
                                                source: nodesP.findIndex(object => {return object.name === masterArray[i]["name"]}),
                                                target: nodesP.findIndex(object => {return object.name === separateString})
                                            }
                                            lastIndex = j + 1

                                            arr.push(pathwayObject)
                                        }
                                    }
                                    //Need to reset last index for next iteration
                                    lastIndex = 0
                    
                            }*/
                        }
                    }
                }

                //Now add the TF links if present
                if((TFPresent === true))
                {
                    //Go through all the proteins and molecules
                    for(var i = 0; i < masterArray.length; i++)
                    {                            
                        if(masterArray[i]["pathway"].includes(selectedPathway) && !(masterArray[i]["TF"][0] === ""))
                        {
                            //Need to link together the molecules to their respective proteins in this case
                            //console.log(masterArray[i]["TF"])
                            //console.log(masterArray[i]["TF"].length)
                            masterArray[i]["TF"].forEach(function(TF)
                                                                {
                                                                    var pathwayObject = 
                                                                    {
                                                                        source: nodesP.findIndex(object => {return object.name === TF}),
                                                                        target: nodesP.findIndex(object => {return object.name === masterArray[i]["name"]})
                                                                    }
                                                                    console.log(pathwayObject)
                                                                    arr.push(pathwayObject)
                                                                })
                        }
                    }
                }
                return arr;
            }
        }
    }

    /*
        Make the greater regulation input list portion here with the background and then the mechanism to upload 
        in a file of choice (csv) with the protein name (Rv version) and the fold change

        This is done using express!
    */
    //Background is blue
    function makeRegulationListBackground()
    {
       
        d3.select("#Regulation")
        .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 1400)
          .attr("height", 1300)
          .attr("stroke", "blue")
          .attr("fill", "blue")
  
    }

    //Actual file upload
    function makeRegulationList(masterArray)
    {
        makeRegulationListBackground()
        
        //Variables and express notes
        /*const express = require("express");
        const fileUpload = require("express-fileupload");

        app = express();
        ap*/

    }

    /*
        This function makes the base background the svg is drawn on top off 
        Also makes a legend which are kept constant in the overall scheme regardless of how much the PPI will change
    */
    function makePPIBase(masterArray)
    {
        d3.select("#PPI")
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 1600)
          .attr("height", 1300)
          .attr("stroke", "pink")
          .attr("fill", "pink")

        //Here is a makeshift title that will be replaced eventually as the PPI keeps getting updated
        d3.select("#PPI")
        .append("text")
        .attr("id", "PPI-Title-Sample")
        .attr("x", "310") 
        .attr("y", "50")
        .attr("fill", "black")
        .attr("stroke", "bold")
        .attr("font-size", 30)
        //.style("text-anchor", "middle")
        .text("Protein-Protein Interaction Network")
    }

    //Here, we will actually contrusct the PPI
    function createPPI(namingProtein, proteinInterest, masterArray)
    {
        //Remove any existing items and create a new base
        d3.select("#PPI").selectAll("svg > *").remove()
        makePPIBase(masterArray)

        console.log(masterArray)

        //Here is the title, right at the top like you would expect but with the protein name changing everytime a new one is selected
        //First remove the existing, standard title
        d3.select("#PPI-Title-Sample").remove()

        //Add the new fancy title
        d3.select("#PPI")
          .append("text")
          .attr("id", "PPI Title")
          .attr("x", "245") 
          .attr("y", "50")
          .attr("fill", "black")
          .attr("stroke", "bold")
          .attr("font-size", 30)
          //.attr("text-anchor", "middle")
          .text(`Protein-Protein Interaction Network of ${namingProtein}`)

        //Add the legend and color coordination
        //First sort through every possible combination and add to a list besides the proteins with multiple 
        //Those with multiple will have a separate legend icon called "Multiple interactions" noted and you can identify by a tooltip hovering over the respective node
        var interactionTypes = []
        
        for(var i = 0; i < masterArray.length; i++)
        {
            masterArray[i]["PPIInteraction"].forEach(function(element)
                                                    {
                                                        if(!(interactionTypes.includes(element)) && !(element.includes("and")) && (element !== ""))
                                                        {
                                                            interactionTypes.push(element)
                                                        }
                                                        else if(element.includes("and"))
                                                        {
                                                            //Now add any with and so each element is enumerated
                                                            let tempArray = []
                                                            tempArray = element.split(" and ")
                                                            //console.log(tempArray)

                                                            tempArray.forEach(function(element)
                                                                              {
                                                                                    if(!(interactionTypes.includes(element)) && (element !== ""))
                                                                                    {
                                                                                        interactionTypes.push(element)
                                                                                    }                                                                                    
                                                                              })
                                                        }
                                                    })
        }

        //Add a multiple option automatically so that users know that they exist and to hover over with a tooltip
        interactionTypes.push("Multiple (hover over proteins)")
        console.log(interactionTypes)

        //Now create the legend by drawing a bunch of boxes and a text associated with that box in question
        const colorLegend = d3.scaleOrdinal(interactionTypes, d3.schemeCategory10)
        //console.log(colorLegend)
        
        d3.select("#PPI")
          .selectAll("interactionColorSquares")
          .data(interactionTypes)
          .enter()
          .append("rect")
          .attr("x", 75)
          .attr("y", function(d,i){return 100 + i * (25)}) 
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", function(d){return colorLegend(d)})

        d3.select("#PPI")
          .selectAll("interactionLabels")
          .data(interactionTypes)
          .enter()
          .append("text")
          .attr("x", 100 + (20 * 1.2))
          .attr("y", function(d,i){return 100 + i*(25) + (25 / 2)})
          .style("fill", function(d){return colorLegend(d)})
          .text(function(d){return d})
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")

        var width = Number(d3.select("#PPI").style("width").replace(/px$/, ''))
        var height = Number(d3.select("#PPI").style("height").replace(/px$/, ''))
        var updatedLinks = []
        var updatedNodes = []

        //Organize the data into a dictionary
        //Select proper PPI of interest by going through the masterArray and finding the right protein to make the nodes and links array
        let breakLoop = true; //Will tell when to end the loop when the protein is found
        var i = 0;  //Variable to serve as a counter as it iterates

        while(breakLoop)
        {
            if(masterArray[i]["name"] === proteinInterest)
            {
                //Add all the nodes
                createUpdatedNodes(masterArray[i])

                //Add all the links
                createUpdatedLinks(masterArray[i])

                //Break the loop here
                breakLoop = false;

                function createUpdatedNodes(protein)
                {
                    //Counter variable
                    let i = 0

                    //First, add all the other proteins that it interacts with
                    protein["PPINetwork"].forEach(function(element)
                                                {
                                                    updatedNodes.push({name: element, radius: 20, interaction: protein["PPIInteraction"][i], legendLabel: ""})
                                                    i++
                                                })   

                    //Then, add the protein that we like to look at
                    updatedNodes.push({name: protein["actualName"], radius: 20, interaction: "None on self", legendLabel: ""})
                }

                function createUpdatedLinks(protein)
                {
                    //Counter variable
                    let i = 0

                    //Add the connection to the first node (protein of interest) to the rest of them
                    updatedNodes.forEach(function(element)
                                        {
                                            //console.log({source: (updatedNodes.length - 1), target: updatedNodes.indexOf(element), interaction: protein["PPIInteraction"][i]})
                                            //console.log(protein)
                                            updatedLinks.push({source: (updatedNodes.length - 1), target: updatedNodes.indexOf(element), interaction: protein["PPIInteraction"][i]})
                                            i++
                                        })
                }
            }

            i += 1
        }


        console.log(updatedLinks)
        console.log(updatedNodes)

        //These will the the heirarchical classes which contain the nodes and links 
        //AND will have different attributes associated with them in the overall svg here
        //Much of this heirarchal code is from this user and post on observable - thank you for your help and direction: https://observablehq.com/@brunolaranjeira/d3-v6-force-directed-graph-with-directional-straight-arrow
        const links = updatedLinks
        const nodes = updatedNodes
      
        //This is the simulation itself that is a force directed network (tick function called later after initializing all
        //the links and nodes attributes specific to this svg)
        const simulation = d3.forceSimulation(nodes)
              .force("link", d3.forceLink(links).id(function(d){return d.index}).distance(325))
              .force("charge", d3.forceManyBody().strength(-2200))
              .force("center", d3.forceCenter((width / 2) - 50, (height / 2) + 125))
              .force("x", d3.forceX())
              .force("y", d3.forceY())
              .force('collide', d3.forceCollide().radius(function(d){return d.radius}))
      
        //Here redefines the svg so the simulation can be placed into it and I don't have to keep calling the select function
        const svg = d3.select("#PPI")
                      //.attr("viewBox", [-width / 2, -height / 2, width, height])

        //Begin with updating and specifying the various link attributes for each link that is contained in the
        //the links "constant class"
        const link = svg.append("g")
                        .attr("fill", "none")   
                        .attr("stroke-width", 1.5)  //These two specific that a link has no fill and a stroke width, get more specific in the latter half
                        .selectAll("path")
                        .data(links)
                        .join("path")
                        .attr("stroke", function(d){if(d.interaction === undefined || d.interaction.indexOf("and") !== -1){console.log(d.interaction); d.legendLabel = "Multiple (hover over proteins)"; return colorLegend(d.legendLabel)}else{return colorLegend(d.interaction)}}) //Now, we select all paths as before but link it to the updatedLinks data stored in links - all black stroke lines

        //Updated and specify the various attributes associated with each node that is a subset of the whole nodes class
        //Here I am just defining the basic attibutes for the nodes similarly to how it was done in the links above 
        const node = svg.append("g")
                        .attr("fill", "white") //Append to the avg as basic background white color
                        .attr("stroke-linecap", "round")
                        .attr("stroke-linejoin", "round") //Some cool styles that denote how the links and nodes should be joined together!
                        .selectAll("g")
                        .data(nodes)
                        .join("g")  //Here, now we join the node constant to all updatedNodes contained in nodes "constant class" - purposely left open ended for spacing so it is easier to read and understand but also to make additions!
                
                    node.append("circle")
                        .attr("stroke", function(d){if(d.name === proteinInterest){return "white"}else{if(d.interaction === undefined || d.interaction.indexOf("and") !== -1){d.legendLabel = "Multiple (hover over proteins)"; return colorLegend(d.legendLabel)}else{return colorLegend(d.interaction)}}})
                        .attr("stroke-width", 1.5)
                        .attr("r", function(d){return d.radius})
                        .attr('fill', function(d){if(d.name === namingProtein){return "green"}else{return "black"}}) //Now specifying the different attribtues that are important for each node to be a circle visible on the svg!
                  
                    node.append("text")
                        .attr("x", 30)
                        .attr("y", "0.31em")
                        .text(function(d){return d.name})
                        .clone(true).lower()
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 3) //Here now on the same svg we can append both the circle nodes and text to them. The positions for that are given (exact x and y taken from observable link above since it looks nice but can easily change if need be)                
        
        //A little sneaky tooltip for ya!
                    node.append("rect")
                        .attr("id", "tooltipSquare")
                        .attr("x", -5)
                        .attr("y", -5)
                        .attr("width", 1)
                        .attr("height", 1)
                        .attr("fill", "white")
                        .attr("stroke", "black")
                        .style("position", "absolute") // the absolute position is necessary so that we can manually define its position later
                        .style("visibility", "hidden") // hide it from default at the start so it only appears on hover    
                        
                    node.append("text")
                        .attr("id", "tooltipText1")
                        .attr("x", 5) 
                        .attr("y", 15)
                        .attr('fill', 'black')
                        .attr('stroke', 'bold')
                        .attr('font-size', 12.5)
                        .style("position", "absolute") // the absolute position is necessary so that we can manually define its position later
                        .style("visibility", "hidden") // hide it from default at the start so it only appears on hover   
                        .text(function(d){return "Protein: " + d.name})

                    //Mike Bostock already had such a nice function that I am using it here. Credits to him for his work in writing the function used 
                    //in the ".text" portion of this node. Bl.ocks: https://bl.ocks.org/mbostock/7555321
                    node.append("text")
                        .attr("id", "tooltipText2")
                        .attr("x", 5) 
                        .attr("y", 30)
                        .attr('fill', 'black')
                        .attr('stroke', 'bold')
                        .attr('font-size', 12.5)
                        .style("position", "absolute") // the absolute position is necessary so that we can manually define its position later
                        .style("visibility", "hidden") // hide it from default at the start so it only appears on hover   
                        .text(function(d)              // function that splits the array and adds each interaction individually
                            {
                                let tempArray = []
                                let finalOutput = ""
                                tempArray = d.interaction.split(" and ")

                                //If there is just one interaction
                                if(tempArray.length === 1)
                                {
                                    finalOutput = tempArray[0]
                                    return "Interaction: " + finalOutput;
                                }
                                else
                                {
                                    tempArray.forEach(function(element)
                                                      {
                                                          finalOutput = finalOutput + "\n" + element   
                                                      })

                                    var output = new HtmlString.String(finalOutput)
                                    console.log(finalOutput)
                                    console.log(output)
                                    return "Interactions: " + finalOutput
                                }
                                //If there are multiple (more than 1) interaction
                                /*else
                                {
                                    //Create big text sepearted by spaces


                                    wrap(finalOutput)

                                    function wrap(text, width) 
                                    {
                                        text.each(function() {
                                          var text = d3.select(this),
                                              words = text.text().split(/\s+/).reverse(),
                                              word,
                                              line = [],
                                              lineNumber = 0,
                                              lineHeight = 1.1, // ems
                                              y = text.attr("y"),
                                              dy = parseFloat(text.attr("dy")),
                                              tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                                          while (word = words.pop()) 
                                          {
                                            line.push(word);
                                            tspan.text(line.join(" "));
                                            if (tspan.node().getComputedTextLength() > width) 
                                            
                                            {
                                              line.pop();
                                              tspan.text(line.join(" "));
                                              line = [word];
                                              tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                                            }
                                          }
                                        });
                                    }
                                }
                                /*tempArray.forEach(function(element)
                                                  {
                                                     finalOutput = finalOutput + "\n" + element   
                                                  })

                                console.log(finalOutput)*/
                                
                            })   
        
                    node.on("mouseover", function()
                        {
                            //Make the square visible
                            d3.select(this)
                              .select("#tooltipSquare")
                              .attr("width", 250)
                              .attr("height", 80)
                              .style("visibility", "visible")

                            d3.select(this).raise()

                            //Make the text visible
                            d3.select(this)
                              .select("#tooltipText1")
                              .style("visibility", "visible")

                            d3.select(this)
                              .select("#tooltipText2")
                              .style("visibility", "visible")
                        })
                        .on("mouseout", function()
                        {
                            //Make the square invisible
                            d3.select(this)
                              .select("#tooltipSquare")
                              .attr("width", 1)
                              .attr("height", 1)
                              .style("visibility", "hidden")
                            
                            d3.select(this).lower()
                            
                            //Make the text invisible
                            d3.select(this)
                              .select("#tooltipText1")
                              .style("visibility", "hidden")

                            d3.select(this)
                              .select("#tooltipText2")
                              .style("visibility", "hidden")
                        })

        //Now, to keep the network well updated and better looking than ever before by adding a call to linkArc (which makes the lines straigther n the viewbox) and
        //a call to a transfrom attribute of the nodes that will properly display the text alongside and with the circle nodes as it moves
        simulation.on("tick", function(d)
                              {
                                  link.attr("d", function(d){return (`M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`)})
                                  node.attr("transform", function(d){return (`translate(${d.x},${d.y})`)})
                              })
    
        //As mentioned above in the tick addition, this function straightens the lines and makes them look better too!
        //linkArc = d =>`M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`
        
        /*const nodes = updatedNodes;

        var u;
        var simulation = d3.forceSimulation(nodes)
                        .force("charge", d3.forceManyBody().strength(-400))       //Strength of the attraction/repel
                        .force("center", d3.forceCenter(width / 2, height / 2))     //Determines center of the system
                        .force("link", d3.forceLink().links(updatedLinks).distance(100))
                        .force("collision", d3.forceCollide().radius(function(d){return d.radius}))



        simulation.on("tick", ticked)    //Draws the objects

        function ticked()
        {
            /*var u = d3.select("#PPI")
                    .selectAll("circle")
                    .data(nodes)
                    .join("circle")
                    .attr("r", function(d) {return d.radius})
                    .attr("cx", function(d) {return d.x})
                    .attr("cy", function(d) {console.log(d); return d.y})
                    .attr("fill", "green")
                    .attr("stroke", "black")

                u = d3.select("#PPI")
                    //.select(".links")
                    .selectAll("line")
                    .data(updatedLinks)
                    .join("line")
                    .attr("x1", function(d){return d.source.x})
                    .attr("y1", function(d){return d.source.y})
                    .attr("x2", function(d){return d.target.x})
                    .attr("y2", function(d){return d.target.y})
                    .attr("stroke", "black")

                u = d3.select("#PPI")
                    //.append("g")
                    //.select(".nodes")
                    .selectAll("circle")
                    .data(updatedNodes)
                    .join("circle")
                    .attr("cx", function(d){return d.x})
                    .attr("cy", function(d){return d.y})
                    .attr("r", function(d){return d.radius})
                    /*.text(function(d) {return d.name})
                    .attr("x", function(d){return d.x})
                    .attr("y", function(d){return d.y})
                    .attr("dy", function(d){return 10})
                    .attr("font-weight", 30)
                    .style("font-size", "15px")
                    .style("fill", function(d){ if(d.name === proteinInterest){return "green"}else{return "black"}})
                    .attr("id", function(d){return d.name})


            //updateLinks()
            //updateNodes()
        }

        function updateNodes()
        {
            u = d3.select("#PPI")
                //.append("g")
                //.select(".nodes")
                .selectAll("circle")
                .data(updatedNodes)
                .join("circle")
                .attr("cx", function(d){return d.x})
                .attr("cy", function(d){return d.y})
                .attr("r", function(d){return d.radius})
                /*.text(function(d) {return d.name})
                .attr("x", function(d){return d.x})
                .attr("y", function(d){return d.y})
                .attr("dy", function(d){return 10})
                .attr("font-weight", 30)
                .style("font-size", "15px")
                .style("fill", function(d){ if(d.name === proteinInterest){return "green"}else{return "black"}})
                .attr("id", function(d){return d.name})

              u = d3.select("#PPI")
                    //.select(".nodes")
                    .selectAll("text")
                    .data(updatedNodes)
                    .join("text")
                    .text(function(d) {return d.name})
                    .attr("x", function(d){return d.x})
                    .attr("y", function(d){return d.y})
                    .attr("dy", function(d){return 5})
                    .attr("id", function(d){return d.name})
                    .attr("fill", function(d){ if(d.name === proteinInterest){return "green"}else{return "black"}})
                    .style("font-size", "30px")
                    .attr("r", function(d) {return d.radius})
                    .attr("cx", function(d) {return d.x})
                    .attr("cy", function(d) {console.log(d); return d.y})
                    .attr("fill", "green")
                    .attr("stroke", "black")

        }

        function updateLinks()
        {
            u = d3.select("#PPI")
                    //.select(".links")
                    .selectAll("line")
                    .data(updatedLinks)
                    .join("line")
                    .attr("x1", function(d){return d.source.x})
                    .attr("y1", function(d){return d.source.y})
                    .attr("x2", function(d){return d.target.x})
                    .attr("y2", function(d){return d.target.y})
                    .attr("stroke", "black")
        }*/
    }

    return(
        <div className="home">
            <h2 className="text-center">The Pathway Itself!</h2>
            <select id="selectButton" position="absolute"></select>
            <svg id="Pathway" width="2200" height="1800"></svg>
            <svg id="Regulation" width="900" height="1300"></svg>
            <svg id="PPI" width="1100" height="1300"></svg>
            
        </div>
    );
}

export {cleanedAndOrganizedData};
export {allNodes};
export default Home;