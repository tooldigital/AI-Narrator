import asyncio

from pygame import mixer
from elevenlabs import play,save
from elevenlabs.client import AsyncElevenLabs



eleven = AsyncElevenLabs(
  api_key="b36a456cc2707104415c314ce5eeac0f"
)


async def generate_audio(future):
    kwargs = {
    'voice': "0UxdNWAQ8l9YJ71sFabP",
    'text': 'This is an example sentence',
    }
    results = await eleven.generate(**kwargs)

    out = b''
    async for value in results:
        out += value
    save(out, 'output.mp3')

   
    mixer.init()
    mixer.music.load("output.mp3")
    mixer.music.play()
    future.set_result("done")


async def main():
    
    i=0
    while True:
        if i==3: 
            print("start generating voice")
            loop = asyncio.get_running_loop()
            future = loop.create_future()
            asyncio.create_task(generate_audio(future))

        i=i+1
        print(i)
        await asyncio.sleep(1)

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(main())