const axios = require('axios');
const pdfParse = require('pdf-parse');
const UserLog = require('../models/UserLogs');
const User = require('../models/users');

async function aiAssistant(req, res) {
    const prompt = req.body.prompt
    if (!prompt || typeof prompt !== 'string' || prompt.length === 0 || prompt.trim() === '') {
        return res.status(400).json({ message: 'Prompt is required.' });
    }
    const apiKey = process.env.AZURE_API_KEY;
    const endpoint = 'https://vsmodel.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview'

    try {
        const response = await axios.post(endpoint, {
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            },{
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                },
        });

        const aiReply = response.data.choices[0].message.content.trim();
        await UserLog.create({
            userId: req.user.id,
            tool: 'ai-assistant',
        });
        res.status(200).json({ reply: aiReply });

    }
    catch (error) {
        console.error('AI Assistant Error:', error.message);
        res.status(500).json({ message: 'Failed to generate AI response' });
    }
}

async function codeTool(req, res) {
    const prompt = req.body.prompt
    if (!prompt || typeof(prompt) !== 'string' || prompt.length === 0 || prompt.trim() === '') {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    const apiKey = process.env.AZURE_API_KEY
    const endpoint = 'https://vsmodel.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-02-15-preview'
    const systemPrompt = `
                You are a senior software engineer and expert code assistant.

                Your job is to help the user by either generating new code or debugging existing code based on their prompt.

                If the user wants new functionality:
                - Provide clean, well-written code with brief comments.
                - Include a short explanation of what the code does and how it works.

                If the user shares buggy or incomplete code:
                - Detect and fix issues.
                - Clearly explain what was wrong and how you fixed it.
                - Then provide the corrected code.

                Format your response like this:
                1. A brief explanation in plain English.
                2. A code block with the final solution.
                3. Keep explanations simple, especially for beginners.
                4. Match the programming language in the user's prompt.

                Be helpful, clear, and concise.
                `.trim();
    
    try {
        const response = await axios.post(endpoint, {
            messages: [
                {
                  role: 'system', content: systemPrompt  
                },
                {
                    role: 'user', content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json' 
            }
        });

        const aiReply = response.data.choices[0].message.content.trim();
        await UserLog.create({
            userId: req.user.id,
            tool: 'code-tool'
        });
        res.status(200).json({
            reply: aiReply
        })
    }
    catch (error) {
        console.error('Code Tool Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to generate code. Please try again.' });
    }
}

async function summarize(req, res) {
    try {
        const text = req.body.text;
        let finalText = '';
        if (text && typeof(text) === 'string' && text.length > 0 && text.trim() !== '') {
            finalText = text.trim();
        }
        else if(req.file && req.file.mimetype === 'application/pdf') {
            const data = await pdfParse(req.file.buffer);
            finalText = data.text;
        }
        else {
            return res.status(400).json({
                message: 'Please provide text or upload a pdf file'
            });
        }
        const apiKey = process.env.AZURE_API_KEY;
        const endpoint = 'https://vsmodel.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-02-15-preview'
        const systemPrompt = `You are an expert document summarizer.
                              Your job is to read and understand long documents or passages and summarize them into short, clear, and informative summaries.
                              Always extract the core ideas and key insights.
                              Do not copy entire sections of the original text.
                              Avoid repeating phrases or generic filler.
                              Tailor the length and depth of your summary to match the content — aim to be clear and accurate.
                              Keep the summary useful for someone who hasn’t read the document.
                              Use plain English. If the original text is technical or academic, simplify it without losing accuracy.`.trim();
        
        const response = await axios.post(endpoint, {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: finalText }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const summary = response.data.choices[0].message.content.trim();
        await UserLog.create({
            userId: req.user.id,
            tool: 'summarizer'
        })

        res.status(200).json({
            summary: summary
        })
    }
    catch (error) {
        console.error('Summarization Error:', error);
        res.status(500).json({ message: 'Something went wrong while summarizing.' });
    }
}

async function analyze(req, res) {
    try {
        if (!req.file || req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ message: 'Please upload a valid PDF resume file' });
        }

        const data = await pdfParse(req.file.buffer);
        const resumeText = data.text;
        if (!resumeText || resumeText.trim().length < 100) {
            return res.status(400).json({ message: 'The uploaded resume appears to be empty or invalid.'});
        }
        const apiKey = process.env.AZURE_API_KEY;
        const endpoint = 'https://vsmodel.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-02-15-preview';
        const systemPrompt = `You are a professional resume reviewer. When given the content of a resume (in plain text), you will analyze its effectiveness, structure, and clarity.

                                Your task is to:
                                1. Highlight the strengths of the resume.
                                2. Suggest improvements.

                                ✅ Respond ONLY in the following JSON format:
                                {
                                    "strengths": [ "point 1", "point 2", "..." ],
                                    "suggestions": [ "point 1", "point 2", "..." ]
                                }

                                ❌ Do not write any explanation outside the JSON block.
                              `.trim();
        
        const response = await axios.post(
            endpoint,
            {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: resumeText }
                ]
            },
            {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        const feedback = response.data.choices[0].message.content.trim();
        await UserLog.create(
            {
                userId: req.user.id,
                tool: 'resume-analyzer'
            }
        );
        res.status(200).json({ feedback: feedback });
    }
    catch (error) {
        console.error('Resume Analysis Error:', error.message);
        res.status(500).json({ message: 'Something went wrong while analyzing the resume' });
    }
}


module.exports.aiAssistant = aiAssistant;
module.exports.codeTool = codeTool;
module.exports.summarize = summarize;
module.exports.analyze = analyze;