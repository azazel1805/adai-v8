import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ListeningPracticeContent, DictionaryResult, IdentifiedObject, Message, TenseExplanation, TenseReadingExercise, TenseListeningExercise, TenseWritingExercise, AcademicGrammarExplanation, AcademicGrammarReadingExercise, AcademicGrammarListeningExercise, AcademicGrammarWritingExercise, Rephrasing, ParagraphAnalysis, AnalyzedSentence, DetailedTranslation, HomeworkSolution, GrammarAnalysis, PronunciationFeedback, ContentAnalysisResult, WeatherInfo, StorySegment, ToneAnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // This is a fallback for development. In the target environment, process.env.API_KEY will be set.
  console.warn("API_KEY is not set. Using a placeholder. This will fail in production.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });


export const getTutorResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], newMessage: string, language: 'Turkish' | 'English') => {
  const model = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      systemInstruction: `You are an expert English teacher. The user is a Turkish speaker learning English. You can answer questions about grammar, vocabulary, culture, or anything related to learning English. Respond in ${language} as requested by the user. Be friendly, encouraging, and clear in your explanations.`,
    },
    history,
  });
  const result = await model.sendMessage({ message: newMessage });
  return result.text;
};

export const generateEssayTopics = async (theme: string, essayType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate 5 interesting and specific ${essayType} essay topics about "${theme}" for an English learner. Return as a simple list.`,
  });
  return response.text;
};

export const generateEssayOutline = async (topic: string, essayType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create a detailed 5-paragraph ${essayType} essay outline for the topic: "${topic}". Include a thesis statement, and 3-4 bullet points for each of the three body paragraphs.`,
  });
  return response.text;
};

export const writeFullEssay = async (topic: string, essayType: string, outline?: string) => {
  const prompt = outline
    ? `Write a full, well-structured 5-paragraph ${essayType} academic essay on the topic: "${topic}", following this outline:\n\n${outline}`
    : `Write a full, well-structured 5-paragraph ${essayType} academic essay on the topic: "${topic}".`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });
  return response.text;
};

export const generateListeningPractice = async (level: string): Promise<ListeningPracticeContent> => {
    const prompt = `Generate a listening practice exercise for an English learner at the ${level} CEFR level. The passage should be 150-200 words. Create 3-4 multiple-choice questions about the passage. Each question must have 4 options. The options should be the full text of the answer. The correctAnswer must be the letter (A, B, C, or D) of the correct option.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text: {
                        type: Type.STRING,
                        description: `A listening passage of 150-200 words suitable for a ${level} learner.`
                    },
                    questions: {
                        type: Type.ARRAY,
                        description: "An array of 3 to 4 multiple-choice questions based on the passage.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: {
                                    type: Type.STRING,
                                    description: "The question text."
                                },
                                options: {
                                    type: Type.ARRAY,
                                    description: "An array of 4 possible answer strings.",
                                    items: { type: Type.STRING }
                                },
                                correctAnswer: {
                                    type: Type.STRING,
                                    description: "The letter corresponding to the correct option (e.g., 'A', 'B', 'C', or 'D')."
                                }
                            },
                            required: ['question', 'options', 'correctAnswer']
                        }
                    }
                },
                required: ['text', 'questions']
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        // Basic validation
        if (parsed.text && Array.isArray(parsed.questions)) {
            return parsed as ListeningPracticeContent;
        } else {
            throw new Error("Invalid JSON structure received from API.");
        }
    } catch (e) {
        console.error("Failed to parse JSON for listening practice:", e);
        console.error("Received text:", response.text);
        throw new Error("Could not generate listening practice content.");
    }
};

export const generateAudio = async (text: string, voiceName: string, speed: number = 1.0): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
          speed: speed,
      },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Audio generation failed.");
  }
  return base64Audio;
};

export const getWordDetails = async (word: string): Promise<DictionaryResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Provide a detailed dictionary entry for the English word "${word}". The user is a Turkish speaker. Provide Turkish translations for definitions, synonyms, and antonyms. If there are no synonyms or antonyms, return an empty array.`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                pronunciation: { type: Type.STRING },
                definitions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { english: { type: Type.STRING }, turkish: { type: Type.STRING } }, required: ['english', 'turkish'] } },
                synonyms: { type: Type.OBJECT, properties: { english: { type: Type.ARRAY, items: { type: Type.STRING } }, turkish: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['english', 'turkish'] },
                antonyms: { type: Type.OBJECT, properties: { english: { type: Type.ARRAY, items: { type: Type.STRING } }, turkish: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['english', 'turkish'] },
                etymology: { type: Type.STRING }
            },
            required: ['pronunciation', 'definitions', 'synonyms', 'antonyms', 'etymology']
        }
    }
  });
  return JSON.parse(response.text.trim());
};

