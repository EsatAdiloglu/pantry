import React, { useState, useRef } from "react";
import { Camera } from "react-camera-pro";
import { Box, Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const CameraComponent = () => {
  const cameraRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => setCameraOpen(true)}
      >
        <PhotoCameraIcon sx={{mr:1}}/>Use Camera
      </Button>

      {/* Dialog for Camera */}
      <Dialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{height:"600px"}}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Camera ref={cameraRef} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CameraComponent;
