"use client"

import * as React from 'react'
import { useAuthContext } from "@/context/auth";
import useFileReader from "@/utils/fileReader";
import { database, storage } from "@/utils/firebase";
import { child, equalTo, get, off, onChildAdded, onChildChanged, onValue, orderByChild, push, query, ref, serverTimestamp, set, update } from "firebase/database";
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";

type Props = {}
const className = "transition-transform border-2 hover:scale-110";

export default function Page({ params: { roomId } }: any) {
  const router = useRouter();
  const fileRef = React.useRef<any>("");
  const [value, setValue] = React.useState<any>("");
  const [messages, setMessages] = React.useState<any>([]);
  const [roomUsers, setRoomUsers] = React.useState<any>([]);
  const containerRef = React.useRef<any>();
  const [fileImg, imagesArr, setImagesArr, handleFileUpload] = useFileReader();

  // const { user: { uid, displayName } } = useAuthContext();
  const { user } = useAuthContext();

  React.useEffect(() => {
    if (!user) router.push("/login");
  }, [])
  // handle function messages
  const addMessage = async (roomId: any, author: any, displayName: any, photoURL: any, text: any) => {
    try {
      const newMessageRef = push(ref(database, `messages/${roomId}`));
      const imageUrls = [] as any;
      const promises = [];
      const data = {
        displayName,
        author,
        text: text.trim(),
        photoURL,
        createdAt: serverTimestamp()
      }
      if(text.trim() !== ""){
        if (fileImg) {
          for (let i = 0; i < fileImg.length; i++) {
            const image = fileImg[i];
            const str = storageRef(storage, `images/messages/${image.name}`);
            const uploadTask = uploadBytesResumable(str, image);
            const promise = new Promise<void>((resolve, reject) => {
              uploadTask.on('state_changed',
                (snapshot) => {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                  reject(error);
                },
                async () => {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  imageUrls.push({ url: downloadURL });
                  resolve();
                }
              );
            });
            promises.push(promise);
          }
          await Promise.all(promises);
          await set(newMessageRef, {
            ...data,
            imgUrl: imageUrls
          });
        } else {
          await set(newMessageRef, data);
        }
        setImagesArr("");
        fileRef.current.value = "";
        return newMessageRef.key;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getRoomMessages = async () => {
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
    addMessage(roomId, user?.uid, user?.displayName, user?.photoURL, value);
    setValue("");
  }

  const getUserRoom = async () => {
    const roomsRef = ref(database, 'rooms');
    const usersRef = ref(database, 'users');
    
    const membersInRoomRef = ref(database, `rooms/${roomId}/members`);
    const snapShotCallback = async (membersSnapshot: any) => {
      const members = membersSnapshot.val() || {};
      const memberIds = Object.keys(members).filter((memberId) => members[memberId] !== false);
      
      if (memberIds.length) {
        const promises = memberIds.map(async (memberId) => {
          const userSnapshot = await get(child(usersRef, memberId));
          return userSnapshot.val();
        });
        return await Promise.all(promises).then((roomUser) => {
          roomUser.sort((a: any, b: any) => b.createdAt - a.createdAt);
          setRoomUsers(roomUser);
        });
      }
    }
    onValue(membersInRoomRef, snapShotCallback);
    return () => {
      off(membersInRoomRef, snapShotCallback as any);
    }
    // return get(child(roomsRef, `${roomId}/members`)).then(async (membersSnapshot) => {
    //   const members = membersSnapshot.val() || {};
    //   const memberIds = Object.keys(members).filter((memberId) => members[memberId] !== false);
      
    //   if (memberIds.length) {
    //     const promises = memberIds.map(async (memberId) => {
    //       const userSnapshot = await get(child(usersRef, memberId));
    //       return userSnapshot.val();
    //     });
    //     return await Promise.all(promises).then((roomUser) => {
    //       roomUser.sort((a: any, b: any) => b.createdAt - a.createdAt);
    //       setRoomUsers(roomUser);
    //     });
    //   }
    // });
    //   // const usersQuery = query(usersRef,orderByChild(`rooms/${roomId}`),equalTo(true));
    //   // const usersSnapshot = await get(usersQuery);
    //   // const users = usersSnapshot.val() || {};
    //   // const roomUsers = Object.values(users).filter((user: any) => memberIds.includes(user?.uid));
    //   // console.log("🚀 ----------------------------------------------------------🚀")
    //   // console.log("🚀 ~ file: page.tsx:136 ~ returnget ~ roomUsers:", roomUsers)
    //   // console.log("🚀 ----------------------------------------------------------🚀")
    //   // setRoomUsers(roomUsers);
  }

  const handleLeaveRoom = async () => { 
    const dbRef = ref(database);
    const updates = {} as any;
    updates[`rooms/${roomId}/members/${user?.uid}`] = false;
    updates[`users/${user?.uid}/rooms/${roomId}`] = false;
    await update(dbRef, updates);
    router.push("/rooms");
  }

  React.useEffect(() => { 
    const unsubscribe = [
      getUserRoom(),
      getRoomMessages()
    ]
    return () => {
      unsubscribe
    }
  }, [roomId])

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // variants motion
  const variants = {
    hidden: { opacity: 0, x: -200, y: 0 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 0, y: -100 },
  }

  return (
    <>
      <motion.section className="container"
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: 'linear' }}
      >
        <div className="my-5">
          <div className="grid justify-center mb-5 text-center">
            <h1 className="mb-2 text-3xl">Chat Room</h1>
            <span className="mb-2 text-2xl text-pink-600">{roomId?.toUpperCase()}</span>
            <div className="flex gap-5">
              <Link href="/rooms" className={`p-2 border-2 w-fit ${className}`}>Back To All Rooms</Link>
              <button className={`${className} p-2`} onClick={handleLeaveRoom}>Leave Room</button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-[0.7] py-2 min-h-[50vh] w-[50%] border-2 flex flex-col px-2">
              <div className="grid gap-2 max-h-[500px] content-baseline overflow-auto flex-1 mb-10 px-5" ref={containerRef}>
                {messages?.map((message: any) => (
                  <div key={message.id} className={`flex ${(message.author === user?.uid) && "justify-end"} border-b-2 h-fit last:border-b-0`}>
                    <div className="grid pb-2">
                      <div className="flex gap-2">
                        {message?.author !== user?.uid && <Image className="rounded-full" height={20} width={30} src={message?.photoURL} alt="" /> }
                        <span className="flex px-3 bg-pink-200 border-2 rounded-xl w-fit">{message?.text}</span>
                      </div>
                      <div className="flex gap-3 overflow-auto max-w-fit">
                        {message.imgUrl && message.imgUrl.map((img: any) => (
                          <Image key={img.url} width={50} height={50} priority className="h-[50px] w-[50px] object-contain" src={img.url} alt="" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleOnSubmit}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid flex-1">
                    <input className="flex-1 px-2 py-2 text-red-400 border-2 border-pink-600" required minLength={1} value={value} onChange={(e) => setValue(e.target.value)} type="text" placeholder="Enter a message" />
                  </div>
                  <button type="submit" className={`px-3 py-1  ${className} h-fit`}>Send</button>
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
            <div className="flex-[0.3] border-2 p-2">
              <h1 className="mb-3 text-3xl text-center text-pink-600 underline">Users</h1>
              {roomUsers?.map((roomUser: any) => (
                <div key={roomUser.createdAt} className="flex items-center gap-2 mb-4 last:mb-0">
                  <Image src={roomUser?.photoURL} alt="" width={30} height={30} className="rounded-3xl" />
                  <span key={roomUser.createdAt} className="text-lg text-black">{roomUser?.displayName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </>
  )
}