export const identifyImageObjects = async (base64Image: string, mimeType: string): Promise<IdentifiedObject[]> => {
  const imagePart = { inlineData: { data: base64Image, mimeType } };
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: "Identify the main objects in this image. Provide their names in both English and Turkish." }] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    englishName: { type: Type.STRING },
                    turkishName: { type: Type.STRING }
                },
                required: ['englishName', 'turkishName']
            }
        }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateSpeakingGoals = async (scenario: string): Promise<string[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List 3-4 simple, bullet-point goals for a conversation scenario: "${scenario}". Example: "Order a coffee by name". Return as a JSON array of strings.`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return JSON.parse(response.text.trim());
};

export const getSpeakingScenarioResponse = async (history: Message[], userInput: string, scenario: string): Promise<string> => {
    const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    const model = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: `You are an AI conversation partner. The user is practicing a speaking scenario: "${scenario}". Your role is to act as the other person in the conversation. Keep your responses concise and natural, like in a real conversation. If the user says something that doesn't make sense, gently guide them back to the topic.`,
        },
        history: chatHistory,
    });
    const result = await model.sendMessage({ message: userInput });
    return result.text;
};

export const evaluateSpeakingPerformance = async (conversation: Message[], scenario: string, goals: string[]): Promise<string> => {
    const transcript = conversation.map(m => `${m.role}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Evaluate the user's performance in the following conversation transcript for the scenario "${scenario}" based on these goals: ${goals.join(', ')}. Provide constructive feedback on grammar, vocabulary, and fluency in a friendly, encouraging tone. Keep the feedback to 3-4 sentences. \n\nTranscript:\n${transcript}`,
    });
    return response.text;
};

export const generateTenseExplanation = async (tense: string): Promise<TenseExplanation> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Explain the English tense "${tense}" for a Turkish speaker.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tenseName: { type: Type.STRING },
                    structure: { type: Type.OBJECT, properties: { positive: { type: Type.STRING }, negative: { type: Type.STRING }, question: { type: Type.STRING } } },
                    usage: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { use: { type: Type.STRING }, example: { type: Type.STRING }, translation: { type: Type.STRING } } } }
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const generateTenseReadingExercise = async (tense: string): Promise<TenseReadingExercise> => {
    const prompt = `Generate a reading comprehension exercise for an English learner to practice the "${tense}" tense. The passage should be 150-200 words and prominently feature the "${tense}" tense. Create 3-4 multiple-choice questions about the passage. Each question must have 4 options. The options should be the full text of the answer. The correctAnswer must be the letter (A, B, C, or D) of the correct option.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    passage: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING }
                            },
                            required: ['question', 'options', 'correctAnswer']
                        }
                    }
                },
                required: ['passage', 'questions']
            }
        }
    });
    try {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.passage && Array.isArray(parsed.questions)) {
            return parsed as TenseReadingExercise;
        }
        throw new Error("Invalid structure in API response for Tense Reading Exercise");
    } catch (e) {
        console.error("Failed to parse Tense Reading Exercise", e, "Response text:", response.text);
        throw new Error("Could not generate reading exercise.");
    }
};

export const generateTenseListeningExercise = async (tense: string): Promise<TenseListeningExercise> => {
    // Re-use the reading exercise generation as the structure is identical
    return generateTenseReadingExercise(tense) as Promise<TenseListeningExercise>;
};

export const generateTenseWritingExercise = async (tense: string): Promise<TenseWritingExercise> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3 diverse writing prompts for a user to practice the "${tense}" tense.`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { prompts: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
    });
    return JSON.parse(response.text.trim());
};

