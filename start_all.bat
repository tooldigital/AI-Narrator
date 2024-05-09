@echo off
echo START RUNNING CAPTURE
start "capture" cmd /k "conda activate david && python capture.py"


echo START RUNNING NARRATOR

timeout /t 15
start "capture" cmd /k "conda activate david &&set OPENAI_API_KEY=sk-proj-aR5ts21yHpZn4sHXBv3PT3BlbkFJOyjfCp4sEfdYEu43UlpD&&set ELEVENLABS_API_KEY=b36a456cc2707104415c314ce5eeac0f&&set ELEVENLABS_VOICE_ID=0UxdNWAQ8l9YJ71sFabP&& python narrator.py"