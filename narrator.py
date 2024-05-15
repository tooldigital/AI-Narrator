import os
from openai import OpenAI
import base64
import json
import time
import simpleaudio as sa
import errno
from elevenlabs import generate, play, set_api_key, voices
from ultralytics import YOLO

model = YOLO('./adidas_yolov8_m_e25.pt')

client = OpenAI()

set_api_key(os.environ.get("ELEVENLABS_API_KEY"))


def check_for_adidas(image_path):
    while True:
        try:
            results = model(image_path, conf=0.3, imgsz=640, verbose=False)
            results[0].save("./frames/result.jpg")
            if(len(results[0].boxes)>0):
                return True
            else:
                return False

        except IOError as e:
            if e.errno != errno.EACCES:
                # Not a "file in use" error, re-raise
                raise
            # File is being written to, wait a bit and retry
            time.sleep(0.1)


def encode_image(image_path):
    while True:
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode("utf-8")
        except IOError as e:
            if e.errno != errno.EACCES:
                # Not a "file in use" error, re-raise
                raise
            # File is being written to, wait a bit and retry
            time.sleep(0.1)


def play_audio(text):
    audio = generate(text, voice=os.environ.get("ELEVENLABS_VOICE_ID"))

    unique_id = base64.urlsafe_b64encode(os.urandom(30)).decode("utf-8").rstrip("=")
    dir_path = os.path.join("narration", unique_id)
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, "audio.wav")

    with open(file_path, "wb") as f:
        f.write(audio)

    # play(audio)
    play(audio,False, False)


def generate_new_line(base64_image):
    return [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Describe this image"},
                {
                    "type": "image_url",
                    "image_url": f"data:image/jpeg;base64,{base64_image}",
                },
            ],
        },
    ]


def analyze_image(base64_image, script, isadidas=False):

    systemrole = """
                You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
                Make it snarky and funny. Don't repeat yourself. Make it short maximum two sentences. If you see anything remotely interesting or you see differences with previous pictures, make a big deal about it!
                """
    if isadidas==True:
        systemrole = """
                You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
                Make it snarky and funny. Make it realy short maximum two sentences, not too much words. An Adidas logo has been detected. Elaborate on that. See if the item that has the logo on it is some piece of clothing. Make a big deal about it!
                """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": systemrole,
            },
        ]
        + script
        + generate_new_line(base64_image),
        max_tokens=500,
        )
    
    response_text = response.choices[0].message.content
    return response_text


def main():
    script = []

    while True:
        # path to your image
        image_path = os.path.join(os.getcwd(), "./frames/frame.jpg")

        #check for signs of Adidas
        adidasfound = check_for_adidas(image_path)
        #print("ADIDAS FOUND "+str(adidasfound))

        # getting the base64 encoding
        base64_image = encode_image(image_path)

        # analyze posture
        print("👀 David is watching...")
        analysis = analyze_image(base64_image, script=script, isadidas=adidasfound)

        print("🎙️ David says:")
        print(analysis)

        play_audio(analysis)

        #script = script + [{"role": "assistant", "content": analysis}]

        #script =  [{"role": "assistant", "content": analysis}]


        # wait for 5 seconds
        time.sleep(5)


if __name__ == "__main__":
    main()
