import './DavidRenderer.scss';
import david from 'assets/images/david-front.png';
import davidGlare from 'assets/images/david-glass-glare.png';
import { useEffect, useRef, useState } from 'react';
import {get_elevenlabs_audio, play_audio, request_new_script} from 'src/js/narrator';
const DavidRenderer = () => {
    const [dialog, setDialog] = useState("Hi I am david");
    const [dialogAnimated, setDialogAnimated] = useState("Hi I am david");
    const [screenShot, setScreenShot] = useState(null);
    const [startedLooking, setStartedLooking] = useState(false);
    const [isLooking, setIsLooking] = useState(false);
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);
    const imageTestRef = useRef(null);
    const screenshotRef = useRef(null);
    const videoLeftRef = useRef(null);
    const videoRightRef = useRef(null); 
    const audio = useRef(null);
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

    const startupCamera = () => {
        navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
            let videoR = videoLeftRef.current
            videoR.srcObject = stream;
            videoR.onloadedmetadata = (e) => {
                videoR.play();
            }

            let videoL = videoRightRef.current
            videoL.srcObject = stream;
            videoL.onloadedmetadata = (e) => {
                videoL.play();
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }

    const captureFrameFromVideoStream = () => {
        let video = videoLeftRef.current;
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let dataUrl = canvas.toDataURL('image/png');
        // console.log(dataUrl);
        // request_new_script(imageTestRef.current.src, true);
        setScreenShot(dataUrl);
    }
    
    const invokeGPTAnalysis =  async () => {
        console.log(screenShot);
        if(screenShot){
            if(audio.current){
                console.log(audio.current.ended, audio.current.paused);
                if(!audio.current.ended || !audio.current.paused){
                    return;
                }
            }
            let newText = await request_new_script(screenShot, true);
            setDialogAnimated(newText);
            let audioSrc = await get_elevenlabs_audio(newText)
            if(!audio.current){
                audio.current = new Audio(audioSrc);
                
                audio.current.onended = (event) => {
                    console.log("audio ended");
                    setStartedLooking(false);
                };
            }else{
                audio.current.pause();
                audio.current.src = audioSrc;
            }
            audio.current.play();       
            // console.log(audio);
        }
    }

    const toogleLoop = () => {
        if(!intervalRef.current){
            setIsLooking(true);
            captureFrameFromVideoStream();
            intervalRef.current = setInterval(captureFrameFromVideoStream, 4000);
        }else{
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsLooking(false);
        }
    }

    useEffect(() => {
        if(screenShot){
            console.log("startedLooking", startedLooking);
            if(!startedLooking){
                setStartedLooking(true);
                invokeGPTAnalysis();
            }
        }
    }, [screenShot]);

    useEffect(() => {
        startupCamera();
        // console.log(request_new_script);
        // request_new_script(imageTestRef.current.src, true);
        // captureFrameFromVideoStream();
        // intervalRef.current = setInterval(captureFrameFromVideoStream, 8000);
        // return () => {
        //     clearInterval(intervalRef.current);
        // }
    }, []);


    //todo add an interval to animate the dialog

    return (<div className="DavidRenderer">
        { screenShot && <img ref={screenshotRef} className='currentCapture' src={screenShot} alt="" />}
        <div className='david-container'>
            <img ref={imageTestRef} src={david} alt="" />
            <div className='capture-L'>
                <video ref={videoLeftRef} alt="" />
            </div>
            <div className='capture-R' >
                <video ref={videoRightRef} alt="" />
            </div>
            <img className='glare' src={davidGlare} alt="" />
        </div>
       <div className='controls'>
       <h3>{dialogAnimated}</h3>
        <button onClick={()=>{
            toogleLoop();
        }}>{isLooking?"Stop Observing":"Start Looking"}</button>
       </div>
    </div> );
}
 
export default DavidRenderer;