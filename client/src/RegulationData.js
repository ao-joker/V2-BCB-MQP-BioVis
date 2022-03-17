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

            d3.csv().then(function(data)
                        {
                            //Variable that defines the columns of the csv, that being simply the protein name ("Rv####") and fold change
                            //Then, other details will be pulled from the existing masterArray dataset
                            var columns = ["Trasncription Factor/Protein Name", "Pathway", "Regulation Type", "Fold Change"]
                            drawTables(data, columns)
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

        function drawTables(data, columns)
        {
            d3.select("#Regulation")
                .append("text")
                .attr("x", 200)
                .attr("y", 200)
                .attr("stroke", "black")
                .attr("fill", "green")
                .attr("font-size", 50)
                .text(`${workingFile.filename}`)
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