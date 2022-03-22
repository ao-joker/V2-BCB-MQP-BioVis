import React, {useEffect} from "react"
import * as d3 from "d3";
import {workingFile} from "./FileUpload"
import {cleanedAndOrganizedData as masterData} from "./Home"
import { formatSpecifier } from "d3";

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
            var proteinList = generateProteinsInMasterData()
            var TFList = generateTFInMasterData()

            //console.log(workingFile.filePath)
            d3.csv(workingFile.filePath).then(function(data)
                        {
                            //console.log(masterData)
                            //Variable that defines the columns of the csv, that being simply the protein name ("Rv####") and fold change
                            //Then, other details will be pulled from the existing masterArray dataset
                            var columnsProtein = ["Protein Name", "Pathway", "Regulation Type", "Fold Change"]
                            var columnsTF = ["Transcription Factor", "Pathway", "Regulation Type", "Fold Change"]

                            //Organize the data to match the columns
                            var organizedData = organizeDataForRegList(data, proteinList, TFList)
                            console.log(organizedData)

                            //Draw the tables
                            drawTables(organizedData, columnsProtein, columnsTF)

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

        //Generate the list of the proteins in the masterData
        function generateProteinsInMasterData(data)
        {
            let arr = []

            for(var i = 0; i < data.length; i++)
            {
                arr.push(data[i]["name"])
            }

            return arr;
        }

        //Generate the list of the TF in the masterData
        function generateTFInMasterData(data)
        {
            let arr = []

            for(var i = 0; i < data.length; i++)
            {
                if(data[i]["TF"] !== '')
                {
                    arr.push(data[i]["TF"])
                }
            }

            return arr;
        }

        //Make an array of objects consisting of the column types hardcoded
        function organizeDataForRegList(data, proteinList, TFList)
        {
            //Here is the arrays that will store all the objects as either proteins or trasncription factors
            let arrProtein = []
            let arrTF = []

            //Loop through the whole of the data until all of it has been parsed
            for(var j = 0; j < data.length; j++)
            {   
                let indexNumber = proteinList.indexOf(data[j]["Protein"])

                if(indexNumber !== -1)
                {
                    //If the data calls for a protein, add it as a protein list 
                    var listObject = 
                    {
                        Protein: data[j]["Protein"],
                        Pathway: masterData[indexNumber]["Pathway"],
                        RegulationType: getRegulationType(data[j]["Fold Change"]),
                        FoldChange: data[j]["Fold Change"]
                    }

                    arrProtein.push(listObject)
                }

                //If the data calls for a transcription factor, add it as a TF list
            }
            console.log(arrProtein)
            console.log(arrTF)

            return [arrProtein, arrTF]
        }

        //Determines wether the resulting change is an up or down regulation
        function getRegulationType(foldChange)
        {
            if(foldChange > 0)
            {
                return "Upregulation"
            }
            else
            {
                return "Downregulation"
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

            //Making the Protein table first
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
            
            /*tableBody.selectAll("tr")
                     .data(organizedData)
                     .join("tr")
                     .selectAll("td")
                     .data(function(row){return d3.entries(row)})
                        .join("td")
                        .text(function(d){return d.value});*/
            
            return table;

            //Making the TF table second
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