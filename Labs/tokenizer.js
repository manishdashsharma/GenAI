import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const enc = new Tiktoken(o200k_base);

function demonstrateTokenization() {
    console.log("=== Tokenization Demo ===\n");

    const examples = [
        "Hello, how are you?",
        "Hey, How are you?",
        "The quick brown fox jumps over the lazy dog",
        "Generative AI transforms how we work with technology"
    ];

    examples.forEach((text, index) => {
        console.log(`Example ${index + 1}: "${text}"`);

        const tokens = enc.encode(text);
        console.log(`Token IDs: [${tokens.join(', ')}]`);
        console.log(`Token count: ${tokens.length}`);

        const decoded = enc.decode(tokens);
        console.log(`Decoded: "${decoded}"`);
        console.log(`Match original: ${decoded === text}`);
        console.log('-'.repeat(50));
    });
}

function tokenizeStep() {
    console.log("\n=== Step-by-step Tokenization ===\n");

    const text = "hello world";
    console.log(`Original text: "${text}"`);

    console.log("Characters:", text.split('').map(c => `'${c}'`).join(', '));

    const tokens = enc.encode(text);
    console.log(`Tokens: [${tokens.join(', ')}]`);

    tokens.forEach((token, index) => {
        const decoded = enc.decode([token]);
        console.log(`Token ${index}: ${token} -> "${decoded}"`);
    });
}

function compareModels() {
    console.log("\n=== Model Comparison (Simulated) ===\n");

    const text = "Hey, How are you?";
    const gptTokens = enc.encode(text);

    console.log("GPT-4o style tokenization:");
    console.log(`Input: "${text}"`);
    console.log(`Token count: ${gptTokens.length}`);
    console.log(`Tokens: [${gptTokens.join(', ')}]`);

    console.log("\nGoogle Gemma-7b style (simulated):");
    console.log(`Input: "${text}"`);
    console.log("Token count: 7");
    console.log("Tokens: [2, 6750, 235269, 2299, 708, 692, 235336]");

    console.log(`\nDifference: GPT-4o uses ${gptTokens.length} tokens vs Gemma's 7 tokens`);
}

demonstrateTokenization();
tokenizeStep();
compareModels();

export { enc as tokenizer };