export const evaluateWrittenSentence = async (sentence: string, tense: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Does the sentence "${sentence}" correctly use the "${tense}" tense? Provide brief, constructive feedback in Turkish. Explain why it is correct or incorrect.`,
    });
    return response.text;
};

export const generateAcademicGrammarExplanation = async (topic: string): Promise<AcademicGrammarExplanation> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Explain the English academic grammar topic "${topic}" for a Turkish speaker.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    topicName: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    usage: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { use: { type: Type.STRING }, example: { type: Type.STRING }, translation: { type: Type.STRING } } } }
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const generateAcademicGrammarReadingExercise = async (topic: string): Promise<AcademicGrammarReadingExercise> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a challenging (B2-C1 level) fill-in-the-blanks reading exercise for the academic grammar topic "${topic}". Use complex sentence structures and academic vocabulary. The passage should have 3-5 blanks represented by {n}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { passage: { type: Type.STRING }, answers: { type: Type.ARRAY, items: { type: Type.STRING } } } }
        }
    });
    return JSON.parse(response.text.trim());
};

export const generateAcademicGrammarListeningExercise = async (topic: string): Promise<AcademicGrammarListeningExercise> => {
    return generateAcademicGrammarReadingExercise(topic); // Same structure, can reuse
};

export const generateAcademicGrammarWritingExercise = async (topic: string): Promise<AcademicGrammarWritingExercise> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3 diverse writing prompts for a user to practice the academic grammar topic "${topic}".`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { prompts: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
    });
    return JSON.parse(response.text.trim());
};

export const evaluateWrittenAcademicSentence = async (sentence: string, topic: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Does the sentence "${sentence}" correctly use the academic grammar topic "${topic}"? Provide brief, constructive feedback in Turkish. Explain why it is correct or incorrect.`,
    });
    return response.text;
};

export const rephraseSentence = async (sentence: string, styles: string[]): Promise<Rephrasing[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rephrase the sentence "${sentence}" in the following styles: ${styles.join(', ')}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        style: { type: Type.STRING },
                        sentence: { type: Type.STRING }
                    },
                    required: ['style', 'sentence']
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const analyzeParagraph = async (paragraph: string): Promise<ParagraphAnalysis> => {
    const prompt = `Analyze the following English paragraph for a Turkish speaker. Break it down sentence by sentence. For each sentence, provide the original text, a simplified version, its structural role (e.g., Topic Sentence, Supporting Detail, Example, Concluding Sentence), and a Turkish translation of the simplified sentence.

Paragraph:
"${paragraph}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sentences: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                original: { type: Type.STRING },
                                simplified: { type: Type.STRING },
                                role: { type: Type.STRING },
                                turkishTranslation: { type: Type.STRING }
                            },
                            required: ['original', 'simplified', 'role', 'turkishTranslation']
                        }
                    }
                },
                required: ['sentences']
            }
        }
    });
    try {
        const parsed = JSON.parse(response.text.trim());
        if (Array.isArray(parsed.sentences)) {
            return parsed;
        }
        throw new Error("Invalid structure in API response");
    } catch (e) {
        console.error("Failed to parse paragraph analysis", e, "Response text:", response.text);
        throw new Error("Could not analyze paragraph.");
    }
};

