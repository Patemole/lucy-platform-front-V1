
/*
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string,
    currPartialChunk: string | null
): [T | null, string | null] => {
    const completeChunk = (currPartialChunk || "") + chunk;
    try {
        // every complete chunk should be valid JSON
        const chunkJson = JSON.parse(completeChunk);
        return [chunkJson, null];
    } catch (err) {
        // if it's not valid JSON, then it's probably an incomplete chunk
        return [null, completeChunk];
    }
};



export const processRawChunkString = <T extends NonEmptyObject>(
    rawChunkString: string,
    previousPartialChunk: string | null
): [T[], string | null] => {
    
    if (!rawChunkString) {
        return [[], null];
    }
    const chunkSections = rawChunkString
        .split("\n")
        .filter((chunk) => chunk.length > 0);

    console.log("Chunk sections:", chunkSections);

    let parsedChunkSections: T[] = [];
    let currPartialChunk = previousPartialChunk;
    chunkSections.forEach((chunk) => {
        const [processedChunk, partialChunk] = processSingleChunk<T>(
            chunk,
            currPartialChunk
        );
        if (processedChunk) {
            parsedChunkSections.push(processedChunk);
            currPartialChunk = null;
        } else {
            currPartialChunk = partialChunk;
        }
    });

    console.log("Parsed chunk sections:", parsedChunkSections);
    console.log("Current partial chunk:", currPartialChunk);

    return [parsedChunkSections, currPartialChunk];
};



export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<T[], void, unknown> {
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

        const [completedChunks, partialChunk] = processRawChunkString<T>(
            decodedValue,
            previousPartialChunk
        );
        console.log("Completed chunks:", completedChunks);
        console.log("Partial chunk:", partialChunk);

        if (!completedChunks.length && !partialChunk) {
            break;
        }
        previousPartialChunk = partialChunk as string | null;
        yield await Promise.resolve(completedChunks);
    }
}










/*
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string,
    currPartialChunk: string | null
): [T | null, string | null] => {
    const completeChunk = (currPartialChunk || "") + chunk;

    console.log("Processing chunk:", completeChunk);

    try {
        const chunkJson = JSON.parse(completeChunk);
        return [chunkJson, null];
    } catch (err) {
        console.warn("Chunk is incomplete or invalid JSON:", completeChunk);
        return [null, completeChunk];
    }
};
*/



/*
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string,
    currPartialChunk: string | null
): [T | null, string | null] => {
    const completeChunk = (currPartialChunk || "") + chunk;

    console.log("Processing chunk:", completeChunk);  // Log ajoutée

    try {
        const chunkJson = JSON.parse(completeChunk);
        return [chunkJson, null];
    } catch (err) {
        console.warn("Chunk is incomplete or invalid JSON:", completeChunk);
        return [null, completeChunk];
    }
};






/*
export const processRawChunkString = <T extends NonEmptyObject>(
    rawChunkString: string,
    previousPartialChunk: string | null
): [T[], string | null] => {
    if (!rawChunkString) {
        return [[], null];
    }
    const chunkSections = rawChunkString
        .split("\n")
        .filter((chunk) => chunk.length > 0);

    console.log("Chunk sections:", chunkSections);

    let parsedChunkSections: T[] = [];
    let currPartialChunk = previousPartialChunk;
    chunkSections.forEach((chunk) => {
        const [processedChunk, partialChunk] = processSingleChunk<T>(
            chunk,
            currPartialChunk
        );
        if (processedChunk) {
            parsedChunkSections.push(processedChunk);
            currPartialChunk = null;
        } else {
            currPartialChunk = partialChunk;
        }
    });

    console.log("Parsed chunk sections:", parsedChunkSections);
    console.log("Current partial chunk:", currPartialChunk);

    return [parsedChunkSections, currPartialChunk];
};
*/


