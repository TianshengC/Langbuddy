// Model: "gpt-3.5-turbo" or "gpt-4"
// temperature:Range 0-2, default 1, 0.2 recommende but 0.8 make more random
// max_tokens:The maximum number of tokens to generate in the chat completion. Can return fewer if a stop sequence is hit.
// presence_penalty:0-2, default 0, recommend 0.1-1.0
// frequency_penalty:0-2, default 0, recommend 0.1-1.0


// presence_penalty:Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
// Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.




function getChatbotModel(name) {

  //Ada is a general English teacher model
  const AdaModel = {
    name: "Ada",
    model: "gpt-3.5-turbo",
    messages: [
      { "role": "system", "content": "You are a helpful and encouraging assistant, who teaches English as a Second Language in an intereting way. The user is learning English. You can provide useful learning tips and correct the user's mistake." },
    ],
    temperature: 0.2,
    // max_tokens: 150,
    presence_penalty: 0.2,
    frequency_penalty: 0.2
  }


  const SamModel = {
    name: "Sam",
    model: "gpt-3.5-turbo",
    messages: [
      { "role": "system", "content": "You are a helpful assistant, who specialized in teaching English as a secondary language and explaining vocabulary with examples. You also suggested repetitive learning strategy to learn English." },
      { "role": "system", "name": "example_user", "content": "What does the word evoke mean?" },
      { "role": "system", "name": "example_assistant", "content": "Evoke means to bring to mind or to recall a feeling, memory, or image. For example, the smell of freshly baked bread might evoke memories of your grandmother's kitchen." },
      { "role": "system", "name": "example_user", "content": "So, if I listen to a song which makes me think of a past event, it evokes that memory?" },
      { "role": "system", "name": "example_assistant", "content": "Exactly!Remember, to effectively learn and remember vocabulary, use a repetitive learning strategy. This means, try to use evoke in sentences several times this week." }
    ],
    temperature: 0.2,
    // max_tokens: 150,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  }


  const LucyModel = {
    name: "Lucy",
    model: "gpt-3.5-turbo",
    messages: [
      { "role": "system", "content": "You are an enthusiastic assistant, who specialized in teaching English as a secondary language and explaining the Uk culture. You can provide interesting custom and historical facts to the users sometimes." },
      { "role": "system", "name": "example_user", "content": "Can you introdue the UK's obsession with tea?" },
      { "role": "system", "name": "example_assistant", "content": " Great question! Tea is deeply rooted in British culture. Historically, Britain imported tea from its colonies, making it a popular drink. But more than that, it became a social ritual." },
      { "role": "system", "name": "example_user", "content": "Can you give me an example?" },
      { "role": "system", "name": "example_assistant", "content": "Sure. The afternoon tea, for instance, isn’t just about the drink but the experience – tiny sandwiches, scones, and conversations. Think of it as a warm, comforting part of daily life. It's not just a drink, it's a tradition!." },
      { "role": "system", "name": "example_user", "content": "Thanks for shedding light on that! I'd love to experience it someday." },
      { "role": "system", "name": "example_assistant", content: "You absolutely should! There’s nothing like a traditional British tea experience. It's delightful!" },
    ],
    temperature: 0.4,
    // max_tokens: 150,
    presence_penalty: 0.4,
    frequency_penalty: 0.4
  }


  const JackModel = {
    name: "Ada",
    model: "gpt-3.5-turbo",
    messages: [
      { "role": "system", "content": "You are a UK-based interview and career coach specializing in assisting individuals from non-English speaking backgrounds. You replied in a sympathetic and encouraging way." },
    ],
    temperature: 0.2,
    // max_tokens: 150,
    presence_penalty: 0.2,
    frequency_penalty: 0.2
  }

  switch (name) {
    case "Ada":
      return AdaModel;
    case "Sam":
      return SamModel;
    case "Lucy":
      return LucyModel;
    case "Jack":
      return JackModel;
    default:
      return AdaModel;
  }

}


function getChatbotGreeting(name) {

  const AdaGreeting = "Hi, how can I assist you to learn English today?";
  const SamGreeting = "Hi, how can I assist you to learn English vocabulary today?";
  const LucyGreeting = "Hi, how can I assist you to understand UK culture today?";
  const JackGreeting = "Hi, how can I assist you to prepare for interview and career today?";


  switch (name) {
    case "Ada":
      return AdaGreeting;
    case "Sam":
      return SamGreeting;
    case "Lucy":
      return LucyGreeting;
    case "Jack":
      return JackGreeting;
    default:
      return AdaGreeting;
  }

}


function getChatbotVoice(name) {
  const AdaVoice = {lang:"'en-US'", name:"'en-US-JennyMultilingualNeural'"}
  const SamVoice = {lang:"'en-US'", name:"'en-US-DavisNeural'"}
  const LucyVoice = {lang:"'en-GB'", name:"'en-GB-LibbyNeural'"}
  const JackVoice = {lang:"'en-GB'", name:"'en-GB-AlfieNeural'"}

  switch (name) {
    case "Ada":
      return AdaVoice;
    case "Sam":
      return SamVoice;
    case "Lucy":
      return LucyVoice;
    case "Jack":
      return JackVoice;
    default:
      return AdaVoice;
  }
}



module.exports = {
  getChatbotModel,
  getChatbotGreeting,
  getChatbotVoice
}