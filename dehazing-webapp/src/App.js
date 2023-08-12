import React, { useState, useEffect } from 'react'

function App() {

    const [file, setFile] = useState();
    function handleChange(e) {
        console.log(e.target.files);
        setFile(URL.createObjectURL(e.target.files[0]));
    }
 
    return (
        <div className="App">
            <h2>Add Image:</h2>
            <input type="file" onChange={handleChange} />
            <img src={file} />
 
        </div>
 
    );   
    
    // const [data, setData] = useState([{}])
    // useEffect(() => {
    //     fetch("/members").then(
    //         res => res.json()
    //     ).then(
    //         data => {
    //             setData(data)
    //             console.log(data)
    //         }
    //     )
    // }, [])

    // return (
    //     <div>
    //         {(typeof data.members === 'undefined') ? (
    //             <p>Loading.....</p>
    //         ) : (
    //             data.members.map((member, i) => (
    //                 <p key = {i}>{member}</p>

    //             ))
    //         )}
    //     </div>
    // )
}

export default App