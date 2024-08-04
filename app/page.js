"use client";
import {Box, Stack, Typography, Button, Modal, TextField} from "@mui/material"
import {useState, useEffect} from "react";
import { app }  from "@/firebase"
import {getAuth, signInWithPopup, GoogleAuthProvider} from "firebase/auth"
import { useRouter } from "next/navigation"
import Tracker from "./tracker/page"
// import { Google } from "@mui/icons-material";


const Home = () => {
    const [user, setUser] = useState("")
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user){
                setUser(user)
            }
            else {
                setUser(null)
            }
        });
        
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        try{
            await signInWithPopup(auth,provider);
            router.push("/tracker");
        }
        catch (error){
            console.error("Error signing with Google: ", error)
        }
    };
    return (
        <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        flexDirection={"column"}
        alignItems={'center'}
        gap={2}>
            
            {user ? (
                <Tracker />
            )
            :
            (
                <Stack direction={"column"} width="1200px" height="500px" border={"1px solid black"} gap={10} alignItems={"center"}>
                    <Typography variant={"h1"} color={'#333'} textAlign={"center"} border={"1px solid black"} sx={{width:"100%"}}>
                        Welcome to Pantry Tracker!
                    </Typography>
                    <Button variant="contained" sx={{width:"500px", height:"50px"}} 
                    onClick={signInWithGoogle}>
                        Get Started
                    </Button>
                </Stack>
            )
            }
        </Box>
    );
};

export default Home