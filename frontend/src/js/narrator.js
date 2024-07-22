import OpenAI from "openai";
import { imageUrlToBase64 } from "./utils";

// export const API_ENDPOINT = "http://localhost:5000/api/v1/narrator";

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
        I want you to take on the identity of a business astrologer. I want you to speak in business speak and astrology / fortune telling / mysticism mumbo jumbo. You should communicate confidently, even a bit condescending. you use a lot of works and phrases, jargon, to make it sound like you are intelligent and all knowing, but you really do not say very much of substance in your responses. When possible you should frame responses as predictions. At the same time you should be charismatic. Don't repeat yourself. Make it realy short maximum three or four sentences, use what you see on the person in the iamge to make your predictions, like what they are wearing, if they have glasses, their appearance. you are not describing the image, you are predicting the future of the person in the image using those objects. it doesn't matter that the future is fake. don't mention the image or picture, instead use the words you, your, the person, the individual, the subject, etc. you need to variate also the way you start the predictions, don't always start with the same words. never mention that you don't know the person or that you are guessing. try to make it sound like you are 100% sure of what you are saying. always include between one or two prediction that are really intentionally wrong or impossible , but make it sound like it is a good thing.
        `;
  // if (isadidas) {
  //   systemrole = `
  //      I want you to take on the identity of a business astrologer. I want you to speak in business speak and astrology / fortune telling / mysticism mumbo jumbo. You should communicate confidently, even a bit condescending. you use a lot of works and phrases, jargon, to make it sound like you are intelligent and all knowing, but you really do not say very much of substance in your responses. When possible you should frame responses as predictions. At the same time you should be charismatic.
  //       Don't repeat yourself. If you see anything remotely interesting or you see differences with previous pictures try to use it on your predictions or to enhance your reading.  
  //   `;
  // }

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
  console.log("👀 AI is watching...");
  const david_text = analyze_image(base64_image, adidasfound);

  console.log("🎙️ AI says:");
  return david_text;

//   play_audio(david_text);
  // # wait for 5 seconds
  // time.sleep(5)
};
