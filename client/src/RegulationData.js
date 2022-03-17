import React, {useEffect} from "react"
import * as d3 from "d3";
import {workingFile} from "./FileUpload"

const RegulationData = () =>
{

    useEffect(() => 
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

    })

    return (
        <div className = "test">
        </div>
    )
}


export default RegulationData;