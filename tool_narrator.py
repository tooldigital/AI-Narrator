#https://www.youtube.com/watch?v=FqXmE8KaIR0
import os
from openai import AsyncOpenAI
import base64
import json
import time
import simpleaudio as sa
import errno
from elevenlabs import generate, play, set_api_key, voices
from ultralytics import YOLO
import asyncio


asyncClient = AsyncOpenAI()

system_role_regular =  """You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
                    Make it snarky and funny. Don't repeat yourself. Make it short maximum two sentences. If you see anything remotely interesting or you see differences with previous pictures, make a big deal about it!
                    """

system_role_adidas = """
                You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
                Make it snarky and funny. Make it realy short maximum two sentences, not too much words. An Adidas logo has been detected. Elaborate on that. See if the item that has the logo on it is some piece of clothing. Make a big deal about it!
                """

system_role_intermediate = """
                You are Sir David Attenborough. Narrate as if it is a nature documentary.
                You reflect on something that you already saw. Make it snarky and funny. Act like if you just already saw this.
                """


async def generate_intermediate_random():
    print("START GENERATION")
    response = await asyncClient.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": system_role_intermediate,
            },
        ]+
        [{"role": "user", "content": "tell me a fun fact about nature and wildlife, do no start with Ah, start with something like:'did you know', use maximum 20 words"}],
        max_tokens=300,
        temperature=1.2
        )
    
    response_text = response.choices[0].message.content
    return response_text


def callbackRegular(result):
    print(result.result())

def callbackIntermediate(result):
    print(result.result())


latestresult = ''
latestintermediate = ''

areweinregular = True
arewewaiting = False

async def main():
    global areweinregular
    global arewewaiting
    while True:
        print("PLIPLOE")
        if areweinregular:
            if arewewaiting==False:
                print("start regular")
                event_loop.create_task(generate_intermediate_random()).add_done_callback(callbackIntermediate)
                arewewaiting = True
            else:
                print("waiting for regular")

        time.sleep(5)
    
    #event_loop.create_task(generate_intermediate_random()).add_done_callback(callback)


event_loop = asyncio.get_event_loop()
event_loop.run_until_complete(main())
event_loop.run_forever()