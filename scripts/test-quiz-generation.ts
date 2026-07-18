/**
 * Test script per verificare la connessione all'LLM locale
 */

const LLM_ENDPOINT = 'http://alessandros-macbook-pro-4.tailc9d047.ts.net:8000/v1/chat/completions';
const LLM_MODEL = 'llama-3.2-3b-instruct';

async function testLLM() {
  const prompt = 'Rispondi solo con "OK" se ricevi questo messaggio.';
  
  const request = {
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: 'Sei un assistente utile.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 10
  };

  try {
    console.log('📊 Test connessione LLM...');
    console.log(`Endpoint: ${LLM_ENDPOINT}\n`);

    const response = await fetch(LLM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      console.error(`❌ Errore HTTP ${response.status}: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    console.log('✅ LLM raggiungibile!');
    console.log(`Risposta: "${content}"\n`);

  } catch (error) {
    console.error('❌ Errore connessione LLM:', error);
  }
}

testLLM();
