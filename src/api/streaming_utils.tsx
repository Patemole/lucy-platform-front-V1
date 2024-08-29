
/*
type NonEmptyObject = { [k: string]: any };

// Fonction qui traite chaque fragment de chunk reçu
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string, // Chunk qui vient d'être récupéré
    currPartialChunk: string | null // Sérialisation des chunks précédents
): [T | null, string | null] => {
    // On concatène les morceaux précédents et le morceau actuel
    const completeChunk = (currPartialChunk || "") + chunk;

    // On essaye de convertir le morceau complet en JSON
    try {
        const chunkJson = JSON.parse(completeChunk) as T;

        // Si on a réussi à convertir en JSON, on retourne le morceau complet et null pour le morceau précédent
        return [chunkJson, null];
    } catch (err) {
        // Si la conversion échoue, on retourne null pour le JSON complet et conserve le morceau actuel en tant que partiel
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

        // On traite le chunk reçu
        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        console.log("Completed chunk:", completedChunk);
        console.log("Partial chunk:", newPartialChunk);

        // Si un nouveau chunk partiel est créé, on le retourne en tant que chaîne
        if (newPartialChunk) {
            yield [newPartialChunk as StreamOutput<T>];  // Retourne le morceau partiel sous forme de tableau
        }

        // Si un chunk complet est récupéré, on le retourne
        if (completedChunk) {
            yield [completedChunk];  // Retourne le chunk complet sous forme de tableau
        }

        // On met à jour la référence au dernier morceau partiel
        previousPartialChunk = newPartialChunk;
    }
}
*/






/*
// CODE D'ORIGINE
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
*/



/*
type NonEmptyObject = { [k: string]: any };

// Fonction de traitement des fragments pour identifier le JSON complet ou les morceaux de texte
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string, // Chunk qui vient d'être récupéré
    currPartialChunk: string | null // Sérialisation des chunks précédents
): [T | null, string | null] => {
    // On concatène les morceaux précédents et le morceau actuel
    const completeChunk = (currPartialChunk || "") + chunk;

    // On essaye de convertir le morceau complet en JSON
    try {
        const chunkJson = JSON.parse(completeChunk) as T;
        return [chunkJson, null];  // Retourne le chunk JSON complet et null pour la partie incomplète
    } catch (err) {
        // Si le JSON n'est pas encore complet, retourne null pour le JSON complet et renvoie le chunk en cours pour accumulation
        return [null, completeChunk];
    }
};

// Définir un type union pour les morceaux complets et partiels
type StreamOutput<T> = T | string;

// Fonction pour gérer le flux de texte et documents
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let isInDocument = false;  // Pour savoir si on est en train de lire un document JSON
    let documentBuffer = "";  // Pour accumuler les fragments de document JSON
    let previousPartialChunk: string | null = null;

    console.log("Starting to handle stream");

    while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) {
            console.log("Stream reading completed");
            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Raw chunk received:", decodedValue);

        // Check if we are inside a JSON document
        if (decodedValue.includes("<JSON_DOCUMENT_START>")) {
            isInDocument = true;  // Commence à lire le document JSON
            documentBuffer = decodedValue.split("<JSON_DOCUMENT_START>")[1];  // Récupère tout ce qui suit la balise de début
            continue;
        }

        if (isInDocument) {
            // Accumule jusqu'à trouver la fin du document
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                documentBuffer += decodedValue.split("<JSON_DOCUMENT_END>")[0];  // Accumule jusqu'à la balise de fin
                try {
                    const documentJson = JSON.parse(documentBuffer);  // Convertir en JSON
                    yield [documentJson];  // Traiter le document comme un objet complet
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
                isInDocument = false;  // Fin de lecture du document
                documentBuffer = "";  // Reset le buffer du document
            } else {
                documentBuffer += decodedValue;  // Continuer à accumuler les fragments de JSON
            }
            continue;
        }

        // Traitement des fragments de texte (non document JSON)
        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        if (newPartialChunk) {
            yield [newPartialChunk as StreamOutput<T>];  // Retourner le texte partiel comme tableau
        }

        if (completedChunk) {
            yield [completedChunk];  // Retourner le JSON complet une fois terminé
        }

        previousPartialChunk = newPartialChunk;  // Stocker les fragments partiels pour le traitement ultérieur
    }
}
*/





