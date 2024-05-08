@echo off
echo START RUNNING CAPTURE
start "capture" cmd /k "conda activate david && python capture.py"

timeout /t 15

echo START RUNNING NARRATOR
start "capture" cmd /k "conda activate david &&set OPENAI_API_KEY=put_key_here&&set ELEVENLABS_API_KEY=put_key_here&&set ELEVENLABS_VOICE_ID=put_key_here&& python narrator.py"