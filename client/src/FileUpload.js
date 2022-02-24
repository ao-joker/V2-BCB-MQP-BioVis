import React, {Fragment, useState} from 'react';
import axios from 'axios';

/*Here is the basis for the file upload mechanism
    - Firstly, the basic set up for the choosing file and then upload file system is placed in using the Fragment
    - Secondly, properly take in the file, acknowlegde its existence, and know what to pass
*/
function FileUpload()  
{
    //Set up a bunch of states for the file upload
    const [file, setFile] = useState()                                      //Change the value in order to immediately and cleanly set the file
    const [fileName, setFileName] = useState("Choose File")                 //Using this as part of a hook to note the type of file, the file itself, and what to send to submission
    const [uploadedFile, setUploadedFile] = useState({})                    //Obtain the returned file object

    const onChange = function(e)
                    {
                        setFile(e.target.files[0])        
                        setFileName(e.target.files[0].name)
                    }

    const onSubmit = async e =>
                    {
                        e.preventDefault()

                        //Create a form data to actually take in the file
                        const formData = new FormData()
                        formData.append("file", file) //This links to the backend server component of req.files.file!
                        console.log(formData)

                        //A try-catch in order to take in the file and place it in the right directory
                        try
                        {
                            const res = await axios.post("http://localhost:3001/upload", formData, {
                                                                                headers: 
                                                                                {
                                                                                    "Content-Type": "multipart/form-data"
                                                                                }})

                            //Now extract the fileName and path from the res
                            const {fileName, filePath} = res.data
                            setUploadedFile({fileName, filePath})
                        }
                        catch(err)
                        {
                            //We could get a 400 or a 500 status error depending on the error type specified in the server.js
                            if(err.response.status === 500)
                            {
                                console.log("There was a problem with the server")
                            }
                            else if(err.response.status === 400)
                            {
                                console.log("The directory was not found")
                            }
                            else
                            {
                                console.log(err.response.data.msg)
                            }
                        }
                    }

    return(
        <Fragment>
            <form onSubmit = {onSubmit}>
                <div className = "input-group mb-3">
                    <input type = "file" className = "custome-file-input" id = "customFile" onChange = {onChange}></input>
                    <label className = "custom-file-label" htmlFor = "custom-file">{fileName}</label>
                    <input type = "submit" value = "Upload" className = "btn btn-primary btn-block"></input> 
                </div>
            </form>
        </Fragment>
    )
}

export default FileUpload;