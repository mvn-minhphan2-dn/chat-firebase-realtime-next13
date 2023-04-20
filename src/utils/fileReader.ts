"use client";

import { useState } from "react";
export default function useFileReader() {
  const [fileImg, setFileImg] = useState<any>("");
  const [imagesArr, setImagesArr] = useState<any>("");

  function handleFileUpload(event: any) {
    const fileList = event.target.files;
    const imagesArray = [] as any;
    const fileArr = [] as any;
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const reader = new FileReader();
        const file = fileList[i];
        fileArr.push(file);
  
        reader.onloadend = () => {
          imagesArray.push(reader.result);
          if (imagesArray.length === fileList.length) {
            setImagesArr(imagesArray);
          }
        };
  
        reader.readAsDataURL(file);
      }
      setFileImg(fileArr);
    }
  }

  return [fileImg, imagesArr, setImagesArr, handleFileUpload];
}