/*
export const processRawChunkString = <T extends NonEmptyObject>(
    rawChunkString: string,
    previousPartialChunk: string | null
): [T[], string | null] => {
    if (!rawChunkString) {
        return [[], null];
    }
    const chunkSections = rawChunkString
        .split("\n")
        .filter((chunk) => chunk.length > 0);

    console.log("Chunk sections:", chunkSections);  // Log ajoutée

    let parsedChunkSections: T[] = [];
    let currPartialChunk = previousPartialChunk;
    chunkSections.forEach((chunk) => {
        const [processedChunk, partialChunk] = processSingleChunk<T>(
            chunk,
            currPartialChunk
        );
        if (processedChunk) {
            parsedChunkSections.push(processedChunk);
            currPartialChunk = null;
        } else {
            currPartialChunk = partialChunk;
        }
    });

    console.log("Parsed chunk sections:", parsedChunkSections);  // Log ajoutée
    console.log("Current partial chunk:", currPartialChunk);  // Log ajoutée

    return [parsedChunkSections, currPartialChunk];
};



export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<T[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    if (!reader) {
        console.error("Failed to get reader from response body");
        throw new Error("Failed to get reader from response body");
    }
    const decoder = new TextDecoder("utf-8");

    let previousPartialChunk: string | null = null;
    while (true) {
        const rawChunk = await reader.read();
        if (!rawChunk) {
            console.error("Unable to process chunk");
            throw new Error("Unable to process chunk");
        }
        const { done, value } = rawChunk;
        if (done) {
            console.log("Stream reading completed");
            break;
        }

        console.log("Received raw chunk:", value);

        const [completedChunks, partialChunk] = processRawChunkString<T>(
            decoder.decode(value, { stream: true }),
            previousPartialChunk
        );

        console.log("Completed chunks:", completedChunks);
        console.log("Partial chunk:", partialChunk);

        if (!completedChunks.length && !partialChunk) {
            console.log("No more chunks to process");
            break;
        }
        previousPartialChunk = partialChunk as string | null;
        yield await Promise.resolve(completedChunks);
    }
}
*/




/*************************************** */

/*
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<T[], void, unknown> {
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

        const [completedChunks, partialChunk] = processRawChunkString<T>(
            decodedValue,
            previousPartialChunk
        );
        console.log("Completed chunks:", completedChunks);
        console.log("Partial chunk:", partialChunk);

        if (!completedChunks.length && !partialChunk) {
            break;
        }
        previousPartialChunk = partialChunk as string | null;
        yield await Promise.resolve(completedChunks);
    }
}

const processRawChunkString = <T extends NonEmptyObject>(
    rawChunkString: string,
    previousPartialChunk: string | null
): [T[], string | null] => {
    if (!rawChunkString) {
        return [[], null];
    }
    const chunkSections = rawChunkString
        .split("\n")
        .filter((chunk) => chunk.length > 0);

    console.log("Chunk sections:", chunkSections);

    let parsedChunkSections: T[] = [];
    let currPartialChunk = previousPartialChunk;
    chunkSections.forEach((chunk) => {
        const [processedChunk, partialChunk] = processSingleChunk<T>(
            chunk,
            currPartialChunk
        );
        if (processedChunk) {
            parsedChunkSections.push(processedChunk);
            currPartialChunk = null;
        } else {
            currPartialChunk = partialChunk;
        }
    });

    console.log("Parsed chunk sections:", parsedChunkSections);
    console.log("Current partial chunk:", currPartialChunk);

    return [parsedChunkSections, currPartialChunk];
};

const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string,
    currPartialChunk: string | null
): [T | null, string | null] => {
    const completeChunk = (currPartialChunk || "") + chunk;
    try {
        const chunkJson = JSON.parse(completeChunk);
        return [chunkJson, null];
    } catch (err) {
        return [null, completeChunk];
    }
};

*/




/*
//CODE QUI FONCTIONNAIT PAS MAIS LE DERNIER CHUNK EST TOUJOURS NULL, ON VA ESSAYER DE RÉGLER CE PROBLÈME
type NonEmptyObject = { [k: string]: any };

const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string,
    currPartialChunk: string | null
): [T | null, string | null] => {
    const completeChunk = (currPartialChunk || "") + chunk;
    try {
        const chunkJson = JSON.parse(completeChunk) as T;
        return [chunkJson, null];
    } catch (err) {
        return [null, completeChunk];
    }
};

// TESTER AVEC UN NOUVEAU TRAITEMENT PAR CHUNKS
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<T[], void, unknown> {
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

        if (completedChunk) {
            yield [completedChunk];
        }
        previousPartialChunk = newPartialChunk;
    }
}
*/



type NonEmptyObject = { [k: string]: any };

const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string,
    currPartialChunk: string | null
): [T | null, string | null] => {
    const completeChunk = (currPartialChunk || "") + chunk;
    try {
        const chunkJson = JSON.parse(completeChunk) as T;
        return [chunkJson, null];
    } catch (err) {
        return [null, completeChunk];
    }
};

// TESTER AVEC UN NOUVEAU TRAITEMENT PAR CHUNKS
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<T[], void, unknown> {
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

        if (completedChunk) {
            yield [completedChunk];  // Retourner sous forme de tableau
        }
        previousPartialChunk = newPartialChunk;
    }
}
