import React, {useEffect} from "react"
import * as d3 from "d3";
import {workingFile} from "./FileUpload"
import {cleanedAndOrganizedData as masterData} from "./Home"

const RegulationData = () =>
{

    useEffect(() => 
    {
        if(workingFile.filename !== undefined)
        {
            //Clear the whole svg for a new file being uploaded
            d3.select("#Regulation").selectAll("svg > *").remove()

            //Draw a new background and the tables of the information from that file
            makeRegulationListBackground()

            //console.log(workingFile.filePath)
            d3.csv(workingFile.filePath).then(function(data)
                        {
                            //console.log(masterData)
                            //Variable that defines the columns of the csv, that being simply the protein name ("Rv####") and fold change
                            //Then, other details will be pulled from the existing masterArray dataset
                            var columns = ["Trasncription Factor/Protein Name", "Pathway", "Regulation Type", "Fold Change"]

                            //Organize the data to match the columns
                            var organizedData = organizeDataForRegList(data, columns)

                            //Draw the tables
                            drawTables(organizedData, columns)

                            //Make adjustments to the pathway in panel A
                            showRegulationChangesInPathway()
                        })
        }

        function makeRegulationListBackground()
        {
            d3.select("#Regulation")
            .append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", 1400)
              .attr("height", 1000)
              .attr("stroke", "blue")
              .attr("fill", "blue")
      
        }

        //Make an array of objects consisting of the column types hardcoded
        function organizeDataForRegList(data, columns)
        {
            //Here is the array that will store all the objects
            let arr = []

            //Loop through the whole of the data until all of it has been parsed
            for(var j = 0; j < data.length; j++)
            {
                listObject = 
            }
        }

        function drawTables(organizedData, columns)
        {
            d3.select("#Regulation")
                .append("text")
                .attr("x", 200)
                .attr("y", 200)
                .attr("stroke", "black")
                .attr("fill", "green")
                .attr("font-size", 50)
                .text(`${workingFile.filename}`)

            //Define the table, and append a header row and the rest of the body
            var table = d3.select("#Regulation")
                          .append('table')

            var tableHeader = table.append('thead')
            var tableBody = table.append('tbody')
            
            //Specifically to the table head, add the columns list that was passed to it
            //Then add the columns as text
            //console.log(data)
            tableHeader.append('tr')
                       .selectAll('th')
                       .data(columns)
                       .enter()
                        .append('th')
                        .text(function(d) {return d;})
            
            tableBody.selectAll("tr")
                     .data(organizedData)
                     .join("tr")
                     .selectAll("td")
                     .data(function(row){return d3.entries(row)})
                        .join("td")
                        .text(function(d){return d.value});
            
            return table;
        }

        function showRegulationChangesInPathway()
        {

        }


    })

    return (
        <div className = "test"></div>
    )
}


export default RegulationData;