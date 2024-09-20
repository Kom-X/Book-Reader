// src/components/Dropzone.js
import React from 'react';
import { useDropzone } from 'react-dropzone';
import './Dropzone.css';

const Dropzone = ({ onFileDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    }
  });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag & drop a PDF file here, or click to select one</p>
    </div>
  );
};

export default Dropzone;
