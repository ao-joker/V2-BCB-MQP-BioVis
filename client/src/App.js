import React from 'react';
import FileUpload from './FileUpload';
import Home from './Home';

function App() 
{

  //Some constant titles
  const acknowledgements = "BCB MQP Advisor: Dr. Lane Harrison  ;  BBT MQP Advisor: Dr. Scarlet Shell";

  return (
    <div className="App">
      <header className="container"></header>
      <h1 className="text-center"><i>Mycobacterium tuberculosis</i> Metabolic Pathway Biovisualization</h1>
         <h3 className="text-center mt-4">An MQP completed by Adrian Orszulak</h3>
         <h4 className="text-center mt-2">{acknowledgements}</h4>

      <Home></Home>
      <FileUpload></FileUpload>
    </div>
  );
}

export default App;
