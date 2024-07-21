import './DavidRenderer.scss';
import david from 'assets/images/david-front.png';
import davidGlare from 'assets/images/david-glass-glare.png';
import { useEffect, useRef, useState } from 'react';
import { get_elevenlabs_audio, play_audio, request_new_script } from 'src/js/narrator';
import astroBg from 'assets/images/astro-bg-small.png';
import astroGlass from 'assets/images/astro-top-small.png';

const pregenTiming = 3;
const DavidRenderer = () => {

    const [dialog, setDialog] = useState("...");
    const [dialogAnimated, setDialogAnimated] = useState("...");
    const [screenShot, setScreenShot] = useState(null);
    const [startedLooking, setStartedLooking] = useState(false);
    const [isLooking, setIsLooking] = useState(false);
    const [index, setIndex] = useState(0);
    const [audioSrc, setAudioSrc] = useState(null);
    const [canPlayAudio, setCanPlayAudio] = useState(false);
    const [newScriptReady, setNewScriptReady] = useState(false);
    const intervalRef = useRef(null);
    const screenshotRef = useRef(null);
    const videoLeftRef = useRef(null);

    const audio = useRef(null);
    const nextAudioSrc = useRef(null);
    const canGenerateAudio = useRef(true);

    const isFirstTime = useRef(true);

    const renderDialog = () => {
        let newSubString = dialog.substring(0, index + 1);
        setDialogAnimated(newSubString);
    }
    const animateDialog = () => {
        if (index < dialog.length) {
            setIndex(index + 1);
            renderDialog();
        }
    }

    const startupCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                let videoR = videoLeftRef.current
                videoR.srcObject = stream;
                videoR.onloadedmetadata = (e) => {
                    videoR.play();
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

    const generateAudioScript = async () => {
        let newText = await request_new_script(screenShot, true);
        setDialogAnimated(newText);
        console.log(newText);
        let _audioSrc = await get_elevenlabs_audio(newText)
        // setAudioSrc(_audioSrc);
        return _audioSrc;
    }

    const invokeGPTAnalysis = async () => {
        // console.log(screenShot);
        if (screenShot) {
            if (audio.current) {
                console.log(audio.current.ended, audio.current.paused);
                if (!audio.current.ended || !audio.current.paused) {
                    return;
                }
            }
            console.log(audio.current);
            if (!audio.current) {
                nextAudioSrc.current = await generateAudioScript();
                // console.log("currentAudioSrc", nextAudioSrc.current);
                audio.current = new Audio(nextAudioSrc.current);

                audio.current.ontimeupdate = async (event) => {
                    if (canGenerateAudio.current) {
                        if (audio.current.duration - audio.current.currentTime < pregenTiming) {
                            console.log("===generaring new script===");
                            canGenerateAudio.current = false;
                            setCanPlayAudio(false);
                            setNewScriptReady(false);
                            nextAudioSrc.current = await generateAudioScript();
                            setNewScriptReady(true);

                            // setAudioSrc(_audioSrc);
                            console.log("===done generating new script===");
                            // invokeGPTAnalysis();
                        }
                        // shouldGenerateAudio.current = false;
                        // setStartedLooking(false);
                        // invokeGPTAnalysis();
                    }
                };
                audio.current.onended = (event) => {
                    setCanPlayAudio(true);
                    if( isFirstTime.current){
                        audio.current = null
                    }
                    console.log("audio ended", audio.current);
                    // setStartedLooking(false);
                };
                audio.current.play();
            } else {
                audio.current.pause();
                audio.current.src = nextAudioSrc.current;
                audio.current.play();
            }
            // console.log(audio);
        }
    }

    const toogleLoop = () => {
        console.log(intervalRef.current);
        if (!intervalRef.current) {
            setIsLooking(true);
            captureFrameFromVideoStream();
            intervalRef.current = setInterval(captureFrameFromVideoStream, 4000);
        } else {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsLooking(false);
            audio.current.pause();
            audio.current = null;
            setCanPlayAudio(true);
            setNewScriptReady(false);
        }
    }
    useEffect(() => {
        if (!isLooking) {
            isFirstTime.current = true
        }
    }, [isLooking]);

    useEffect(() => {
        if (newScriptReady) {
            setAudioSrc(nextAudioSrc.current)
        }
    }, [newScriptReady]);

    useEffect(() => {

        if (isLooking) {
            // console.log("//--------audio update--------//");
            // console.log("condition check:", canPlayAudio, newScriptReady);
            if (canPlayAudio && newScriptReady) {
                audio.current.src = audioSrc;
                audio.current.play();
                canGenerateAudio.current = true;
                setDialogAnimated("...");
                // console.log("//--------success--------//");

            } else {
                // console.log("//--------Fail--------//");

            }
        }
    }, [canPlayAudio, audioSrc]);

    useEffect(() => {
        if (screenShot) {
            if (isFirstTime.current) {
                isFirstTime.current = false;
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
        {screenShot && <img ref={screenshotRef} className='currentCapture' src={screenShot} alt="" />}
        <img className='astro-bg' src={astroBg} alt="" />
        <div className='capture-L'>
            <video ref={videoLeftRef} alt="" />
        </div>
        <img className='astro-top' src={astroGlass} alt="" />
        <div className='controls'>
            <h3>{dialogAnimated}</h3>
            <button onClick={() => {
                toogleLoop();
            }}>{isLooking ? "Stop" : "Tell me my fortune"}</button>
        </div>
        <div className='shadow'>
        </div>
    </div>);
}

export default DavidRenderer;