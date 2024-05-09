import david from 'assets/images/david.jpg';
import { useEffect, useRef, useState } from 'react';
import {request_new_script} from 'src/js/narrator';
const DavidRenderer = () => {
    const [dialog, setDialog] = useState("Hi I am david");
    const [dialogAnimated, setDialogAnimated] = useState("Hi I am david");
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);
    const imageTestRef = useRef(null);

    const renderDialog = () =>{
        let newSubString = dialog.substring(0, index + 1);
        setDialogAnimated(newSubString);
    }
    const animateDialog = () => {
        if(index < dialog.length){
            setIndex(index + 1);
            renderDialog();
        }
    }
    
    const invokeGPTAnalysis = async () => {
        //request_new_script("text", "image");
    }

    useEffect(() => {
    //    console.log(request_new_script);
        // request_new_script(imageTestRef.current.src);
        // intervalRef.current = setInterval(animateDialog, 200);
        // return () => {
        //     clearInterval(intervalRef.current);
        // }
    }, []);


    //todo add an interval to animate the dialog

    return (<div className="DavidRenderer">
        <img ref={imageTestRef} src={david} alt="" />
        <h3>{dialogAnimated}</h3>
        <button onClick={()=>{
            request_new_script(imageTestRef.current.src);
        }}>Analyze!</button>
    </div> );
}
 
export default DavidRenderer;