//Take the express package and right in the constants that will contain and function to the process of
//uploading the file
const express = require("express")
const fileUpload = require("express-fileupload")

//Have the app take in the file 
const app = express()

//Upload the file using the app
app.use(fileUpload())


/*app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '/client/src/App'), function(err) {
      if (err) {
          console.log("OOPS")
        res.status(500).send(err)
      }
    })
  })*/

//Upload Endpoint for where the file will end up
app.post("/upload", function(req, res)
                    {
                        //If there is no file present, let the user know that no file was uploaded and send
                        //a 400 request code to the server
                        if(req.files === null)
                        {
                            return res.status(400).json({msg: "No file was uploaded"})
                        }

                        //If there is a file, assign it to the constant file variable that stores the file information
                        const file = req.files.file

                        //Move the file to the upload folder in the directory
                        //Asses potential error if there is a problem with the upload process overall
                        file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => 
                                                                                 {
                                                                                    //Output what the error in particular is should there be any 
                                                                                    //Also return res.status of 500 which is a server error
                                                                                    if(err)
                                                                                    {
                                                                                        console.log(err)
                                                                                        return res.status(500).send
                                                                                    }

                                                                                    //If there are no issues, send a res.json that sends a response of 200 which indicates that all is good
                                                                                    //Sends back a json object of the file with its name and the path in directory to which it belongs
                                                                                    res.json({
                                                                                                filename: file.name,
                                                                                                filePath: `/uploads/${file.name}`
                                                                                             })

                                                                                 })
                    })

//Ensure the server is starting and functioning properly
app.listen(300, function(){console.log("Server started")})