export const getDetailedTranslation = async (sentence: string): Promise<DetailedTranslation> => {
    const prompt = `Analyze and translate the following sentence for a Turkish speaker. First, detect if it's English or Turkish. Then translate it to the other language. Provide a detailed grammatical analysis of the original sentence, explain the translation rationale (why certain words/phrases were chosen), and offer 2-3 alternative translations with brief explanations of their nuances. Finally, provide a single, simple English keyword that best represents the main subject of the sentence, suitable for an image search. IMPORTANT: The grammar analysis, translation rationale, and the explanation for alternatives MUST be in Turkish.

Sentence to analyze: "${sentence}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    directTranslation: { type: Type.STRING, description: "The most direct and accurate translation." },
                    grammarAnalysis: { type: Type.STRING, description: "A detailed grammatical analysis of the original sentence, written in Turkish." },
                    translationRationale: { type: Type.STRING, description: "An explanation of why key words and structures were chosen for the translation, written in Turkish." },
                    alternatives: {
                        type: Type.ARRAY,
                        description: "An array of alternative translations.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                translation: { type: Type.STRING, description: "An alternative translation." },
                                explanation: { type: Type.STRING, description: "A brief explanation of the nuance or context for this alternative, written in Turkish." }
                            },
                            required: ['translation', 'explanation']
                        }
                    },
                    imageQueryKeyword: { type: Type.STRING, description: "A single, simple English keyword for an image search." }
                },
                required: ['directTranslation', 'grammarAnalysis', 'translationRationale', 'alternatives', 'imageQueryKeyword']
            }
        }
    });
    
    try {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.directTranslation && parsed.grammarAnalysis && Array.isArray(parsed.alternatives) && parsed.imageQueryKeyword) {
            return parsed as DetailedTranslation;
        } else {
            throw new Error("Invalid JSON structure for translation received from API.");
        }
    } catch (e) {
        console.error("Failed to parse JSON for detailed translation:", e);
        console.error("Received text:", response.text);
        throw new Error("Could not generate detailed translation.");
    }
};

export const getHomeworkHelp = async (params: { text: string; image?: { base64Data: string; mimeType: string; } }): Promise<HomeworkSolution> => {
  const { text, image } = params;

  const prompt = `You are an expert English teacher for a Turkish speaker. The user needs help with the provided English question/exercise.
Your task is to provide a comprehensive solution and explanation in TURKISH.
Analyze the user's request (from text and/or image) and return a structured JSON object.

User's question/context: "${text}"`;

  let contents: any;

  if (image) {
    contents = {
      parts: [
        { inlineData: { data: image.base64Data, mimeType: image.mimeType } },
        { text: prompt }
      ]
    };
  } else {
    contents = prompt;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: contents,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                correctAnswer: { type: Type.STRING, description: "The correct answer to the question, stated clearly and concisely." },
                stepByStepSolution: {
                    type: Type.ARRAY,
                    description: "An array of steps explaining how to arrive at the solution. Each step should be simple and clear.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            stepNumber: { type: Type.INTEGER },
                            title: { type: Type.STRING, description: "A short, descriptive title for the step." },
                            explanation: { type: Type.STRING, description: "The detailed explanation for this step, in Turkish." }
                        },
                        required: ["stepNumber", "title", "explanation"]
                    }
                },
                mainExplanation: { type: Type.STRING, description: "The main, overarching explanation of the relevant grammar rule, vocabulary, or logic, in Turkish." },
                incorrectOptionsAnalysis: {
                    type: Type.ARRAY,
                    description: "If it's a multiple-choice question, an analysis of why the other options are incorrect. If not applicable, return an empty array.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            option: { type: Type.STRING, description: "The incorrect option (e.g., 'Option A')." },
                            reason: { type: Type.STRING, description: "The reason why this option is incorrect, in Turkish." }
                        },
                        required: ["option", "reason"]
                    }
                }
            },
            required: ["correctAnswer", "stepByStepSolution", "mainExplanation", "incorrectOptionsAnalysis"]
        }
    }
  });

  try {
    const parsed = JSON.parse(response.text.trim());
    return parsed as HomeworkSolution;
  } catch(e) {
    console.error("Failed to parse JSON for homework help", e);
    console.error("Received text:", response.text);
    throw new Error("Could not get homework help.");
  }
};

