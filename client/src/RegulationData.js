import React, {useEffect} from "react"
import * as d3 from "d3";
import {workingFile} from "./FileUpload"

const RegulationData = () =>
{

    useEffect(() => 
    {
        //Clear the whole svg for a new file being uploaded
        d3.select("#Regulation").selectAll("svg > *").remove()

        //Draw a new background and the tables of the information from that file
        makeRegulationListBackground()

        d3.csv().then(function(data)
                    {
                        drawTables(data)
                    })

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
        function drawTables()
        {
            if(workingFile.filename !== undefined)
            {
                d3.select("#Regulation")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 100)
                .attr("height", 100)
                .attr("stroke", "black")
                .attr("fill", "green")

                d3.select("#Regulation")
                .append("text")
                .attr("x", 200)
                .attr("y", 200)
                .attr("stroke", "black")
                .attr("fill", "green")
                .attr("font-size", 50)
                .text(`${workingFile.filename}`) 
                
                d3.csv()
            }
        }

        function showRegulationChangesInPathway()
        {

        }


    })

    return (
        <div className = "test">
        </div>
    )
}


export default RegulationData;