/*
// Définir un type union pour les morceaux complets et partiels
type StreamOutput<T> = T | string;

type NonEmptyObject = { [k: string]: any };



// Fonction qui traite chaque fragment de chunk reçu
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string, // Chunk qui vient d'être récupéré
    currPartialChunk: string | null // Sérialisation des chunks précédents
): [T | null, string | null] => {
    // On concatène les morceaux précédents et le morceau actuel
    const completeChunk = (currPartialChunk || "") + chunk;

    // On essaye de convertir le morceau complet en JSON
    try {
        const chunkJson = JSON.parse(completeChunk) as T;

        // Si on a réussi à convertir en JSON, on retourne le morceau complet et null pour le morceau précédent
        return [chunkJson, null];
    } catch (err) {
        // Si la conversion échoue, on retourne null pour le JSON complet et conserve le morceau actuel en tant que partiel
        return [null, completeChunk];
    }
};



export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let isInDocument = false;
    let documentBuffer = "";
    let previousPartialChunk: string | null = null;

    console.log("Starting to handle stream");

    while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) {
            console.log("Stream reading completed");
            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Raw chunk received:", decodedValue);

        // Détection des balises de début du document JSON
        if (decodedValue.includes("<JSON_DOCUMENT_START>")) {
            isInDocument = true;
            documentBuffer = decodedValue.split("<JSON_DOCUMENT_START>")[1]; // Commence à accumuler le document
            continue;
        }

        if (isInDocument) {
            // Ajout jusqu'à la balise de fin du document
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                documentBuffer += decodedValue.split("<JSON_DOCUMENT_END>")[0]; // Accumule jusqu'à la fin
                try {
                    const documentJson = JSON.parse(documentBuffer); // Conversion en JSON

                    console.log("Document JSON reçu:", documentJson);

                    // Ajout du document à citedDocuments
                    yield documentJson; // Traiter le document comme un objet
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
                isInDocument = false; // Fin du document JSON
                documentBuffer = ""; // Réinitialiser le buffer
            } else {
                documentBuffer += decodedValue; // Continuer à accumuler les fragments du document JSON
            }
            continue;
        }

        // Traitement des fragments de texte (non document JSON)
        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        if (newPartialChunk) {
            yield [newPartialChunk as StreamOutput<T>]; // Retourner les fragments de texte
        }

        if (completedChunk) {
            yield [completedChunk]; // Retourner le JSON complet si terminé
        }

        previousPartialChunk = newPartialChunk; // Stocker les fragments pour les traiter ensuite
    }
}
*/




type StreamOutput<T> = T | string;

type NonEmptyObject = { [k: string]: any };

// Fonction qui traite chaque fragment de chunk reçu
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string, // Chunk qui vient d'être récupéré
    currPartialChunk: string | null // Sérialisation des chunks précédents
): [T | null, string | null] => {
    // On concatène les morceaux précédents et le morceau actuel
    const completeChunk = (currPartialChunk || "") + chunk;

    console.log("Traitement du chunk:", completeChunk);

    // On essaye de convertir le morceau complet en JSON
    try {
        const chunkJson = JSON.parse(completeChunk) as T;

        // Si on a réussi à convertir en JSON, on retourne le morceau complet et null pour le morceau précédent
        console.log("Le chunk a été converti en JSON avec succès:", chunkJson);
        return [chunkJson, null];
    } catch (err) {
        // Si la conversion échoue, on retourne null pour le JSON complet et conserve le morceau actuel en tant que partiel
        console.log("Échec de la conversion du chunk en JSON, morceau partiel conservé:", completeChunk);
        return [null, completeChunk];
    }
};


