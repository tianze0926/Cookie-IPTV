import { useState, useEffect, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Alert, AlertColor } from '@mui/material';

export interface MessageInfo {
  timestamp: number
  message: string
  severity?: AlertColor
}

export default function ConsecutiveSnackbars(props: {
  messageInfo: MessageInfo
}) {
  const [open, setOpen] = useState(false);

  // only on updates except initial mount
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setOpen(true);
      return () => setOpen(false);
    }
  }, [props.messageInfo]);

  const handleClose = () => setOpen(false);

  return (
    <>
      {(props.messageInfo.severity === undefined)
        ? <Snackbar
          key={props.messageInfo.timestamp}
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
          message={props.messageInfo.message}
        />
        : <Snackbar
          key={props.messageInfo.timestamp}
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
        >
          <Alert
            // onClose={handleClose}
            severity={props.messageInfo.severity}
          >
            {props.messageInfo.message}
          </Alert>
        </Snackbar>
      }
    </>
  );

}
