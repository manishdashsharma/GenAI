import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function createEmbedding(text, model = "text-embedding-3-small") {
    try {
        console.log(`Creating embedding for: "${text}"`);
        console.log(`Using model: ${model}`);

        const embedding = await openai.embeddings.create({
            model: model,
            input: text,
            encoding_format: "float",
        });

        return embedding.data[0];
    } catch (error) {
        console.error("Error creating embedding:", error.message);
        return null;
    }
}

async function demonstrateEmbeddings() {
    console.log("=== Embedding Demo ===\n");

    const examples = [
        "Hey, How are you?",
        "A river bank",
        "A ICICI bank",
        "Dog chase cat",
        "Cat chase dog"
    ];

    for (const text of examples) {
        const result = await createEmbedding(text);

        if (result) {
            console.log(`Text: "${text}"`);
            console.log(`Vector dimensions: ${result.embedding.length}`);
            console.log(`First 5 values: [${result.embedding.slice(0, 5).map(n => n.toFixed(6)).join(', ')}...]`);
            console.log(`Model used: ${result.object}`);
            console.log('-'.repeat(50));
        }
    }
}

async function compareEmbeddingModels() {
    console.log("\n=== Model Comparison ===\n");

    const text = "Hey, How are you?";

    const models = [
        "text-embedding-3-small",
        "text-embedding-3-large"
    ];

    for (const model of models) {
        const result = await createEmbedding(text, model);

        if (result) {
            console.log(`Model: ${model}`);
            console.log(`Vector size: ${result.embedding.length}`);
            console.log(`Sample values: [${result.embedding.slice(0, 3).map(n => n.toFixed(6)).join(', ')}...]`);
            console.log('-'.repeat(30));
        }
    }
}

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

async function demonstrateSemanticSimilarity() {
    console.log("\n=== Semantic Similarity Demo ===\n");

    const pairs = [
        ["A river bank", "A ICICI bank"],
        ["Dog chase cat", "Cat chase dog"],
        ["Hello world", "Hey there"],
        ["Machine learning", "Artificial intelligence"]
    ];

    for (const [text1, text2] of pairs) {
        const embedding1 = await createEmbedding(text1);
        const embedding2 = await createEmbedding(text2);

        if (embedding1 && embedding2) {
            const similarity = cosineSimilarity(embedding1.embedding, embedding2.embedding);

            console.log(`Text 1: "${text1}"`);
            console.log(`Text 2: "${text2}"`);
            console.log(`Cosine similarity: ${similarity.toFixed(4)}`);
            console.log(`Similarity percentage: ${(similarity * 100).toFixed(2)}%`);
            console.log('-'.repeat(50));
        }
    }
}

async function explainEmbeddings() {
    console.log("\n=== Understanding Embeddings ===\n");

    console.log("What are embeddings?");
    console.log("- Numerical representations of text in high-dimensional space");
    console.log("- Similar meanings have similar vector positions");
    console.log("- Enable mathematical operations on text");
    console.log();

    console.log("Model specifications:");
    console.log("- text-embedding-3-small: 1536 dimensions");
    console.log("- text-embedding-3-large: 3072 dimensions");
    console.log("- Higher dimensions = more detailed representations");
    console.log();

    console.log("Use cases:");
    console.log("- Semantic search");
    console.log("- Document similarity");
    console.log("- Content recommendation");
    console.log("- Clustering and classification");
}

if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️  Please set your OPENAI_API_KEY in the .env file");
    console.log("Create a .env file with: OPENAI_API_KEY=your_api_key_here");
    explainEmbeddings();
} else {
    demonstrateEmbeddings()
        .then(() => compareEmbeddingModels())
        .then(() => demonstrateSemanticSimilarity())
        .then(() => explainEmbeddings())
        .catch(console.error);
}

export { createEmbedding, cosineSimilarity };