/* Fonction qui marche bien pour le texte et les sources 
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let isInDocument = false;
    let documentBuffer = "";
    let previousPartialChunk: string | null = null;

    console.log("Début du traitement du flux");

    while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) {
            console.log("Lecture du flux terminée");
            
            // Si un document est en cours de traitement, il doit être émis avant la fin
            if (isInDocument && documentBuffer) {
                try {
                    console.log("Tentative de parsing du document JSON final:", documentBuffer);
                    const documentJson = JSON.parse(documentBuffer); // Convertir le document final en JSON
                    console.log("Document JSON émis à la fin du flux:", documentJson);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON à la fin du flux:", err);
                }
            }

            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Chunk brut reçu:", decodedValue);

        // Détection des balises de début du document JSON
        if (decodedValue.includes("<JSON_DOCUMENT_START>")) {
            console.log("Détection de <JSON_DOCUMENT_START> dans le chunk:", decodedValue);
            isInDocument = true;
            documentBuffer = decodedValue.split("<JSON_DOCUMENT_START>")[1].split("<JSON_DOCUMENT_END>")[0]; // Extraire proprement entre les balises
            console.log("Début d'accumulation du document JSON, buffer actuel:", documentBuffer);

            // Si la balise de fin est également présente dans le même chunk
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                try {
                    console.log("Détection de <JSON_DOCUMENT_END> dans le même chunk.");
                    const documentJson = JSON.parse(documentBuffer); // Conversion en JSON
                    console.log("Document JSON reçu et converti:", documentJson);

                    // Ajout du document à citedDocuments
                    yield documentJson; // Traiter le document comme un objet
                    isInDocument = false;
                    documentBuffer = ""; // Réinitialiser le buffer
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
            }
            continue;
        } else {
            console.log("Aucune balise <JSON_DOCUMENT_START> détectée dans ce chunk:", decodedValue);
        }

        if (isInDocument) {
            console.log("Accumulation du document JSON en cours...");
            // Ajout jusqu'à la balise de fin du document
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                console.log("Détection de <JSON_DOCUMENT_END> dans le chunk:", decodedValue);
                documentBuffer += decodedValue.split("<JSON_DOCUMENT_END>")[0]; // Accumule jusqu'à la fin
                try {
                    const documentJson = JSON.parse(documentBuffer.trim()); // Conversion en JSON
                    console.log("Document JSON reçu et converti:", documentJson);

                    // Ajout du document à citedDocuments
                    yield documentJson; // Traiter le document comme un objet
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
                isInDocument = false; // Fin du document JSON
                documentBuffer = ""; // Réinitialiser le buffer
            } else {
                console.log("Aucune balise <JSON_DOCUMENT_END> détectée dans ce chunk:", decodedValue);
                documentBuffer += decodedValue; // Continuer à accumuler les fragments du document JSON
            }
            continue;
        }

        // Si on n'est pas en train de traiter un document, traiter les fragments de texte (non document JSON)
        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        if (newPartialChunk) {
            console.log("Nouveau fragment partiel de texte:", newPartialChunk);
            yield [newPartialChunk as StreamOutput<T>]; // Retourner les fragments de texte
        }

        if (completedChunk) {
            console.log("Chunk JSON complet reçu:", completedChunk);
            yield [completedChunk]; // Retourner le JSON complet si terminé
        }

        previousPartialChunk = newPartialChunk; // Stocker les fragments pour les traiter ensuite
    }

    console.log("Fin du traitement du flux");
}
*/