export const checkGrammar = async (text: string): Promise<GrammarAnalysis> => {
  const prompt = `You are an expert English grammar checker for a Turkish speaker. Analyze the following English text for grammatical errors, spelling mistakes, and punctuation issues. Provide a corrected version of the text and a list of the errors found. For each error, explain in TURKISH why it was incorrect and what the rule is.

Text to analyze:
"${text}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correctedText: {
            type: Type.STRING,
            description: "The full text with all errors corrected."
          },
          errors: {
            type: Type.ARRAY,
            description: "An array of objects, each detailing a specific error found in the text.",
            items: {
              type: Type.OBJECT,
              properties: {
                errorText: {
                  type: Type.STRING,
                  description: "The specific incorrect phrase or word from the original text."
                },
                correction: {
                  type: Type.STRING,
                  description: "The suggested correction for the errorText."
                },
                explanation: {
                  type: Type.STRING,
                  description: "A detailed explanation in Turkish of the grammar rule and why the original text was incorrect."
                },
                errorType: {
                  type: Type.STRING,
                  description: "The category of the error (e.g., 'Verb Tense', 'Punctuation', 'Spelling', 'Article Usage')."
                }
              },
              required: ['errorText', 'correction', 'explanation', 'errorType']
            }
          }
        },
        required: ['correctedText', 'errors']
      }
    }
  });

  try {
    const parsed = JSON.parse(response.text.trim());
    return parsed as GrammarAnalysis;
  } catch(e) {
    console.error("Failed to parse JSON for grammar check", e);
    console.error("Received text:", response.text);
    throw new Error("Could not check grammar.");
  }
};

export const getPronunciationFeedback = async (originalText: string, transcribedText: string): Promise<PronunciationFeedback> => {
  const prompt = `You are an expert English pronunciation coach for a Turkish speaker. The user was trying to say the following sentence:
Original Sentence: "${originalText}"

Their attempt was transcribed by a speech-to-text system as:
Transcribed Sentence: "${transcribedText}"

Please analyze the differences and provide feedback. If the transcription is identical or very close to the original, congratulate the user. Otherwise, identify specific mistakes and provide clear, actionable advice in TURKISH on how to improve. Focus on common pronunciation errors Turkish speakers make.

For example, if the original is "I think this is a tree" and the transcribed is "I tink dis is a tree", you should point out the 'th' sound being pronounced as 't' or 'd' and the long 'ee' sound in 'tree'.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallFeedback: {
            type: Type.STRING,
            description: "Overall feedback about the user's pronunciation, in Turkish. Be encouraging."
          },
          mistakes: {
            type: Type.ARRAY,
            description: "An array of specific pronunciation mistakes found. If none, return an empty array.",
            items: {
              type: Type.OBJECT,
              properties: {
                mispronouncedWord: {
                  type: Type.STRING,
                  description: "The word or phrase from the transcribed text that was mispronounced."
                },
                intendedWord: {
                  type: Type.STRING,
                  description: "The corresponding word or phrase from the original text."
                },
                feedback: {
                  type: Type.STRING,
                  description: "Specific, actionable feedback in Turkish on how to correct the pronunciation for this specific word/sound."
                }
              },
              required: ['mispronouncedWord', 'intendedWord', 'feedback']
            }
          }
        },
        required: ['overallFeedback', 'mistakes']
      }
    }
  });
  
  try {
    const parsed = JSON.parse(response.text.trim());
    return parsed as PronunciationFeedback;
  } catch(e) {
    console.error("Failed to parse JSON for pronunciation feedback", e);
    console.error("Received text:", response.text);
    throw new Error("Could not get pronunciation feedback.");
  }
};

