import React, { useState } from "react";

const CustomModal = ({ isOpen, onClose, onImport }) => {
  const [jsonData, setJsonData] = useState("");

  const handleTextareaChange = (e) => {
    const input = e.target.value;

    try {
      const parsedData = JSON.parse(input);
      const formattedData = JSON.stringify(parsedData, null, 2); // 2 spaces for indentation
      setJsonData(formattedData);
    } catch (error) {
      // If the JSON is invalid, just update the textarea without formatting
      setJsonData(input);
    }
  };

  const handleImportClick = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      onImport(parsedData);  // Pass the parsed data back to the parent component
      onClose();  // Close the modal after successful import
    } catch (error) {
      alert("Invalid JSON format. Please correct it and try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl w-full min-h-[500px]">
        <h2 className="text-xl font-semibold mb-4">Import JSON Data</h2>
        <textarea
          value={jsonData}
          onChange={handleTextareaChange}
          placeholder="Paste your JSON data here"
          className="w-full h-[450px] p-2 border border-gray-300 rounded-lg mb-4 font-mono bg-gray-900 text-green-300"
          style={{ whiteSpace: 'pre-wrap', tabSize: 2 }}
        />
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Close
          </button>
          <button
            onClick={handleImportClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
