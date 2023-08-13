import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import './styles.css';


function Imageupload() {
    const [file, setFile] = useState(null);

    function handleChange(e) {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const allowedExtensions = ['jpg', 'jpeg', 'png'];
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

            if (allowedExtensions.includes(fileExtension)) {
                setFile(URL.createObjectURL(selectedFile));
            } else {
                window.alert('Invalid file type. Please select an image file.');
            }
        }
    }

    function handleRemove() {
        setFile(null);
    }

    return (
        <div className="App">
            {!file ? (
                <div>
                    <label htmlFor="fileInput" className="upload-button-label">
                        <i  className="search icon" />
                        Select Image
                    </label>
                    <input id="fileInput" type="file" accept=".jpg, .jpeg, .png" onChange={handleChange} hidden />
                </div>
            ) : (
                <div className="image-container">
                    <p>Your Uploaded Image</p>
                    <img src={file} alt="Uploaded" />
                    <div></div>
                    <Button className="remove-button" color="red" onClick={handleRemove}>
                        Remove Image
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Imageupload;