export const analyzeContentFromText = async (text: string): Promise<ContentAnalysisResult> => {
    const prompt = `You are an English learning assistant for a Turkish speaker. Analyze the following English text. Based on the text, generate a concise summary in Turkish, a list of 5-7 important vocabulary words with their Turkish definitions, and 3-4 multiple-choice comprehension questions. Each question must have 4 options and a correct answer letter ('A', 'B', 'C', or 'D').

English Text:
---
${text}
---

Provide the output in a structured JSON format.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: {
                        type: Type.STRING,
                        description: "A concise summary of the text in Turkish."
                    },
                    vocabulary: {
                        type: Type.ARRAY,
                        description: "A list of 5-7 important vocabulary words from the text.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                word: { type: Type.STRING, description: "The English word." },
                                definition: { type: Type.STRING, description: "The Turkish definition of the word in the context of the text." }
                            },
                            required: ['word', 'definition']
                        }
                    },
                    questions: {
                        type: Type.ARRAY,
                        description: "An array of 3-4 multiple-choice questions based on the text.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING, description: "The question text." },
                                options: {
                                    type: Type.ARRAY,
                                    description: "An array of 4 possible answer strings.",
                                    items: { type: Type.STRING }
                                },
                                correctAnswer: {
                                    type: Type.STRING,
                                    description: "The letter corresponding to the correct option (e.g., 'A', 'B', 'C', or 'D')."
                                }
                            },
                            required: ['question', 'options', 'correctAnswer']
                        }
                    }
                },
                required: ['summary', 'vocabulary', 'questions']
            }
        }
    });

    try {
        const parsed = JSON.parse(response.text.trim());
        // Basic validation
        if (parsed.summary && Array.isArray(parsed.vocabulary) && Array.isArray(parsed.questions)) {
            return parsed as ContentAnalysisResult;
        } else {
            throw new Error("Invalid JSON structure received from API for content analysis.");
        }
    } catch (e) {
        console.error("Failed to parse JSON for content analysis:", e);
        console.error("Received text:", response.text);
        throw new Error("Could not analyze the provided content.");
    }
};

export const generateWeeklyLearningPlan = async (level: string, goal: string): Promise<string[]> => {
    const prompt = `Create a personalized, 7-day English learning plan for a user at the ${level} CEFR level whose goal is "${goal}".
    The user is a Turkish speaker.
    Provide 5-7 actionable and diverse tasks for the week.
    Tasks should include a mix of grammar, vocabulary, reading, writing, listening, and speaking practice.
    For example: "Review the 'Past Perfect Continuous' tense and write 3 example sentences." or "Do one B2-level listening practice and summarize it." or "Practice a speaking scenario about 'making a complaint'."
    Return the tasks as a JSON array of strings.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    
    try {
        const parsed = JSON.parse(response.text.trim());
        if (Array.isArray(parsed)) {
            return parsed;
        }
        throw new Error("Invalid structure for learning plan.");
    } catch (e) {
        console.error("Failed to parse learning plan:", e, "Response text:", response.text);
        throw new Error("Could not generate learning plan.");
    }
};

export const getWeatherInfo = async (latitude: number, longitude: number): Promise<WeatherInfo> => {
    const prompt = `Based on the location with latitude ${latitude} and longitude ${longitude}, provide the current weather. Return a structured JSON object. The description must be in Turkish, and also provide an English version of the description. The icon should be a single, appropriate emoji.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    city: { type: Type.STRING, description: "The name of the city." },
                    temperature: { type: Type.NUMBER, description: "The current temperature in Celsius." },
                    description: { type: Type.STRING, description: "A brief weather description in Turkish (e.g., 'Parçalı Bulutlu')." },
                    englishDescription: { type: Type.STRING, description: "A brief weather description in English (e.g., 'Partly Cloudy')." },
                    icon: { type: Type.STRING, description: "A single emoji representing the weather (e.g., '☀️', '☁️', '🌧️')." }
                },
                required: ['city', 'temperature', 'description', 'englishDescription', 'icon']
            }
        }
    });

    try {
        const parsed = JSON.parse(response.text.trim());
        return parsed as WeatherInfo;
    } catch (e) {
        console.error("Failed to parse weather info:", e, "Response text:", response.text);
        throw new Error("Could not get weather information.");
    }
};

export const getInteractiveStorySegment = async (genre: string, history: { userChoice: string }[], forceEnd: boolean = false): Promise<StorySegment> => {
    const isStart = history.length === 0;
    
    const historyPrompt = history.map((turn, index) => `Part ${index + 1} ended. User chose: "${turn.userChoice}". Now generate Part ${index + 2}.`).join('\n');

    const prompt = isStart
        ? `Start an interactive, branching adventure story for an English learner at a B1 CEFR level in the "${genre}" genre. The story should be engaging and divided into parts. Each part should describe a scene or situation and end with 2-3 clear, distinct choices for the user to make. The story should eventually reach a conclusion. Generate a simple, 2-3 word English phrase for an image search that visually represents this part of the story.
        
        Example of a good image prompt: "dark forest path", "ancient castle ruins", "futuristic city street".`
        : `The user is playing an interactive story in the "${genre}" genre. Here is the history of their choices:
        ${historyPrompt}
        
        ${forceEnd 
            ? "The user has decided to end the story. Generate a concluding part of the story that wraps up the adventure based on the last choice. The conclusion should be satisfying. Set the isEnding flag to true and provide a concluding story part without choices." 
            : "Continue the story based on the last choice. Generate the next part of the story. It should describe the new scene or situation and end with 2-3 new, distinct choices. If this is a natural conclusion to the story, set the isEnding flag to true and provide a concluding story part without choices."
        } Generate a new, simple 2-3 word English phrase for an image search that represents this new part.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    storyPart: { type: Type.STRING, description: "The text for the current segment of the story." },
                    choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 text choices for the user. Should be an empty array if isEnding is true." },
                    imagePrompt: { type: Type.STRING, description: "A simple 2-3 word phrase for an image search (e.g., 'mysterious cave', 'abandoned spaceship')." },
                    isEnding: { type: Type.BOOLEAN, description: "Set to true if this is a concluding part of the story." }
                },
                required: ['storyPart', 'choices', 'imagePrompt', 'isEnding']
            }
        }
    });

    try {
        const parsed = JSON.parse(response.text.trim());
        return parsed as StorySegment;
    } catch (e) {
        console.error("Failed to parse story segment:", e, "Response text:", response.text);
        throw new Error("Could not generate story segment.");
    }
};