//NOUVELLE FONCTION POUR PRENDRE EN COMPTE EN PLUS DU TEXTE ET DES SOURCES, LES RELATED QUESTIONS ET DES IMAGES + TAK
/*
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let isInDocument = false;
    let documentBuffer = "";
    let isInImage = false;
    let imageBuffer = "";
    let isInTak = false;
    let takBuffer = "";
    let isInRelatedQuestions = false;
    let relatedQuestionsBuffer = "";
    let previousPartialChunk: string | null = null;

    console.log("Début du traitement du flux");

    while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) {
            console.log("Lecture du flux terminée");

            // Handle any remaining buffered content for documents, images, or related questions
            if (isInDocument && documentBuffer) {
                try {
                    console.log("Tentative de parsing du document JSON final:", documentBuffer);
                    const documentJson = JSON.parse(documentBuffer); // Convertir le document final en JSON
                    console.log("Document JSON émis à la fin du flux:", documentJson);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON à la fin du flux:", err);
                }
                documentBuffer = "";
                isInDocument = false;
            }

            if (isInImage && imageBuffer) {
                try {
                    console.log("Tentative de parsing de l'image JSON finale:", imageBuffer);
                    const imageJson = JSON.parse(imageBuffer); // Convertir l'image finale en JSON
                    console.log("Image JSON émise à la fin du flux:", imageJson);
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON à la fin du flux:", err);
                }
                imageBuffer = "";
                isInImage = false;
            }


            if (isInTak && takBuffer) {
                try {
                    console.log("Tentative de parsing de l'image JSON finale:", takBuffer);
                    const takJson = JSON.parse(takBuffer); // Convertir l'image finale en JSON
                    console.log("tak JSON émise à la fin du flux:", takJson);
                    yield takJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de tak JSON à la fin du flux:", err);
                }
                takBuffer = "";
                isInTak = false;
            }

            if (isInRelatedQuestions && relatedQuestionsBuffer) {
                try {
                    console.log("Tentative de parsing des related questions JSON finales:", relatedQuestionsBuffer);
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer); // Convertir les related questions finales en JSON
                    console.log("Related Questions JSON émises à la fin du flux:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON à la fin du flux:", err);
                }
                relatedQuestionsBuffer = "";
                isInRelatedQuestions = false;
            }

            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Chunk brut reçu:", decodedValue);

        // Detection and processing of <JSON_DOCUMENT_START> and <JSON_DOCUMENT_END>
        if (decodedValue.includes("<JSON_DOCUMENT_START>")) {
            console.log("Détection de <JSON_DOCUMENT_START> dans le chunk:", decodedValue);
            isInDocument = true;
            documentBuffer = decodedValue.split("<JSON_DOCUMENT_START>")[1].split("<JSON_DOCUMENT_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation du document JSON, buffer actuel:", documentBuffer);

            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                try {
                    console.log("Détection de <JSON_DOCUMENT_END> dans le même chunk.");
                    const documentJson = JSON.parse(documentBuffer);
                    console.log("Document JSON reçu et converti:", documentJson);
                    yield documentJson;
                    isInDocument = false;
                    documentBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <ANSWER_TAK> and <ANSWER_TAK_END>
        if (decodedValue.includes("<ANSWER_TAK>")) {
            console.log("Détection de <ANSWER_TAK> dans le chunk:", decodedValue);
            isInTak = true;
            takBuffer = decodedValue.split("<ANSWER_TAK>")[1].split("<ANSWER_TAK_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de tak JSON, buffer actuel:", takBuffer);

            if (decodedValue.includes("<ANSWER_TAK_END>")) {
                try {
                    console.log("Détection de <ANSWER_TAK_END> dans le même chunk.");
                    const takJson = JSON.parse(takBuffer);
                    console.log("tak JSON reçue et convertie:", takJson);
                    yield takJson;
                    isInTak = false;
                    takBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de tak JSON:", err);
                }
            }
            continue;
        }


        // Detection and processing of <IMAGE_DATA> and <IMAGE_DATA_END>
        if (decodedValue.includes("<IMAGE_DATA>")) {
            console.log("Détection de <IMAGE_DATA> dans le chunk:", decodedValue);
            isInImage = true;
            imageBuffer = decodedValue.split("<IMAGE_DATA>")[1].split("<IMAGE_DATA_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de l'image JSON, buffer actuel:", imageBuffer);

            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                try {
                    console.log("Détection de <IMAGE_DATA_END> dans le même chunk.");
                    const imageJson = JSON.parse(imageBuffer);
                    console.log("Image JSON reçue et convertie:", imageJson);
                    yield imageJson;
                    isInImage = false;
                    imageBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <RELATED_QUESTIONS> and <RELATED_QUESTIONS_END>
        if (decodedValue.includes("<RELATED_QUESTIONS>")) {
            console.log("Détection de <RELATED_QUESTIONS> dans le chunk:", decodedValue);
            isInRelatedQuestions = true;
            relatedQuestionsBuffer = decodedValue.split("<RELATED_QUESTIONS>")[1].split("<RELATED_QUESTIONS_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation des related questions JSON, buffer actuel:", relatedQuestionsBuffer);

            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                try {
                    console.log("Détection de <RELATED_QUESTIONS_END> dans le même chunk.");
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer);
                    console.log("Related Questions JSON reçues et converties:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                    isInRelatedQuestions = false;
                    relatedQuestionsBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
            }
            continue;
        }

        // Handling document buffering until <JSON_DOCUMENT_END> is detected
        if (isInDocument) {
            console.log("Accumulation du document JSON en cours...");
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                documentBuffer += decodedValue.split("<JSON_DOCUMENT_END>")[0];
                try {
                    const documentJson = JSON.parse(documentBuffer.trim());
                    console.log("Document JSON reçu et converti:", documentJson);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
                isInDocument = false;
                documentBuffer = "";
            } else {
                documentBuffer += decodedValue;
            }
            continue;
        }

        // Handling image buffering until <IMAGE_DATA_END> is detected
        if (isInImage) {
            console.log("Accumulation de l'image JSON en cours...");
            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                imageBuffer += decodedValue.split("<IMAGE_DATA_END>")[0];
                try {
                    const imageJson = JSON.parse(imageBuffer.trim());
                    console.log("Image JSON reçue et convertie:", imageJson);
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
                isInImage = false;
                imageBuffer = "";
            } else {
                imageBuffer += decodedValue;
            }
            continue;
        }


        // Handling image buffering until <IMAGE_DATA_END> is detected
        if (isInTak) {
            console.log("Accumulation de tak JSON en cours...");
            if (decodedValue.includes("<ANSWER_TAK_END>")) {
                takBuffer += decodedValue.split("<ANSWER_TAK_END>")[0];
                try {
                    const takJson = JSON.parse(takBuffer.trim());
                    console.log("Image JSON reçue et convertie:", takJson);
                    yield takJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de tak JSON:", err);
                }
                isInTak = false;
                takBuffer = "";
            } else {
                takBuffer += decodedValue;
            }
            continue;
        }

        // Handling related questions buffering until <RELATED_QUESTIONS_END> is detected
        if (isInRelatedQuestions) {
            console.log("Accumulation des related questions JSON en cours...");
            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                relatedQuestionsBuffer += decodedValue.split("<RELATED_QUESTIONS_END>")[0];
                try {
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer.trim());
                    console.log("Related Questions JSON reçues et converties:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
                isInRelatedQuestions = false;
                relatedQuestionsBuffer = "";
            } else {
                relatedQuestionsBuffer += decodedValue;
            }
            continue;
        }

        // If not processing documents, images, or related questions, process regular text chunks
        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        if (newPartialChunk) {
            console.log("Nouveau fragment partiel de texte:", newPartialChunk);
            yield [newPartialChunk as StreamOutput<T>];
        }

        if (completedChunk) {
            console.log("Chunk JSON complet reçu:", completedChunk);
            yield [completedChunk];
        }

        previousPartialChunk = newPartialChunk;
    }

    console.log("Fin du traitement du flux");
}


*/


