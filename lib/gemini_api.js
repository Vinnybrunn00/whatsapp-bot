const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiApi {
    constructor(apiKey) {
        this.apiKey = apiKey
    }
    async geminiModelResponse(prompt) {
        try {
            const genIA = new GoogleGenerativeAI(this.apiKey)
            const model = genIA.getGenerativeModel({ 'model': 'gemini-1.5-flash' })
            const result = await model.generateContent(prompt)
            return result.response.text();
        } catch (_) {
            throw 'Ocorreu um erro, tente novamente!!!'
        }
    }
}