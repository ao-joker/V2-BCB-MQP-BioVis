import React, {Fragment} from 'react';

/*Here is the basis for the file upload mechanism
    - Firstly, the basic set up for the choosing file and then upload file system is placed in using the Fragment
*/
function FileUpload()
{
    return(
        <Fragment>
            <form>
                <div className = "input-group mb-3">
                    <input type = "file" className = "form-control" id = "inputGroupFile02"></input>
                    <label className = "custom-file-label" htmlFor = "custom-file"></label>

                    <input type = "submit" value = "Upload" className = "btn btn-primary btn-block"></input> 
                </div>
            </form>
        </Fragment>
    )
}

export default FileUpload;