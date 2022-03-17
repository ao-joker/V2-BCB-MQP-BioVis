import React, {useEffect} from "react"
import * as d3 from "d3";

const BlueSquareTester = () =>
{

    useEffect(() => 
    {
        d3.select("#Regulation")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 100)
        .attr("height", 100)
        .attr("stroke", "black")
        .attr("fill", "green")
    })

    return (
        <div className = "test">
            <svg id="TESTING" width="900" height="1000"></svg>
        </div>
    )
}


export default BlueSquareTester;