import React, { useState } from 'react';
import { Icon, Button, Sidebar, Menu } from 'semantic-ui-react';
import './App.css';

function App() {
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
            <header className="App-header">
                <h1 className="app-title">Image Dehazer V1</h1>
            </header>
            {!file ? (
                <div>
                    <label htmlFor="fileInput" className="upload-button-label">
                        <Icon name="file" className="upload-button-icon" />
                        Choose Image
                    </label>
                    <input id="fileInput" type="file" accept=".jpg, .jpeg, .png" onChange={handleChange} hidden />
                </div>
            ) : (
                <div className="image-container">
                    <p>Your Uploaded Image</p>
                    <img src={file} alt="Uploaded" />
                    <div></div>
                    <Button className="remove-button" color="red" onClick={handleRemove}>
                        Remove Upload
                    </Button>
                </div>
            )}
        </div>
    );
}

export default App;

