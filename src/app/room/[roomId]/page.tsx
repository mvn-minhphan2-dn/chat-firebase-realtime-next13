"use client"

import { chatRooms } from "@/contants/ChatRoom";
import { useAuthContext } from "@/context/auth";
import useFileReader from "@/utils/fireReader";
import { database, storage } from "@/utils/firebase";
import { child, get, onChildAdded, onValue, push, ref, serverTimestamp, set } from "firebase/database";
import { getDownloadURL, ref as storageRef, uploadBytesResumable, uploadString } from "firebase/storage";
import Image from "next/image";
import Link from "next/link";
import * as React from 'react'

type Props = {}
const className = "transition-transform border-2 hover:scale-110";

export default function Page({ params: { roomId } }: any) {
  const fileRef = React.useRef<any>("");
  const [value, setValue] = React.useState("");
  const [messages, setMessages] = React.useState<any>([]);
  const containerRef = React.useRef<any>();
  const [fileImg, imagesArr, setImagesArr, handleFileUpload] = useFileReader();
  
  const room = chatRooms.find((f) => f.id === roomId);
  // const { user: { uid, displayName } } = useAuthContext();
  const { user } = useAuthContext();
  const addMessage = async (roomId: any, author: any, displayName: any, text: any) => {
    try {
      const newMessageRef = push(ref(database, `messages/${roomId}`));
      // const str = storageRef(storage, 'images/messages' + fileImg.name);
      // const uploadTask = uploadBytesResumable(str, fileImg);
      const imageUrls = [] as any;
      const promises = [];
      const data = {
        displayName,
        author,
        text,
        createdAt: serverTimestamp()
      }

      if(fileImg){
        for (let i = 0; i < fileImg.length; i++) {
          const image = fileImg[i];
          const str = storageRef(storage, `images/messages/${image.name}`);
          const uploadTask = uploadBytesResumable(str, image);
          const promise = new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
              },
              (error) => {
                // Handle unsuccessful uploads
                reject(error);
              },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                imageUrls.push(downloadURL);
                resolve();
              }
            );
          });
          promises.push(promise);
        }
        await Promise.all(promises);
        const processImg = imageUrls.map((url: any) => ({ url }));
        await set(newMessageRef, {
          ...data,
          imgUrl: processImg
        });
    
        // Listen for state changes, errors, and completion of the upload.
        // uploadTask.on('state_changed',
        //   (snapshot) => {
        //     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        //     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //     console.log('Upload is ' + progress + '% done');
        //     switch (snapshot.state) {
        //       case 'paused':
        //         console.log('Upload is paused');
        //         break;
        //       case 'running':
        //         console.log('Upload is running');
        //         break;
        //     }
        //   },
        //   (error) => {
        //     console.log(error);
        //   },
        //   async () => {
        //     const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        //     await set(newMessageRef, {
        //       displayName,
        //       author,
        //       text,
        //       imgUrl: downloadURL,
        //       createdAt: serverTimestamp()
        //     });
        //   }
        // );
      } else {
        await set(newMessageRef, data);
      }
      setImagesArr("");
      fileRef.current.value = "";
      return newMessageRef.key;
    } catch (error) {
      console.log(error);
    }
  };

  const getRoomMessagesWithUserInfo = async (roomId: any) => {
    const messagesRef = ref(database, `messages/${roomId}`);
    onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.entries(data).map(([_id, value]) => ({
          id: _id,
          ...value as any,
        }));
        setMessages(messages);
      }
    });
  }

  const handleOnSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    addMessage(roomId, user?.uid, user?.displayName, value);
    setValue("");
  }

  React.useEffect(() => {
    const unsubscribe = getRoomMessagesWithUserInfo(roomId);
    return () => {
      unsubscribe
    };
  }, [roomId]);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <section className="container">
        <div className="my-5">
          <div className="grid justify-center mb-5 text-center">
            <h1 className="mb-2 text-3xl">Chat Room</h1>
            <span className="mb-2 text-2xl">{room?.title}</span>
            <Link href="/chatRoom" className={`p-2 border-2 w-fit ${className}`}>Back To All Rooms</Link>
          </div>
          <div className="container py-2 min-h-[60vh] w-[50%] border-2 flex flex-col">
            <div className="grid gap-2 max-h-[500px] content-baseline overflow-auto flex-1" ref={containerRef}>
              {messages?.map((message: { author: string | string[]; id: any; text: string, displayName: string, imgUrl: any }) => (
                <div key={message.id} className={`flex ${(message.author === user?.uid) && "justify-end"} border-b-2 h-fit last:border-b-0`}>
                  <div className="grid pb-2">
                    <span className="text-lg text-red-500">{message?.displayName}</span>
                    <span>{message?.text}</span>
                    {/* {message.imgUrl && <img className="h-[50px] w-[50px]" src={message.imgUrl} alt="" />} */}
                    <div className="flex gap-3 overflow-auto max-w-fit">
                      {message.imgUrl && message.imgUrl.map((img: any) => (
                        <Image key={img.url} width={50} height={50} priority className="h-[50px] w-[50px]" src={img.url} alt="" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleOnSubmit}>
              <div className="flex gap-3">
                <div className="grid flex-1">
                  <input className="flex-1 px-2 py-2 text-red-400" required minLength={1} value={value} onChange={(e) => setValue(e.target.value)} type="text" placeholder="Enter a message" />
                </div>
                <button type="submit" className={`px-3 py-1 ${className} h-fit`}>Send</button>
              </div>
              <div>
                <input type="file" onChange={handleFileUpload} ref={fileRef} multiple />
                <div className="flex gap-3 overflow-auto max-w-fit">
                  {imagesArr && imagesArr.map((img: any) => (
                    <Image className="object-contain" key={img} height={100} width={100} src={img} alt="" />
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
