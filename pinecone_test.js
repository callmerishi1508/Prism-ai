const { Pinecone } = require('@pinecone-database/pinecone');

async function test() {
  try {
    const pc = new Pinecone({ apiKey: "pcsk_GddXs_8bjmVS5Q9cG2R16VvAJtxtjiSzEdCnEjixhAsyEVWXafve3S48jiFmRYRXQjYwr" });
    const index = pc.Index("anti-gravity");
    const queryResponse = await index.query({
      topK: 1,
      vector: Array(768).fill(0.1),
      includeMetadata: true
    });
    console.log("Success:", queryResponse);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
