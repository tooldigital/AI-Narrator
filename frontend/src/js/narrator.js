import OpenAI from "openai";
import { imageUrlToBase64 } from "./utils";

export const API_ENDPOINT = "http://localhost:5000/api/v1/narrator";

export const client = new OpenAI({
  organization: "org-maZWjFUFgduZOdh5wOWPvxdy",
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const check_for_adidas = async () => {
  // try {
  // const response = await fetch(API);
  // const data = await response.json();
  // console.log(data);
  // } catch (error) {
  // console.error(error);
  // }

  //! temp
  return new Promise((resolve, reject) => {
    resolve(false);
  });
};

export const chatGPT_describe_image_template = (base64_image) => {
  return [
    {
      role: "user",
      content: [
        { type: "text", text: "Describe this image" },
        {
          type: "image_url",
          image_url: {
            "url":`${base64_image}`
          },
        },
      ],
    },
  ];
};

export const analyze_image = async (base64_image, isadidas = false) => {
  let systemrole = `
        You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
        Make it snarky and funny. Don't repeat yourself. Make it short maximum two sentences. If you see anything remotely interesting or you see differences with previous pictures, make a big deal about it!
        `;
  if (isadidas) {
    systemrole = `
        You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
        Make it snarky and funny. Make it realy short maximum two sentences, not too much words. An Adidas logo has been detected. Elaborate on that. See if the item that has the logo on it is some piece of clothing. Make a big deal about it!
        `;
  }

  // let response = client.chat.completions.create(
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemrole,
      },
    ].concat(chatGPT_describe_image_template(base64_image)),
    max_tokens: 500,
  });

  // for await (const chunk of response) {
  //     response.stdout.write(chunk.choices[0]?.delta?.content || "");
  // }

  let response_text = response.choices[0].message.content;
  return response_text;
};

export const get_elevenlabs_audio = async (text) => {
    const options = {
        method: 'POST',
        headers: {'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY, 'Content-Type': 'application/json'},
        body: JSON.stringify({text:text})
    };

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${import.meta.env.VITE_ELEVENLABS_VOICE_ID}`, options)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        return url;
    } catch (error) {
        console.log("error getting audio from ElevenLabs",error);
    }
}

export const play_audio = (text) => {
  const audio = new Audio(text);
  audio.play();
};

//call on loop
export const request_new_script = async (image, isBase64=false) => {
  // # path to your image
  let image_path = image;
  let base64_image = isBase64?image : await imageUrlToBase64(image_path);
  // #check for signs of Adidas
  let adidasfound = check_for_adidas(image_path);

  // # analyze posture
  console.log("👀 David is watching...");
  const david_text = analyze_image(base64_image, adidasfound);

  console.log("🎙️ David says:");
  return david_text;

//   play_audio(david_text);
  // # wait for 5 seconds
  // time.sleep(5)
};