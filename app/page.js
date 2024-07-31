"use client"
import {Box, Stack, Typography, Button, Modal, TextField} from "@mui/material"
import { firestore } from "@/firebase";
import {collection, doc, query, getDocs, setDoc, deleteDoc, getDoc} from 'firebase/firestore'
import {useState, useEffect} from "react"

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

export default function Home() {
  const [pantry,setPantry] = useState([]);
  const [openData,setOpenData] = useState({
    add: false,
    more_add: false,
    delete: false,
    find: false
  });
  const [itemData, setItemData] = useState({
    name: '',
    quantity: 1
  });
  const handleOpen = (e) => setOpenData((prevState) => ({...prevState,[e.target.name]: true}))
  const handleClose = (name) => {
    setOpenData((prevState) => ({ ...prevState, [name]: false }));
  };

  useEffect( () => {
    updatePantry()
  },[])

  const updatePantry = async () => {
    const snapshot = query(collection(firestore,'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()})
    })
    setPantry(pantryList)
  }


  const addItem = async (item) => {
    try{
      const docRef = doc(collection(firestore,'pantry'),item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase())
      const docSnap = await getDoc(docRef)
      const quantity = Number(item.quantity)
      if(quantity > 0){
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
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore,'pantry'),item.name)
    const docSnap = await getDoc(docRef)
    const quantity = Number(item.quantity)
    if(quantity > 0){
      if (docSnap.exists()){
        const {count} = docSnap.data()
        if (count - item.quantity < 1){
          await deleteDoc(docRef)
        }
        else{
          await setDoc(docRef, {count: count - item.quantity})
        }
      }
    }
    await updatePantry()
  }
  return (
    <Box       
    width="100vw"
    height="100vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={"column"}
    alignItems={'center'}
    gap={2}
   > 


      {/*Add New Item Modal*/}
      <Modal
        open={openData.add}
        onClose={() => handleClose('add')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField id="outlined-basic"  label="Item" variant="outlined" fullWidth value={itemData.name} onChange={(e) => setItemData((prevState) => ({...prevState, name: e.target.value}))}/>
            <TextField id="outlined-basic"  
            type="number" 
            label="Quantity" 
            variant="outlined" 
            fullWidth value={itemData.quantity} 
            inputProps={{ min: 1 }}
            onChange={(e) => setItemData((prevState) => ({...prevState, quantity: e.target.value}))}/>
            <Button variant="outlined" name="add"
            onClick={(e) => {
              addItem(itemData)
              setItemData({name:"", quantity:1})
              handleClose("add")
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>

      {/*More Add Modal*/}
      <Modal
        open={openData.more_add}
        onClose={() => handleClose('more_add')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            How much would you like to add for {itemData.name}?
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField 
            id="outlined-basic"  
            type="number" 
            label="Quantity" 
            variant="outlined" 
            fullWidth value={itemData.quantity} 
            inputProps={{ min: 1 }}
            onChange={(e) => setItemData((prevState) => ({...prevState, quantity: e.target.value}))}/>
            <Button variant="outlined" name="more_add"
            onClick={(e) => {
              addItem(itemData)
              setItemData({name:"", quantity:1})
              handleClose("more_add")
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>

      {/*Delete Modal*/}
      <Modal
        open={openData.delete}
        onClose={() => handleClose('delete')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            How much would you like to remove from {itemData.name}?
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField 
            id="outlined-basic"  
            type="number" 
            label="Quantity" 
            variant="outlined" 
            fullWidth value={itemData.quantity} 
            inputProps={{ min: 1 }}
            onChange={(e) => setItemData((prevState) => ({...prevState, quantity: e.target.value}))}/>
            <Button variant="outlined" name="delete"
            onClick={(e) => {
              removeItem(itemData)
              setItemData({name:"", quantity:1})
              handleClose("delete")
            }}>Remove</Button>
          </Stack>
        </Box>
      </Modal>

      

      <Button variant="contained" name="add" onClick={handleOpen}>Add New Item</Button>
      <Box border={'1px solid #333'}>
        <Box width="800px" height="100px" bgcolor={"#ADD8E6"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
              Item Management
          </Typography>
        </Box>
          <Stack width="800px" height="300px" spacing={2} overflow={'auto'} >
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
                  <Button variant="contained" name="more_add"
                  onClick={(e) => {
                    setItemData((prevState) => ({...prevState,name: name}))
                    handleOpen(e)
                  }}>Add</Button>
                  <Button variant="contained" name="delete"
                  onClick={(e) =>{
                    setItemData((prevState) => ({...prevState,name: name}))
                    handleOpen(e)
                  }}>Remove</Button>
                </Stack>
              </Box>
            ))} 
        </Stack>
      </Box>
    </Box>
  );
}
