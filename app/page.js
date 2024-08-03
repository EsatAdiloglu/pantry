"use client"
import {Box, Stack, Typography, Button, Modal, TextField} from "@mui/material"
import { firestore } from "@/firebase";
import {collection, doc, query, getDocs, setDoc, deleteDoc, getDoc} from 'firebase/firestore'
import {useState, useEffect} from "react"
import { Alegreya } from "next/font/google";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3
};
const test = ["pantry","hello","items","NieR"]

const formatString = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function Home() {
  const [pantries, setPantries] = useState([])
  const [currentPantry, setCurrentPantry] = useState("")
  const [pantry,setPantry] = useState([]);
  const [switches,setSwitches] = useState({
    edit: false,
    find: false,
    showAddItem: false,
  });
  const [itemData, setItemData] = useState({
    name: '',
    quantity: 1
  });

  const handleOpen = (e) => setSwitches((prevState) => ({...prevState,[e.target.name]: true}))
  const handleClose = (name) => {
    setSwitches((prevState) => ({ ...prevState, [name]: false }));
  };
  const switchPantry = (pantry) => setCurrentPantry(pantry)

  useEffect( () => {
    addPantries();
  })
  useEffect( () => {
    updatePantry()
  },[currentPantry])


  const addPantries = async () => {
    try{
      const response = await fetch("./backend/api/collections.js");
      const data = await response.json();
      console.log(data);
    }
    catch(error){
      console.error(error)
    }
  }
  const updatePantry = async () => {
    if(currentPantry){
      const snapshot = query(collection(firestore,currentPantry))
      const docs = await getDocs(snapshot)
      const pantryList = []
      docs.forEach((doc) => {
        pantryList.push({name: doc.id, ...doc.data()})
      })
      setPantry(pantryList)
  }
  }
 

  const addItem = async (item) => {
    try{
      const docRef = doc(collection(firestore,currentPantry),formatString(item.name))
      const docSnap = await getDoc(docRef)
      const quantity = Number(item.quantity)
      if(quantity > 0 && item.name.replace(/\s/g,"") !== ""){
        if(docSnap.exists()){
          const {count} = docSnap.data()
          await setDoc(docRef, {count: count + quantity})
        }
        else{
        await setDoc(docRef, {count: quantity})
        }
      }
      await updatePantry()
    }
  catch(error){
    alert("Please type in an item.")
    console.error(error)
  }
  }
  const removeItem = async (name,quantity) => {
    const docRef = doc(collection(firestore,currentPantry),name)
    const docSnap = await getDoc(docRef)
    quantity = Number(quantity)
    if(!isNaN(quantity)){
      if (docSnap.exists()){
        const {count} = docSnap.data()
        if (count - quantity < 1){
          await deleteDoc(docRef)
        }
        else{
          await setDoc(docRef, {count: count - quantity})
        }
    }
  }
    await updatePantry()
}
  const findItem = async (item) => {
    try{
      if(item !== ""){
        const docRef = doc(collection(firestore,currentPantry),formatString(item))
        const docSnap = await getDoc(docRef)
          if(docSnap.exists()){
            setPantry([{name:docSnap.id, ...docSnap.data()}])
          }
          else{
            setPantry([])
          }
      }
      else{
        await updatePantry()
      }
    }
    catch(error){
      console.error(error)
    }

  }
  return (
    <Stack width="100vw" height="100vh" direction={"row"} gap={0}>
      <Box width="30%" height="100%"  display={"flex"} flexDirection={"column"} border={'1px solid #333'}>
        <Typography variant={"h4"} color={"#333"} textAlign={"center"} sx={{height:"5vh",}}>Your Pantries</Typography>
        <Stack width="23vw" height="90vh" border={"1px solid #333"} direction={"column"} overflow={"auto"}>
          {test.map((name) => (
              <Button
              variant="outlined"
              sx={{height:"11vh"}} 
              key={name}
              onClick={async () => {
                switchPantry(name)
                await updatePantry()}}>{name}</Button>
          ))} 
        </Stack>
        <Button variant="outlined" sx={{ position: 'absolute', bottom: 0, width: "23vw", height: "5vh", borderRadius: "0px"}}>Add New Pantry</Button>
      </Box>
    <Box       
    width="100vw"
    height="100vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={"column"}
    alignItems={'center'}
    gap={2}
   > 

      {/*Edit Modal*/}
      <Modal
        open={switches.edit}
        onClose={() => handleClose('edit')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            How much would you like to add or remove for {itemData.name}?
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField id="outlined-basic"  type="number" label="Quantity" variant="outlined" fullWidth value={itemData.quantity} inputProps={{ min: 1 }} onChange={(e) => setItemData((prevState) => ({...prevState, quantity: e.target.value}))}/>
            <Stack width="100%" direction={"row"} spacing={2}>
              <Button variant="outlined"
              onClick={(e) => {
                addItem(itemData)
                setItemData({name:"", quantity:1})
                handleClose("edit")
              }}>Add</Button>
              <Button variant="outlined"
              onClick={(e) => {
                removeItem(itemData.name,itemData.quantity)
                setItemData({name:"", quantity:1})
                handleClose("edit")
              }}>Remove</Button>
            </Stack>

          </Stack>
        </Box>
      </Modal>

    
       {switches.showAddItem ? (
          <Stack width="1000px" direction={"row"} spacing={1}>
            <TextField id="outlined-basic" label="New Item" variant="outlined" fullWidth value={itemData.name}  onChange={(e) => setItemData((prevState) => ({...prevState, name: e.target.value}))}/>
            <TextField id="outlined-basic" type="number" label="Quantity" variant="outlined" fullWidth value={itemData.quantity}  inputProps={{ min: 1 }} onChange={(e) => setItemData((prevState) => ({...prevState, quantity: e.target.value}))}/>
            <Button variant="contained" 
            onClick={() => {
              addItem(itemData)
              setItemData({name:"",quantity:1})
              setSwitches((prevState) => ({...prevState, showAddItem: false}))
            }}>Add</Button>
            <Button variant="contained"
            onClick={() => {
              setItemData({name:"",quantity:1})
              setSwitches((prevState) => ({...prevState, showAddItem: false}))
            }}>Cancel</Button>
          </Stack>
            )
            : switches.find ? (
              <Stack width="1000px" direction={"row"} spacing={2}>
                <TextField id="outlined-basic" label="Type in Item's name" variant="outlined" fullWidth value={itemData.name} 
                onChange={(e) => {
                setItemData((prevState) => ({...prevState, name:e.target.value}))
                findItem(e.target.value)}}/>
                <Button variant="contained"
                  onClick={async () => {
                  setItemData({name:"",quantity:1})
                  await updatePantry()
                  setSwitches((prevState) => ({...prevState, find: false}))
                }}>Cancel</Button>
              </Stack>
            )
            :
            (
              <Stack direction={"row"} spacing={2}>
                <Button variant="contained" onClick={() => setSwitches((prevState) => ({...prevState, showAddItem: true}))}>Add New Item</Button>
                <Button variant="contained" onClick={() => setSwitches((prevState) => ({...prevState, find: true}))}>Find Item</Button>
              </Stack>
            )
            }

        <Box border={'1px solid #333'}>
          <Box width="1000px" height="100px" bgcolor={"#ADD8E6"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
            <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
                Item Management
            </Typography>
          </Box>
            <Stack width="100%" height="300px" spacing={2} overflow={'auto'} >
              {pantry.map(({name,count}) => (
                  <Box 
                    key={name}
                    width="100%"
                    minHeight="250px"
                    display={'flex'}
                    justifyContent={"space-between"}
                    alignItems={'center'}
                    bgcolor={'#f0f0f0'}
                    paddingX={5}>
                    <Typography variant={'h3'} color={'#333'} textAlign={"center"}>
                        {name}
                    </Typography>
                    <Typography variant={'h3'} color={'#333'} textAlign={"center"}>
                        {count}
                    </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" name="edit"
                    onClick={(e) => {
                      setItemData((prevState) => ({...prevState,name: name}))
                      handleOpen(e)
                    }}>Edit</Button>
                    <Button variant="contained" name="delete"
                    onClick={() =>{
                      removeItem(name,count)
                    }}>Remove</Button>
                  </Stack>
                </Box>
              ))} 
          </Stack>
        </Box>
    </Box>
    </Stack>
  );
}
