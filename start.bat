@echo off
echo START RUNNING CAPTURE
start "capture" cmd /k "conda activate david && python capture.py"

timeout /t 15

echo START RUNNING NARRATOR
start "capture" cmd /k "conda activate david &&set OPENAI_API_KEY=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&&set ELEVENLABS_API_KEY=b36a456cc2707104415c314ce5eeac0f&&set ELEVENLABS_VOICE_ID=0UxdNWAQ8l9YJ71sFabP&& python narrator.py"