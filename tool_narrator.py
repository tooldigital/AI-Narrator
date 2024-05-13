#https://www.youtube.com/watch?v=FqXmE8KaIR0
#https://www.youtube.com/watch?v=Qb9s3UiMSTA

import os
import base64
import json
import time
import asyncio
import pygame

from pygame import mixer
from elevenlabs import save
from elevenlabs.client import AsyncElevenLabs
from openai import AsyncOpenAI

system_role_regular =  """You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
                    Make it snarky and funny. Don't repeat yourself. Make it short maximum two sentences. If you see anything remotely interesting or you see differences with previous pictures, make a big deal about it!
                    """

system_role_adidas = """
                You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
                Make it snarky and funny. Make it realy short maximum two sentences, not too much words. An Adidas logo has been detected. Elaborate on that. See if the item that has the logo on it is some piece of clothing. Make a big deal about it!
                """

system_role_intermediate = """
                You are Sir David Attenborough. Narrate as if it is a nature documentary.
                You reflect on something that you already saw. Make it snarky and funny. Act like if you just already saw this.  Make it short maximum one sentence
                """


openaiclient = AsyncOpenAI(api_key="sk-proj-qNzIoxfBr0QVkgf9h5JnT3BlbkFJo4eNUIS71FHGSzIiy4s7")
elevenclient = AsyncElevenLabs(api_key="b36a456cc2707104415c314ce5eeac0f")


pygame.init()
MUSIC_END = pygame.USEREVENT+1
pygame.mixer.music.set_endevent(MUSIC_END)


latestintermediate = ''
latestimagedescription = ''
arewegeneratingtextforimage = False
arewegeneratingtextforintermediate= False
arewegeneratingaudioforimage= False
arewegeneratingaudioforintermediate= False
isaudioplaying = False



class ImageDescribed:
    text = ''
    sound_file = ''
    isplayed = False
    isworking = False

    def __init__(self,_text='',_sound_file='',_isplayed=False):
        self.text = _text
        self.sound_file = _sound_file
        self.isplayed = _isplayed

class TextDescribed:
    text = ''
    sound_file = ''
    isplayed = False

    def __init__(self,_text='',_sound_file='',_isplayed=False):
        self.text = _text
        self.sound_file = _sound_file
        self.isplayed = _isplayed


array_imagesdescribed = []
array_textdescribed = []

#################
##### UTILS #####
#################
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


###################
##### PROGRAM #####
###################

async def generate_audio(future, _text,object):
    
    object.isworking = True

   
    print("START GENERATING AUDIO")
    unique_id = base64.urlsafe_b64encode(os.urandom(30)).decode("utf-8").rstrip("=")
    kwargs = {
        'voice': "0UxdNWAQ8l9YJ71sFabP",
        'text': _text,
    }
    results = await elevenclient.generate(**kwargs)

    out = b''
    async for value in results:
        out += value
    save(out, unique_id+'.mp3')

    print("DONE GENERATING AUDIO")
  
    object.sound_file = unique_id+'.mp3'
    object.isworking = False    
    future.set_result("done")
    


def startPlayingaudio(_file):
    global isaudioplaying
    isaudioplaying = True
    mixer.init()
    mixer.music.load(_file)
    mixer.music.play()
   

async def generate_intermediate_random(future,_text,object):
    global latestintermediate,arewegeneratingtextforintermediate
    object.isworking = True
    print("START DESCRIBING INTERMEDIATE")
    arewegeneratingtextforintermediate = True
    response = await openaiclient.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": system_role_intermediate,
                },
            ]+
            [{"role": "user", "content": "rephrase this text, treat it like it is something that you just saw"+_text}],
            max_tokens=300,
            temperature=1.2
            )
    
    print("DONE DESCRIBING INTERMEDIATE")
    response_text = response.choices[0].message.content
    latestintermediate = response_text

    object.text = response_text
    object.isworking = False

    arewegeneratingtextforintermediate = False

    future.set_result("done")


async def raconte_image(future,object):
   
    print("START DESCRIBING IMAGE")
    object.isworking = True

    image_path = os.path.join(os.getcwd(), "./frames/frame.jpg")
    base64_image = encode_image(image_path)

    response = await openaiclient.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "system",
                "content": system_role_regular,
            },
        ]
        + generate_new_line(base64_image),
        max_tokens=500,
        )
    response_text = response.choices[0].message.content
    latestimagedescription = response_text


    object.text = response_text
    object.isworking = False
    print("DONE DESCRIBING IMAGE")
    future.set_result("done")


async def main():
    global isaudioplaying
    #create the first object
    imagedes = ImageDescribed()
    textdes = TextDescribed()
  
    array_imagesdescribed.append(imagedes)
    array_textdescribed.append(textdes)
   

    while True:

        for event in pygame.event.get():
                if event.type == MUSIC_END:
                    isaudioplaying = False
                    
                    if array_imagesdescribed[0].isplayed:
                        #array_imagesdescribed[0].text = ""
                        #array_imagesdescribed[0].sound_file = ""
                        array_imagesdescribed[0].isplayed = False
                    
                    #if array_textdescribed[0].isplayed:
                    #    #array_textdescribed[0].text = ""
                    #    array_textdescribed[0].isplayed = False

                   
        if array_imagesdescribed[0].text=="" and array_imagesdescribed[0].isworking==False:
            loop = asyncio.get_running_loop()
            future = loop.create_future()
            asyncio.create_task(raconte_image(future, array_imagesdescribed[0]))
        elif array_imagesdescribed[0].text and array_imagesdescribed[0].sound_file=="" and array_imagesdescribed[0].isworking==False:
            #we have a text, but no sound file yet
            #create the sound file
            loop = asyncio.get_running_loop()
            future = loop.create_future()
            asyncio.create_task(generate_audio(future, array_imagesdescribed[0].text, array_imagesdescribed[0]))

            #we can also generate a new text already for teh inetrmediate
            #loop_interm = asyncio.get_running_loop()
            #_future = loop_interm.create_future()
            #asyncio.create_task(generate_intermediate_random(_future, array_imagesdescribed[0].text, array_textdescribed[0]))


        elif array_imagesdescribed[0].text and array_imagesdescribed[0].sound_file and array_imagesdescribed[0].isworking==False:
            #we have everything, play sound
            if isaudioplaying == False and array_imagesdescribed[0].isplayed == False:
                print("start playing image generated text")
                array_imagesdescribed[0].isplayed = True
                startPlayingaudio(array_imagesdescribed[0].sound_file)
            
            
            if pygame.mixer.music.get_pos() >9000 and pygame.mixer.music.get_pos()<10000:
                print("take a new picture")
                array_imagesdescribed[0].text = ""
                array_imagesdescribed[0].sound_file = ""


        '''if array_textdescribed[0].text and array_textdescribed[0].sound_file=="" and array_textdescribed[0].isworking==False:
            print("generate sound file for text intermediate")
            loop = asyncio.get_running_loop()
            future = loop.create_future()
            asyncio.create_task(generate_audio(future, array_textdescribed[0].text, array_textdescribed[0]))

            #maybe already start generating the next image
            array_imagesdescribed[0].sound_file=""
            array_imagesdescribed[0].text=""


        elif array_textdescribed[0].text and array_textdescribed[0].sound_file and array_textdescribed[0].isworking==False:
            #we have everything, play sound
            if isaudioplaying == False and array_textdescribed[0].isplayed == False:
                print("start playing generated intermediate")
                await asyncio.sleep(2)
                array_textdescribed[0].isplayed = True
                startPlayingaudio(array_textdescribed[0].sound_file)'''



        await asyncio.sleep(1)

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(main())