//NOUVELLE FONCTION POUR PRENDRE EN COMPTE LE ANSWER WAITING 
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let isInDocument = false;
    let documentBuffer = "";
    let isInImage = false;
    let imageBuffer = "";
    let isInTak = false;
    let takBuffer = "";
    let isInRelatedQuestions = false;
    let relatedQuestionsBuffer = "";
    let isInWaiting = false;
    let waitingBuffer = "";
    let previousPartialChunk: string | null = null;

    console.log("Début du traitement du flux");

    while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) {
            console.log("Lecture du flux terminée");

            // Handle any remaining buffered content for documents, images, related questions, tak, or answer_waiting
            if (isInDocument && documentBuffer) {
                try {
                    console.log("Tentative de parsing du document JSON final:", documentBuffer);
                    const documentJson = JSON.parse(documentBuffer); // Convertir le document final en JSON
                    console.log("Document JSON émis à la fin du flux:", documentJson);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON à la fin du flux:", err);
                }
                documentBuffer = "";
                isInDocument = false;
            }

            if (isInImage && imageBuffer) {
                try {
                    console.log("Tentative de parsing de l'image JSON finale:", imageBuffer);
                    const imageJson = JSON.parse(imageBuffer); // Convertir l'image finale en JSON
                    console.log("Image JSON émise à la fin du flux:", imageJson);
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON à la fin du flux:", err);
                }
                imageBuffer = "";
                isInImage = false;
            }

            if (isInTak && takBuffer) {
                try {
                    console.log("Tentative de parsing du tak JSON final:", takBuffer);
                    const takJson = JSON.parse(takBuffer); // Convertir le tak final en JSON
                    console.log("tak JSON émise à la fin du flux:", takJson);
                    yield takJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du tak JSON à la fin du flux:", err);
                }
                takBuffer = "";
                isInTak = false;
            }

            if (isInRelatedQuestions && relatedQuestionsBuffer) {
                try {
                    console.log("Tentative de parsing des related questions JSON finales:", relatedQuestionsBuffer);
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer); // Convertir les related questions finales en JSON
                    console.log("Related Questions JSON émises à la fin du flux:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON à la fin du flux:", err);
                }
                relatedQuestionsBuffer = "";
                isInRelatedQuestions = false;
            }

            if (isInWaiting && waitingBuffer) {
                try {
                    console.log("Tentative de parsing du waiting JSON final:", waitingBuffer);
                    const waitingJson = JSON.parse(waitingBuffer); // Convertir le waiting final en JSON
                    console.log("Waiting JSON émis à la fin du flux:", waitingJson);
                    yield waitingJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du waiting JSON à la fin du flux:", err);
                }
                waitingBuffer = "";
                isInWaiting = false;
            }

            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Chunk brut reçu:", decodedValue);

        // Detection and processing of <JSON_DOCUMENT_START> and <JSON_DOCUMENT_END>
        if (decodedValue.includes("<JSON_DOCUMENT_START>")) {
            console.log("Détection de <JSON_DOCUMENT_START> dans le chunk:", decodedValue);
            isInDocument = true;
            documentBuffer = decodedValue.split("<JSON_DOCUMENT_START>")[1].split("<JSON_DOCUMENT_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation du document JSON, buffer actuel:", documentBuffer);

            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                try {
                    console.log("Détection de <JSON_DOCUMENT_END> dans le même chunk.");
                    const documentJson = JSON.parse(documentBuffer);
                    console.log("Document JSON reçu et converti:", documentJson);
                    yield documentJson;
                    isInDocument = false;
                    documentBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <ANSWER_TAK> and <ANSWER_TAK_END>
        if (decodedValue.includes("<ANSWER_TAK>")) {
            console.log("Détection de <ANSWER_TAK> dans le chunk:", decodedValue);
            isInTak = true;
            takBuffer = decodedValue.split("<ANSWER_TAK>")[1].split("<ANSWER_TAK_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de tak JSON, buffer actuel:", takBuffer);

            if (decodedValue.includes("<ANSWER_TAK_END>")) {
                try {
                    console.log("Détection de <ANSWER_TAK_END> dans le même chunk.");
                    const takJson = JSON.parse(takBuffer);
                    console.log("tak JSON reçue et convertie:", takJson);
                    yield takJson;
                    isInTak = false;
                    takBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de tak JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <IMAGE_DATA> and <IMAGE_DATA_END>
        if (decodedValue.includes("<IMAGE_DATA>")) {
            console.log("Détection de <IMAGE_DATA> dans le chunk:", decodedValue);
            isInImage = true;
            imageBuffer = decodedValue.split("<IMAGE_DATA>")[1].split("<IMAGE_DATA_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de l'image JSON, buffer actuel:", imageBuffer);

            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                try {
                    console.log("Détection de <IMAGE_DATA_END> dans le même chunk.");
                    const imageJson = JSON.parse(imageBuffer);
                    console.log("Image JSON reçue et convertie:", imageJson);
                    yield imageJson;
                    isInImage = false;
                    imageBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <RELATED_QUESTIONS> and <RELATED_QUESTIONS_END>
        if (decodedValue.includes("<RELATED_QUESTIONS>")) {
            console.log("Détection de <RELATED_QUESTIONS> dans le chunk:", decodedValue);
            isInRelatedQuestions = true;
            relatedQuestionsBuffer = decodedValue.split("<RELATED_QUESTIONS>")[1].split("<RELATED_QUESTIONS_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation des related questions JSON, buffer actuel:", relatedQuestionsBuffer);

            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                try {
                    console.log("Détection de <RELATED_QUESTIONS_END> dans le même chunk.");
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer);
                    console.log("Related Questions JSON reçues et converties:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                    isInRelatedQuestions = false;
                    relatedQuestionsBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <ANSWER_WAITING> and <ANSWER_WAITING_END>
        if (decodedValue.includes("<ANSWER_WAITING>")) {
            console.log("Détection de <ANSWER_WAITING> dans le chunk:", decodedValue);
            isInWaiting = true;
            waitingBuffer = decodedValue.split("<ANSWER_WAITING>")[1].split("<ANSWER_WAITING_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de waiting JSON, buffer actuel:", waitingBuffer);

            if (decodedValue.includes("<ANSWER_WAITING_END>")) {
                try {
                    console.log("Détection de <ANSWER_WAITING_END> dans le même chunk.");
                    const waitingJson = JSON.parse(waitingBuffer);
                    console.log("Waiting JSON reçue et convertie:", waitingJson);
                    yield waitingJson;
                    isInWaiting = false;
                    waitingBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing du waiting JSON:", err);
                }
            }
            continue;
        }

        // Handling document buffering until <JSON_DOCUMENT_END> is detected
        if (isInDocument) {
            console.log("Accumulation du document JSON en cours...");
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                documentBuffer += decodedValue.split("<JSON_DOCUMENT_END>")[0];
                try {
                    const documentJson = JSON.parse(documentBuffer.trim());
                    console.log("Document JSON reçu et converti:", documentJson);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
                isInDocument = false;
                documentBuffer = "";
            } else {
                documentBuffer += decodedValue;
            }
            continue;
        }

        // Handling image buffering until <IMAGE_DATA_END> is detected
        if (isInImage) {
            console.log("Accumulation de l'image JSON en cours...");
            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                imageBuffer += decodedValue.split("<IMAGE_DATA_END>")[0];
                try {
                    const imageJson = JSON.parse(imageBuffer.trim());
                    console.log("Image JSON reçue et convertie:", imageJson);
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
                isInImage = false;
                imageBuffer = "";
            } else {
                imageBuffer += decodedValue;
            }
            continue;
        }

        // Handling related questions buffering until <RELATED_QUESTIONS_END> is detected
        if (isInRelatedQuestions) {
            console.log("Accumulation des related questions JSON en cours...");
            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                relatedQuestionsBuffer += decodedValue.split("<RELATED_QUESTIONS_END>")[0];
                try {
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer.trim());
                    console.log("Related Questions JSON reçues et converties:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
                isInRelatedQuestions = false;
                relatedQuestionsBuffer = "";
            } else {
                relatedQuestionsBuffer += decodedValue;
            }
            continue;
        }

        // Handling waiting buffering until <ANSWER_WAITING_END> is detected
        if (isInWaiting) {
            console.log("Accumulation du waiting JSON en cours...");
            if (decodedValue.includes("<ANSWER_WAITING_END>")) {
                waitingBuffer += decodedValue.split("<ANSWER_WAITING_END>")[0];
                try {
                    const waitingJson = JSON.parse(waitingBuffer.trim());
                    console.log("Waiting JSON reçu et converti:", waitingJson);
                    yield waitingJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du waiting JSON:", err);
                }
                isInWaiting = false;
                waitingBuffer = "";
            } else {
                waitingBuffer += decodedValue;
            }
            continue;
        }

        // If not processing documents, images, waiting, or related questions, process regular text chunks
        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        if (newPartialChunk) {
            console.log("Nouveau fragment partiel de texte:", newPartialChunk);
            yield [newPartialChunk as StreamOutput<T>];
        }

        if (completedChunk) {
            console.log("Chunk JSON complet reçu:", completedChunk);
            yield [completedChunk];
        }

        previousPartialChunk = newPartialChunk;
    }

    console.log("Fin du traitement du flux");
}










/*
//NOUVEAU FONCTION POUR GÉRER MAINTENANT TAK EN PLUS DU RESTE
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let isInDocument = false;
    let documentBuffer = "";
    let isInRelatedQuestions = false;
    let isInImage = false;
    let isInAnswerTAK = false;
    let imageBuffer = "";
    let relatedQuestionsBuffer = "";
    let answerTAKBuffer = "";
    let previousPartialChunk: string | null = null;

    console.log("Début du traitement du flux");

    while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) {
            console.log("Lecture du flux terminée");

            // Handle remaining buffered content for documents, images, related questions, or answer_TAK
            if (isInDocument && documentBuffer) {
                try {
                    const documentJson = JSON.parse(documentBuffer);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON à la fin du flux:", err);
                }
                documentBuffer = "";
                isInDocument = false;
            }

            if (isInImage && imageBuffer) {
                try {
                    const imageJson = JSON.parse(imageBuffer);
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON à la fin du flux:", err);
                }
                imageBuffer = "";
                isInImage = false;
            }

            if (isInRelatedQuestions && relatedQuestionsBuffer) {
                try {
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer);
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON à la fin du flux:", err);
                }
                relatedQuestionsBuffer = "";
                isInRelatedQuestions = false;
            }

            if (isInAnswerTAK && answerTAKBuffer) {
                try {
                    const answerTAKJson = JSON.parse(answerTAKBuffer);
                    yield answerTAKJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de answer_TAK JSON à la fin du flux:", err);
                }
                answerTAKBuffer = "";
                isInAnswerTAK = false;
            }

            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Chunk brut reçu:", decodedValue);

        // Detection and processing of <JSON_DOCUMENT_START> and <JSON_DOCUMENT_END>
        if (decodedValue.includes("<JSON_DOCUMENT_START>")) {
            isInDocument = true;
            documentBuffer = decodedValue.split("<JSON_DOCUMENT_START>")[1].split("<JSON_DOCUMENT_END>")[0];

            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                try {
                    const documentJson = JSON.parse(documentBuffer);
                    yield documentJson;
                    isInDocument = false;
                    documentBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <IMAGE_DATA> and <IMAGE_DATA_END>
        if (decodedValue.includes("<IMAGE_DATA>")) {
            isInImage = true;
            imageBuffer = decodedValue.split("<IMAGE_DATA>")[1].split("<IMAGE_DATA_END>")[0];

            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                try {
                    const imageJson = JSON.parse(imageBuffer);
                    yield imageJson;
                    isInImage = false;
                    imageBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <RELATED_QUESTIONS> and <RELATED_QUESTIONS_END>
        if (decodedValue.includes("<RELATED_QUESTIONS>")) {
            isInRelatedQuestions = true;
            relatedQuestionsBuffer = decodedValue.split("<RELATED_QUESTIONS>")[1].split("<RELATED_QUESTIONS_END>")[0];

            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                try {
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer);
                    yield relatedQuestionsJson;
                    isInRelatedQuestions = false;
                    relatedQuestionsBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <ANSWER_TAK> and <ANSWER_TAK_END>
        if (decodedValue.includes("<ANSWER_TAK>")) {
            isInAnswerTAK = true;
            answerTAKBuffer = decodedValue.split("<ANSWER_TAK>")[1].split("<ANSWER_TAK_END>")[0];

            if (decodedValue.includes("<ANSWER_TAK_END>")) {
                try {
                    const answerTAKJson = JSON.parse(answerTAKBuffer);
                    yield answerTAKJson;
                    isInAnswerTAK = false;
                    answerTAKBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de answer_TAK JSON:", err);
                }
            }
            continue;
        }

        // Buffer handling for documents, images, related questions, and answer_TAK
        if (isInDocument) {
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                documentBuffer += decodedValue.split("<JSON_DOCUMENT_END>")[0];
                try {
                    const documentJson = JSON.parse(documentBuffer.trim());
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
                isInDocument = false;
                documentBuffer = "";
            } else {
                documentBuffer += decodedValue;
            }
            continue;
        }

        if (isInImage) {
            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                imageBuffer += decodedValue.split("<IMAGE_DATA_END>")[0];
                try {
                    const imageJson = JSON.parse(imageBuffer.trim());
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
                isInImage = false;
                imageBuffer = "";
            } else {
                imageBuffer += decodedValue;
            }
            continue;
        }

        if (isInRelatedQuestions) {
            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                relatedQuestionsBuffer += decodedValue.split("<RELATED_QUESTIONS_END>")[0];
                try {
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer.trim());
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
                isInRelatedQuestions = false;
                relatedQuestionsBuffer = "";
            } else {
                relatedQuestionsBuffer += decodedValue;
            }
            continue;
        }

        if (isInAnswerTAK) {
            if (decodedValue.includes("<ANSWER_TAK_END>")) {
                answerTAKBuffer += decodedValue.split("<ANSWER_TAK_END>")[0];
                try {
                    const answerTAKJson = JSON.parse(answerTAKBuffer.trim());
                    yield answerTAKJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de answer_TAK JSON:", err);
                }
                isInAnswerTAK = false;
                answerTAKBuffer = "";
            } else {
                answerTAKBuffer += decodedValue;
            }
            continue;
        }

        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        if (newPartialChunk) {
            yield [newPartialChunk as StreamOutput<T>];
        }

        if (completedChunk) {
            yield [completedChunk];
        }

        previousPartialChunk = newPartialChunk;
    }

    console.log("Fin du traitement du flux");
}
*/



