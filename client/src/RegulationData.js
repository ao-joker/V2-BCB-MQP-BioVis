import React, {useEffect} from "react"
import * as d3 from "d3";
import {workingFile} from "./FileUpload"
import {cleanedAndOrganizedData as masterData} from "./Home"
import {allNodes as node} from "./Home";
import "./tableStyle.css";

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
            var proteinList = generateProteinsInMasterData(masterData)
            var TFList = generateTFInMasterData(masterData)

            console.log(proteinList)
            console.log(TFList)

            //console.log(workingFile.filePath)
            d3.csv(workingFile.filePath).then(function(data)
                        {
                            //console.log(masterData)
                            //Variable that defines the columns of the csv, that being simply the protein name ("Rv####") and fold change
                            //Then, other details will be pulled from the existing masterArray dataset
                            var columnsProtein = ["Protein", "Pathway", "Branch_Point", "Regulation_Type", "Fold_Change", "P_value"]
                            var columnsTF = ["Transcription_Factor", "Pathway", "Branch_Point", "Regulation_Type", "Fold_Change", "P_value"]

                            //Organize the data to match the columns
                            var organizedData = organizeDataForRegList(data, masterData, proteinList, TFList)
                            console.log(organizedData)

                            //Draw the tables
                            drawTables(organizedData, columnsProtein, columnsTF)

                            //Make adjustments to the pathway in panel A
                            showRegulationChangesInPathway(organizedData)
                        })
        }

        function makeRegulationListBackground()
        {
            //The blue background
            d3.select("#Regulation")
              .append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", 1400)
              .attr("height", 1300)
              .attr("stroke", "blue")
              .attr("stroke-width", 5)
              .attr("fill", "white")

            //The title
            /*d3.select("#Regulation")
            .append("text")
            .attr("id", "RegulationTitle")
            .attr("x", "50") 
            .attr("y", "50")
            .attr("fill", "white")
            .attr("stroke", "bold")
            .attr("font-size", 30)
            //.attr("text-anchor", "middle")
            .text("Regulation Data from" `${workingFile.filename}`)*/
        }

        //Generate the list of the proteins in the masterData
        function generateProteinsInMasterData(data)
        {
            //Temp array
            let arr = []

            //Also, temp holding name variable
            let protein 

            for(var i = 0; i < data.length; i++)
            {
                
                //Check if it has a dash to denote multiple proteins
                //Get rid of it or keep the same depending if it has one
                if(data[i]["name"].includes("-"))
                {
                    protein = data[i]["name"].substring(0, (data[i]["name"].indexOf("-") - 1))
                }
                else
                {
                    protein = data[i]["name"]
                }

                if(!(arr.includes(data[i]["name"])))
                {
                    arr.push(protein)
                }
            }

            return arr;
        }

        //Generate the list of the TF in the masterData
        function generateTFInMasterData(data)
        {
            let arr = []

            for(var i = 0; i < data.length; i++)
            {
                if(data[i]["TF"][0] !== "")
                {
                    data[i]["TF"].forEach(function(element)
                                          {
                                             if(!(arr.includes(element)))
                                             {
                                                arr.push(element)
                                             }
                                          })
                                            
                }
            }

            return arr;
        }

        //Make an array of objects consisting of the column types hardcoded
        function organizeDataForRegList(data, masterData, proteinList, TFList)
        {
            //Here is the arrays that will store all the objects as either proteins or trasncription factors
            let arrProtein = []
            let arrTF = []

            //Loop through the whole of the data until all of it has been parsed
            for(var j = 0; j < data.length; j++)
            {   
                //Check if it is a protein
                let indexNumber1 = proteinList.indexOf(data[j]["Name"])

                if(indexNumber1 !== -1)
                {
                    console.log(masterData[indexNumber1]["pathway"])
                    console.log(masterData[indexNumber1])
                    //If the data calls for a protein, add it as a protein list 
                    var listObject = 
                    {
                        Protein: data[j]["Name"],
                        Pathway: masterData[indexNumber1]["pathway"],
                        Branch_Point: masterData[indexNumber1]["branch"],
                        Regulation_Type: getRegulationType(data[j]["Fold Change"]),
                        Fold_Change: data[j]["Fold Change"],
                        P_value: data[j]["p-value"]
                    }

                    arrProtein.push(listObject)
                }

                //Check if it is a transcription factor
                let indexNumber2 = TFList.indexOf(data[j]["Name"])
                
                if(indexNumber2 !== -1)
                {
                    //If the data calls for a protein, add it as a protein list 
                    var listObject = 
                    {
                        Transcription_Factor: data[j]["Name"],
                        Pathway: "N/A",
                        Branch_Point: "N/A",
                        Regulation_Type: getRegulationType(data[j]["Fold Change"]),
                        Fold_Change: data[j]["Fold Change"],
                        P_value: data[j]["p-value"]
                    }

                    arrTF.push(listObject)
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

        function drawTables(organizedData, columnsProtein, columnsTF)
        {
            //Variables to draw regions for the tables
            var width = 900
            var height = 65 * (organizedData[0].length)
            console.log(width)
            console.log(height)
            
            d3.select("#Regulation")
                .append("text")
                .attr("x", 70)
                .attr("y", 75)
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("font-size", 50)
                .text(function(){return ("Regulation Data from " + `${workingFile.filename}`);})

            //Making the Protein table first
            //Define the table, and append a header row and the rest of the body
            var table = d3.select("#Regulation")
                            .append("foreignObject")
                            .attr("x", 25)
                            .attr("y", 100)
                            .attr("width", width)
                            .attr("height", height)
                            .append("xhtml:table")

            var thead = table.append("thead")
            var tbody = table.append("tbody")

            //Create the table header
            thead.append("tr")
                 .selectAll("th")
                 .data(columnsProtein)
                 .enter()
                 .append("th")
                 .text(function(d,i){return d;})

            //Create the table body
            var rows = tbody.selectAll("tr")
                            .data(organizedData[0])
                            .enter()
                            .append("tr")

            var cells = rows.selectAll("td")
                            .data(function(row)
                                  {
                                      return columnsProtein.map(function(column){return {column: column, value: row[column]}})
                                  })
                            .enter()
                            .append("td")
                            .text(function(d, i){return d.value})

            //Making the Trasncription Factor table second
            //Define the table, and append a header row and the rest of the body
            var table = d3.select("#Regulation")
                            .append("foreignObject")
                            .attr("x", 25)
                            .attr("y", 100 + height)
                            .attr("width", width)
                            .attr("height", height)
                            .append("xhtml:table")

            var thead = table.append("thead")
            var tbody = table.append("tbody")

            //Create the table header
            thead.append("tr")
                 .selectAll("th")
                 .data(columnsTF)
                 .enter()
                 .append("th")
                 .text(function(d,i){console.log(d); return d;})

            //Create the table body
            var rows = tbody.selectAll("tr")
                            .data(organizedData[1])
                            .enter()
                            .append("tr")

            var cells = rows.selectAll("td")
                            .data(function(row)
                                  {
                                      return columnsTF.map(function(column){return {column: column, value: row[column]}})
                                  })
                            .enter()
                            .append("td")
                            .text(function(d, i){return d.value})
            
            /*table.append("thead")
                 .join("tr")
                 .selectAll("th")
                 .data(columnsProtein)
                 .join("th")
                 .text(d => d)
                 .style("background-color", "#aaa")
                 .style("color", "#fff")
            
            
            table.append("tbody")
                 .selectAll("tr")
                 .data(organizedData[0])
                 .join("tr")
                 .selectAll("td")
                 .data(row => row.entries())
                 .join("td")
                 .text(d => d.value);*/
            
            //Specifically to the table head, add the columns list that was passed to it
            //Then add the columns as text
            //console.log(data)
            /*tableHeader.append('tr')
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
                        .text(function(d){return d.value});*/
            
            //return table;
        }

        //Change the outline of the pathway node if there is a change in expression respective to that change
        function showRegulationChangesInPathway(organizedData)
        {
            //Variable
            var colorChange = ""    //Stores the stroke color post regulation
            
            //Go through the protein list and the transcription factor list and if the protein is in the nodes of the pathway currently shown
            //then add an outline to note up or down regulation
            //DISCLAIMER: USER MUST REUPLOAD IF THEY WANT A DIFFERENT LAYOUT TO BE SHOWN
            for(var i = 0; i < organizedData[0].length; i++)
            {
                node.select("#" + organizedData[0][i]["Protein"])
                    .attr("stroke", function(d, j)
                                {  
                                    if(d.actualName === organizedData[0][i]["Protein"])
                                    {
                                        //console.log(d.actualName);                    
                                        switch(organizedData[0][i]["Regulation_Type"])
                                        {
                                            case "Upregulation":
                                                //console.log("Here");
                                                colorChange = "green"
                                                break;
                                                                                            
                                                case "Downregulation":
                                                    //console.log("Here2")
                                                    colorChange = "red"
                                                    break;

                                                //If neutral, so Fold_Change is 0
                                                default:
                                                    colorChange = "gray"
                                                    break;
                                                                                                
                                        }

                                        return colorChange
                                    }
                                    else
                                    {
                                        return "white";
                                    }
                                
                                })
                    .attr("stroke-width", function(d, j)
                                          {
                                                if(d.actualName === organizedData[0][i]["Protein"])
                                                {
                                                    return 5.0;
                                                }
                                                else
                                                {
                                                    return 1.5;
                                                }  
                                          })   
            }

            for(var i = 0; i < organizedData[1].length; i++)
            {
                node.select("#" + organizedData[1][i]["Transcription_Factor"])
                    .attr("stroke", function(d, j)
                                {  
                                    if(d.actualName === organizedData[1][i]["Transcription_Factor"])
                                    {
                                        //console.log(d.actualName);                    
                                        switch(organizedData[1][i]["Regulation_Type"])
                                        {
                                            case "Upregulation":
                                                //console.log("Here");
                                                colorChange = "green"
                                                break;
                                                                                            
                                                case "Downregulation":
                                                    //console.log("Here2")
                                                    colorChange = "red"
                                                    break;

                                                //If neutral, so Fold_Change is 0
                                                default:
                                                    colorChange = "gray"
                                                    break;
                                                                                                
                                        }

                                        return colorChange
                                    }
                                    else
                                    {
                                        return "white";
                                    }
                                
                                })
                    .attr("stroke-width", function(d, j)
                                          {
                                                if(d.actualName === organizedData[1][i]["Transcription_Factor"])
                                                {
                                                    return 5.0;
                                                }
                                                else
                                                {
                                                    return 1.5;
                                                }  
                                          })   
            }

        }
    })

    return (
        <div className = "test"></div>
    )
}


export default RegulationData;