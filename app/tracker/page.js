"use client"
import {Box, Stack, Typography, Button, Modal, TextField, Card, CardMedia} from "@mui/material"
import {firestore, app} from "@/firebase";
import {collection, doc, query, getDocs, setDoc, deleteDoc, getDoc} from 'firebase/firestore'
import {getAuth, signOut, onAuthStateChanged} from "firebase/auth"
import {useRouter} from "next/navigation"
import {useState, useEffect} from "react"
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RemoveIcon from '@mui/icons-material/Remove';
import LogoutIcon from '@mui/icons-material/Logout';
// import { userAgent } from "next/server";
// import { unsubscribe } from "@/backend/api/collections";

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

const formatString = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function Tracker() {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)
  const [pantries, setPantries] = useState([])
  const [currentPantry, setCurrentPantry] = useState("")
  const [pantry,setPantry] = useState([]);
  const [switches,setSwitches] = useState({
    edit: false,
    find: false,
    showAddItem: false,
    newPantry: false,
    signOut: false,
  });
  const [itemData, setItemData] = useState({
    name: '',
    quantity: 1
  });
  // const [pantryData, setPantryData] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        if (!loggedIn) {
          try {
            const userRef = doc(collection(firestore, "users"), user.email);
            const docRef = doc(collection(userRef,"pantry"), "Donotremovethisdocument");
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
              await setDoc(docRef, { count: 0 });
            }
            await updatePantryList();
            setLoggedIn(true);
          } catch (error) {
            console.error(error);
          }
        }
      } else {
        router.push("/");
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, [auth, loggedIn, router]);

  useEffect(() => {
    updatePantry();
  }, [currentPantry])

  const handleSignOut = async() => {
    try{
      await signOut(auth);
      router.push("/")
    }
    catch(error){
      console.error("Error signing out:", error)
    }
  }

  const handleSwitchOpen = (e) => setSwitches((prevState) => ({...prevState,[e.target.name]: true}))
  const handleSwitchClose = (name) => {
    setSwitches((prevState) => ({ ...prevState, [name]: false }));
  };
  const switchPantry = (pantry) => setCurrentPantry(pantry)



  const updatePantryList = async () => {
    try{
      // const response = await fetch("http://localhost:8080/api/collections");
      // const data = await response.json();
      // const pantriesList = [];
      // data.collections.forEach(async (d) => {
      //   pantriesList.push(d)
      // });
      // setPantries(pantriesList)
      setPantries(["pantry"])
      setCurrentPantry("pantry")
      await updatePantry()
    }
    catch(error){
      console.error(error)
    }
  }

  const updatePantry = async () => {
    try{
    if(currentPantry && user){
      const userRef = doc(collection(firestore,"users"),user.email)
      const snapshot = query(collection(userRef,currentPantry))
      const docs = await getDocs(snapshot)
      const pantryList = []
      docs.forEach((doc) => {
        doc.data().count === 0 ? null : pantryList.push({name: doc.id, ...doc.data()})
      })
      setPantry(pantryList)
  }
    }
    catch(error){
      console.error(error)
    }
  }
  // const addPantry = async (pantry) => {
  //   try{
  //     if(pantry.replace(/\s/g,"") !== ""){
  //       const userRef = doc(collection(firestore,"users"),user.email)
  //       const docRef = doc(collection(userRef,pantry),"Don't remove so that collection exist")
  //       await setDoc(docRef, {count: 0})  //So that the collection can appear. If the document field is empty, then it won't appear
  //       await updatePantryList()
  //   }
  // }
  //   catch(error){
  //     console.error(error)
  //   }
  // }

  const addItem = async (item) => {
    try{
      const userRef = doc(collection(firestore,"users"),user.email)
      const docRef = doc(collection(userRef,currentPantry),formatString(item.name))
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
    const userRef = doc(collection(firestore,"users"),user.email)
    const docRef = doc(collection(userRef,currentPantry), name)
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
        const userRef = doc(collection(firestore,"users"),user.email)
        const docRef = doc(collection(userRef,currentPantry),formatString(item))
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

      {/*Edit Modal*/}
      <Modal
        open={switches.edit}
        onClose={() => handleSwitchClose('edit')}
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
                handleSwitchClose("edit")
              }}><AddIcon />Add</Button>
              <Button variant="outlined"
              onClick={(e) => {
                removeItem(itemData.name,itemData.quantity)
                setItemData({name:"", quantity:1})
                handleSwitchClose("edit")
              }}><RemoveIcon />Remove</Button>
            </Stack>

          </Stack>
        </Box>
      </Modal>

      {/*Add New Pantry Modal*/}
      <Modal
        open={switches.newPantry}
        onClose={() => handleSwitchClose('newPantry')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            WIP
          </Typography>
          {/* <Stack width="100%" direction={'column'} spacing={2}>
            <TextField id="outlined-basic" label="Name" variant="outlined" fullWidth value={pantryData} onChange={(e) => setPantryData(e.target.value)}/>
            <Stack width="100%" direction={"row"} spacing={2}>
              <Button variant="outlined"
              onClick={() => {
                addPantry(pantryData)
                setPantryData("")
                handleSwitchClose("newPantry")
              }}><AddIcon />Add</Button>
              <Button variant="outlined"
              onClick={() => {
                setPantryData("")
                handleSwitchClose("newPantry")
              }}>Cancel</Button>
            </Stack>

          </Stack> */}
        </Box>
      </Modal>

      {/*Sign Out Modal*/}
      <Modal
        open={switches.signOut}
        onClose={() => handleSwitchClose('signOut')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Are you sure you want to sign out?
          </Typography>
            <Stack width="100%" direction={"row"} spacing={2}>
              <Button variant="outlined"
              onClick={ () => {
                handleSwitchClose("signOut")
                handleSignOut()}}>Yes</Button>
              <Button variant="outlined"
              onClick={() => {
                handleSwitchClose("signOut")
              }}>No</Button>
            </Stack>
        </Box>
      </Modal>




      <Box width="30%" height="100%"  display={"flex"} flexDirection={"column"} border={'1px solid #333'}>
        <Typography variant={"h4"} color={"#333"} textAlign={"center"} align={"center"} sx={{lineHeight: 2.5, height:"9.9%"}}>Your Pantries</Typography>
        <Stack width="23vw" height="85.2%" border={"1px solid #333"} direction={"column"} overflow={"auto"} sx={{boxSizing: 'border-box'}}>
          {pantries.map((name) => (
              <Button
              variant="outlined"
              sx={{height:"11vh", minHeight:"11vh", borderRadius: 0,textTransform: 'none', color:"black", borderColor:"black","&:hover":{borderColor:"black",color:"black",backgroundColor:"#e2e2e2"}}} 
              key={name}
              onClick={async () => {

                switchPantry(name)
                updatePantry()}}>{name}</Button>
          ))} 
        </Stack>
        <Button variant="outlined" name="newPantry"
        sx={{ position: 'absolute', bottom: 0, width: "23vw", height: "5%", borderRadius: "0px",color:"black", borderColor:"black", "&:hover":{borderColor:"black",color:"black",backgroundColor:"#e2e2e2"}}}
        onClick={(e) => handleSwitchOpen(e)}>Add New Pantry</Button>
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


    
       {switches.showAddItem ? (
          <Stack width="100%"  direction={"row"} height="8.5%" justifyContent={"center"} alignItems={"center"} spacing={2}>
            <TextField id="outlined-basic" label="New Item" variant="outlined" value={itemData.name}  sx={{width: "400px"}} onChange={(e) => setItemData((prevState) => ({...prevState, name: e.target.value}))}/>
            <TextField id="outlined-basic" width="20%" type="number" label="Quantity" variant="outlined"  value={itemData.quantity}  inputProps={{ min: 1 }} sx={{width: "400px"}} onChange={(e) => setItemData((prevState) => ({...prevState, quantity: e.target.value}))}/>
            <Button variant="contained" 
            onClick={() => {
              addItem(itemData)
              setItemData({name:"",quantity:1})
              setSwitches((prevState) => ({...prevState, showAddItem: false}))
            }}><AddIcon />Add</Button>
            <Button variant="contained"
            onClick={() => {
              setItemData({name:"",quantity:1})
              setSwitches((prevState) => ({...prevState, showAddItem: false}))
            }}>Cancel</Button>
          </Stack>
            )
            : switches.find ? (
              <Stack width="100%" direction={"row"} spacing={2} height="8.5%" justifyContent={"center"} alignItems={"center"}>
                <TextField id="outlined-basic" label="Type in Item's name" variant="outlined" value={itemData.name} sx={{width: "400px"}}
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
              <Stack direction={"row"} width="100%" height="8.5%" alignItems={"center"} justifyContent={"center"} spacing={2}>
                <Button variant="contained" onClick={() => setSwitches((prevState) => ({...prevState, showAddItem: true}))}><AddIcon />Add New Item</Button>
                <Button variant="contained" onClick={() => setSwitches((prevState) => ({...prevState, find: true}))}><SearchIcon />Find Item</Button>
                <Button variant="contained" onClick={() => setSwitches((prevState) => ({...prevState, signOut: true}))} sx={{position:"absolute", right:"2%"}}><LogoutIcon />Sign Out</Button>
              </Stack>
            )
            }

        <Box width="100%" height="90%" border={'1px solid #333'} sx={{borderLeft: 0}}>
            <Stack width="100%" height="100%" position={"relative"} spacing={2} overflow={'auto'} >
              {pantry.map(({name,count,image}) => (
                  <Box 
                    key={name}
                    width="100%"
                    minHeight="200px"
                    display={'flex'}
                    justifyContent={"space-between"}
                    alignItems={'center'}
                    bgcolor={'#f0f0f0'}
                    paddingX={5}>
                    <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} spacing={5}>
                    {image ? (
                      <Card>
                        <CardMedia
                        component="img"
                        image={image}
                        alt="boxes"
                        sx={{height:"auto",maxWidth:"150px"}}
                        />
                      </Card>
                    ) 
                    :
                    (
                      <Box sx={{height:"150px", width:"150px"}}></Box>
                    ) 
                    }
                    <Typography variant={'h3'} color={'#333'} textAlign={"center"}>
                        {name}
                    </Typography>
                    </Stack>
                    <Typography variant={'h3'} color={'#333'} textAlign={"center"} sx={{position:"absolute", left:"50%"}}>
                        {count}
                    </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" name="edit"
                    onClick={(e) => {
                      setItemData((prevState) => ({...prevState,name: name}))
                      handleSwitchOpen(e)
                    }}><CreateIcon />Edit</Button>
                    <Button variant="contained" color="error" name="delete"
                    onClick={() =>{
                      removeItem(name,count)
                    }}><DeleteIcon />Remove</Button>
                  </Stack>
                </Box>
              ))} 
          </Stack>
        </Box>

    </Box>
    </Stack>
  );
}
