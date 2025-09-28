import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();

async function main() {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: "Hey, How are you?" }],
  });

  console.log(response.choices[0].message.content);
}

async function systemPrompt() {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that only understand js , dont answer anything else aprat from js",
      },
      { role: "user", content: "Write a function that adds two numbers" },
    ],
  });
  console.log(response.choices[0].message.content);
}

async function fewShotPrompt() {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that only understand js , dont answer anything else aprat from js
                Example:
                Q: Write a function that adds two numbers
                A: function add(a, b) {
                    return a + b;
                }

                Q: Do you know about python?
                A: I am sorry, I can only help with JavaScript related queries.
            `,
      },
      { role: "user", content: "Write a function that adds two numbers" },
      {
        role: "assistant",
        content: "function add(a, b) {\n  return a + b;\n}",
      },
      {
        role: "user",
        content: "Write a function that multiplies two numbers in python",
      },
    ],
  });
  console.log(response.choices[0].message.content);
}

async function chainPrompt() {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant who works on START, THINK and OUTPUT fromat.
        For a given user query first think and breakdown the problem into smaller subproblems.
        For any question, you will first think about the answer and then provide the final answer.
        also, Beore outputting the final answer, make sure to verify the answer once again.

        Rules:
        - Always think step by step.
        - Always verify the answer once again before providing the final answer.
        - Always provide the final answer in OUTPUT section.

        Output JSON format:
        {"step":"START | THINK | OUTPUT", content:"string"}

        Example:
        User: Can you slove 3 + 4 * 10 - 4 * 3
        Assistant: {"step":"START", "content":"The user wants to solve the mathematical expression 3 + 4 * 10 - 4 * 3."}
        Assistant: {"step":"THINK", "content":"To solve this expression, I will follow the order of operations (PEMDAS/BODMAS). First, I will handle the multiplication operations, then perform the addition and subtraction from left to right."}
        Assistant: {"step":"OUTPUT", "content":"The final answer is 31."}

        `,
      },
      { role: "user", content: "Can you slove 3 + 4 * 10 - 4 * 3 - 4 * 3" },
    ],
  });
  console.log(response.choices[0].message.content);
}

async function chainPromptAuto() {
  console.log("🚀 Starting Chain Prompt Auto Process...\n");

  const systemMessage = {
    role: "system",
    content: `You are a helpful assistant who works on START, THINK and OUTPUT format.

    IMPORTANT: You must respond with ONLY ONE step at a time, not all steps together.

    Rules:
    - Only respond with ONE JSON object per response
    - Wait for the next prompt to continue to the next step
    - Only respond with valid JSON format, no additional text
    - No extra whitespace or line breaks

    Output JSON format (ONE step only):
    {"step":"START | THINK | OUTPUT", "content":"string"}

    Process:
    1. First response should be START step
    2. Second response should be THINK step
    3. Third response should be OUTPUT step
    `
  };

  const messages = [
    systemMessage,
    { role: "user", content: "Can you solve 3 + 4 * 10 - 4 * 3 - 4 * 3" }
  ];

  const expectedSteps = ["START", "THINK", "OUTPUT"];
  let currentStepIndex = 0;

  console.log("📝 Problem: Can you solve 3 + 4 * 10 - 4 * 3 - 4 * 3\n");

  while (currentStepIndex < expectedSteps.length) {
    const expectedStep = expectedSteps[currentStepIndex];

    try {
      console.log(`⏳ Processing step: ${expectedStep}...`);

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages
      });

      const responseContent = response.choices[0].message.content.trim();
      console.log(`💬 Raw response: ${responseContent}`);

      // Parse JSON response - handle multiple JSON objects or formatting issues
      let parsedResponse;
      try {
        // Try to parse as single JSON first
        parsedResponse = JSON.parse(responseContent);
      } catch (parseError) {
        try {
          // Try to extract first JSON object if multiple exist
          const lines = responseContent.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
              parsedResponse = JSON.parse(trimmedLine);
              console.log(`🔧 Extracted JSON from multi-line response`);
              break;
            }
          }

          if (!parsedResponse) {
            throw new Error('No valid JSON found');
          }
        } catch (secondParseError) {
          console.log(`❌ Failed to parse JSON: ${parseError.message}`);
          console.log(`🔄 Retrying...`);
          continue;
        }
      }

      const { step, content } = parsedResponse;

      // Check if we got the expected step
      if (step === expectedStep) {
        const stepEmoji = step === "START" ? "🚀" : step === "THINK" ? "🤔" : "✅";
        console.log(`${stepEmoji} ${step}: ${content}\n`);

        // Add assistant's response to conversation
        messages.push({
          role: "assistant",
          content: responseContent
        });

        // Add next step prompt if not the last step
        if (currentStepIndex < expectedSteps.length - 1) {
          const nextStep = expectedSteps[currentStepIndex + 1];
          messages.push({
            role: "user",
            content: `Continue to ${nextStep} step.`
          });
        }

        currentStepIndex++;
      } else {
        console.log(`⚠️  Expected step '${expectedStep}' but got '${step}'. Continuing...`);

        // Add the response anyway and move to next step
        messages.push({
          role: "assistant",
          content: responseContent
        });

        currentStepIndex++;
      }

    } catch (error) {
      console.log(`❌ Error in step ${expectedStep}: ${error.message}`);
      console.log(`🔄 Retrying step...`);

      // Add a short delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log("🎉 Chain Prompt Auto Process Completed!");
}
// main();
// systemPrompt();
// fewShotPrompt();
// chainPrompt();
chainPromptAuto();
