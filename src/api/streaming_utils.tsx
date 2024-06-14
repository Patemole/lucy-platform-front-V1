type NonEmptyObject = { [k: string]: any };


//NOUVELLE VERSION QUI FONCTIONNE
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string, //Chunk qui vient d'être récupéré
    currPartialChunk: string | null //Sérialisation des chunks précédents
): [T | null, string | null] => {
    //On concatène les morceaux précédents et le morceau actuel
    const completeChunk = (currPartialChunk || "") + chunk;
    //On essaye de convertir le morceau complet en JSON
    try {
        const chunkJson = JSON.parse(completeChunk) as T;

        return [chunkJson, null];
        //Si on a réussi à convertir le morceau complet en JSON, on retourne le morceau complet et on retourne null pour le morceau précédent
    } catch (err) {
        //Si on a pas réussi à convertir le morceau complet en JSON, on retourne null pour le morceau complet et on retourne le morceau actuel pour le morceau précédent
        return [null, completeChunk];
    }
};


// Définir un type union pour les morceaux complets et partiels
type StreamOutput<T> = T | string;

export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let previousPartialChunk: string | null = null;
    console.log("Starting to handle stream");

    while (true) {
        const rawChunk = await reader?.read();
        if (!rawChunk) {
            throw new Error("Unable to process chunk");
        }

        const { done, value } = rawChunk;
        if (done) {
            console.log("Stream reading completed");
            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Raw chunk received:", decodedValue);

        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );
        console.log("Completed chunk:", completedChunk);
        console.log("Partial chunk:", newPartialChunk);

        if (newPartialChunk) {
            yield [newPartialChunk as StreamOutput<T>];  // Return as array
        }

        if (completedChunk) {
            yield [completedChunk];  // Return as array
        }

        previousPartialChunk = newPartialChunk;
    }
}