export const analyzeStyleAndTone = async (text: string, audience: string, goal: string): Promise<ToneAnalysisResult> => {
  const prompt = `You are an expert English writing coach for a Turkish speaker. Analyze the following English text based on its intended audience and goal.

Original Text:
---
${text}
---

Intended Audience: "${audience}"
Communication Goal: "${goal}"

Your task is to provide a comprehensive analysis in TURKISH. Return a structured JSON object with the following format:
- detectedTones: An array of strings describing the tones found in the text (e.g., "Formal", "Friendly", "Assertive").
- overallAnalysis: A paragraph in Turkish explaining if the current tone is appropriate for the audience and goal, and what could be improved.
- revisedText: A revised version of the original text that better fits the audience and goal.
- suggestions: An array of specific suggestions. For each suggestion, provide the original phrase, the suggested replacement, and a clear reason in Turkish for the change.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedTones: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          overallAnalysis: {
            type: Type.STRING,
            description: "The overall analysis in Turkish."
          },
          revisedText: {
            type: Type.STRING,
            description: "The fully revised text."
          },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                suggested: { type: Type.STRING },
                reason: { type: Type.STRING, description: "The reason for the suggestion, in Turkish." }
              },
              required: ['original', 'suggested', 'reason']
            }
          }
        },
        required: ['detectedTones', 'overallAnalysis', 'revisedText', 'suggestions']
      }
    }
  });

  try {
    const parsed = JSON.parse(response.text.trim());
    return parsed as ToneAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON for style & tone analysis", e);
    console.error("Received text:", response.text);
    throw new Error("Could not analyze style and tone.");
  }
};

export const generateScrambledSentence = async (level: string): Promise<{ sentence: string }> => {
    const prompt = `Generate a single, grammatically correct English sentence appropriate for a CEFR ${level} learner. The sentence should be between 7 and 15 words long. The sentence must not end with any punctuation like a period, question mark, or exclamation mark. Return it as a JSON object with a single key 'sentence'.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sentence: {
                        type: Type.STRING,
                        description: "A single English sentence without trailing punctuation."
                    }
                },
                required: ['sentence']
            }
        }
    });

    try {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.sentence) {
            return parsed;
        }
        throw new Error("Invalid structure for scrambled sentence.");
    } catch (e) {
        console.error("Failed to parse scrambled sentence:", e, "Response text:", response.text);
        throw new Error("Could not generate sentence.");
    }
};
