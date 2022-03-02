import React, {useEffect} from "react"
import * as d3 from "d3";

const BlueSquareTester = () =>
{

    useEffect(() => 
    {
        d3.select("#TESTING")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 4000)
        .attr("height", 2000)
        .attr("stroke", "black")
        .attr("fill", "blue")
    })

    return (
        <div className = "test">
            <svg id="TESTING" width="900" height="1000"></svg>
        </div>
    )
}


export default BlueSquareTester;